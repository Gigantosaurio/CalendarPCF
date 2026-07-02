import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { CalendarioAnual } from "./component";
import * as React from "react";

export class CalendarManager implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;

    private admin: boolean = false;
    private userid: string = "";
    private darkMode: boolean = false;
    private absencePanel: boolean = false;
    private showDebug: boolean = false;

    // Caché local de outputs: fuente de verdad para getOutputs()
    private newrecords: string | null = null;
    private deletedrecords: string | null = null;
    private currentUser: string | null = null;
    private event: string | null = null;
    private currentDatasource: any[] = [];
    private allowPastEdition: boolean = false;

    constructor() {
        // Empty
    }

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
    }

    // ──────────────────────────────────────────────
    // Handlers
    // ──────────────────────────────────────────────

    private handleRecordsChange = (newRecords: any, deletedRecords: any): void => {
        const nextNewRecords = JSON.stringify(newRecords);
        const nextDeletedRecords = JSON.stringify(deletedRecords);

        const hasChanged =
            this.newrecords !== nextNewRecords ||
            this.deletedrecords !== nextDeletedRecords;

        if (!hasChanged) return;

        this.newrecords = nextNewRecords;
        this.deletedrecords = nextDeletedRecords;

        // Cambiar tipo de evento a "pastRecordsChanged" si hay modificaciones en meses pasados y la propiedad está activa.
        const ALLOW_PAST_EVENT_TYPE = this.allowPastEdition;
        let isPastModification = false;

        if (ALLOW_PAST_EVENT_TYPE) {
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth(); // 0 = enero

            const isPast = (y: number, m: number) => y < currentYear || (y === currentYear && m < currentMonth);

            const anyNewInPast = Array.isArray(newRecords) && newRecords.some((r: any) => isPast(r.year, r.month));
            const anyDeletedInPast = Array.isArray(deletedRecords) && deletedRecords.some((del: any) => {
                const matched = this.currentDatasource?.find((r: any) => String(r.guid) === String(del.guid));
                return matched && isPast(matched.year, matched.month);
            });

            isPastModification = anyNewInPast || anyDeletedInPast;
        }

        this.event = isPastModification ? "pastRecordsChanged" : "recordsChanged";

        this.notifyOutputChanged();
    };

    // Llamada desde Admin Dashboard / CalendarApp cuando se cambia el usuario visualizado.
    // Power Apps puede leer Self.currentUser de forma reactiva para filtrar festivos regionales.
    private handleCurrentUserChange = (value: string | null | undefined): void => {
        const nextValue = value?.trim() ? value.trim() : null;

        if (this.currentUser === nextValue) return;

        this.currentUser = nextValue;

        // Limpiamos los registros pendientes de guardar/eliminar al cambiar de usuario
        // para que no se procesen por error en el evento OnChange de Power Apps
        this.newrecords = null;
        this.deletedrecords = null;
        this.event = "userChanged";

        this.notifyOutputChanged();
    };

    // Botón "Volver" de la pantalla principal: dispara Navigate() en Canvas
    private handleGoBack = (): void => {
        this.event = "goBack";
        this.notifyOutputChanged();
    };

    // ──────────────────────────────────────────────
    // Lectura genérica de DataSet
    // ──────────────────────────────────────────────

    private readDatasetRows(
        dataset: ComponentFramework.PropertyTypes.DataSet,
        probeCols: string[] = []
    ): any[] {
        if (dataset.loading) return [];

        if (dataset.paging && dataset.paging.hasNextPage) {
            dataset.paging.loadNextPage();
        }

        const rows: any[] = [];
        const columns = dataset.columns.filter((col) => col.name != null);

        dataset.sortedRecordIds.forEach((id) => {
            const record = dataset.records[id];
            const row: any = { _recordId: id };

            columns.forEach((col) => {
                row[col.name] = record.getValue(col.name);
                row[`_fmt_${col.name}`] = record.getFormattedValue(col.name);
            });

            for (const colName of probeCols) {
                if (row[colName] !== undefined) continue;
                try {
                    const val = record.getValue(colName);
                    row[colName] = val;
                    row[`_fmt_${colName}`] = record.getFormattedValue(colName);
                } catch (_e) {
                    // Ignorar columna inexistente
                }
            }

            rows.push(row);
        });

        return rows;
    }

    private getDatasetColumnInfo(dataset: ComponentFramework.PropertyTypes.DataSet): any[] {
        return dataset.columns.map((col) => ({
            name: col.name,
            alias: col.alias,
            displayName: col.displayName,
            dataType: col.dataType,
            order: col.order
        }));
    }

    // ──────────────────────────────────────────────
    // Helpers de conversión
    // ──────────────────────────────────────────────

    private parseNum(value: any): number {
        if (value === null || value === undefined) return 0;
        if (typeof value === "number") return Math.round(value);
        return Math.round(parseFloat(String(value))) || 0;
    }

    private pick(obj: any, ...keys: string[]): any {
        for (const k of keys) {
            const v = obj[k];
            if (v !== null && v !== undefined && v !== "") return v;
        }
        return null;
    }

    // ──────────────────────────────────────────────
    // Remapeos
    // ──────────────────────────────────────────────

    private remapDatasourceRow(raw: any): any {
        const tipoAusencia = String(
            this.pick(raw, "_fmt_Tipo_x0020_Ausencia", "Tipo_x0020_Ausencia") || ""
        ).trim();

        return {
            guid: String(this.parseNum(raw["ID"]) || raw["_recordId"] || ""),
            day: this.parseNum(raw["D_x00ed_a"]),
            month: this.parseNum(raw["Mes"]) - 1,
            year: this.parseNum(raw["A_x00f1_o"]),
            type: tipoAusencia,
            userid: raw["_fmt_Usuario"] || raw["Usuario"] || "",
            username: raw["_fmt_Usuario"] || raw["Usuario"] || ""
        };
    }

    private remapGlobalAbsenceRow(raw: any): any {
        let day = 0, month = 0, year = 0;

        const fecha = this.pick(raw, "Fecha", "g_fecha", "_fmt_Fecha", "_fmt_g_fecha");
        if (fecha) {
            const d = new Date(fecha);
            if (!isNaN(d.getTime())) {
                day = d.getDate();
                month = d.getMonth();
                year = d.getFullYear();
            }
        }

        const tipoAusencia = String(
            this.pick(
                raw,
                "_fmt_Tipo_x0020_Ausencia",
                "Tipo_x0020_Ausencia",
                "_fmt_g_tipo",
                "g_tipo"
            ) || ""
        ).trim();

        const guid = String(
            this.parseNum(this.pick(raw, "ID", "g_id")) || raw["_recordId"] || ""
        );

        return { guid, day, month, year, type: tipoAusencia };
    }

    // ──────────────────────────────────────────────
    // updateView
    // ──────────────────────────────────────────────

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        this.admin = context.parameters.admin?.raw ?? false;
        this.userid = context.parameters.userid?.raw ?? "";
        this.darkMode = context.parameters.darkMode?.raw ?? false;
        this.absencePanel = context.parameters.absencePanel?.raw ?? false;
        this.showDebug = context.parameters.showDebug?.raw ?? false;
        this.allowPastEdition = context.parameters.allowPastEdition?.raw ?? false;

        // ── DataSet principal (SPCalendar) ──
        const dsMain = context.parameters.datasource;
        const rawMainRows = this.readDatasetRows(dsMain);
        const mainColumnInfo = this.getDatasetColumnInfo(dsMain);
        const mappedDatasource = rawMainRows.map((r) => this.remapDatasourceRow(r));
        this.currentDatasource = mappedDatasource; // Guardar en caché para comprobaciones de modificaciones en el pasado

        // ── DataSet global absences (SPFestivo) ──
        const dsGlobal = context.parameters.globalabsences;
        const rawGlobalRows = this.readDatasetRows(dsGlobal, [
            "ID", "Fecha", "Tipo_x0020_Ausencia", "Oficina"
        ]);
        const globalColumnInfo = this.getDatasetColumnInfo(dsGlobal);
        const mappedGlobalAbsences = rawGlobalRows.map((r) => this.remapGlobalAbsenceRow(r));

        return React.createElement(CalendarioAnual, {
            datasource: Array.isArray(mappedDatasource) ? mappedDatasource : [],
            globalabsences: Array.isArray(mappedGlobalAbsences) ? mappedGlobalAbsences : [],
            admin: this.admin,
            userid: this.userid,
            darkMode: this.darkMode,
            absencePanel: this.absencePanel,
            showDebugButton: this.showDebug,
            allowPastEdition: this.allowPastEdition,
            debugRawData: rawMainRows,
            debugColumnNames: dsMain.columns.map((c) => c.name),
            debugColumnInfo: mainColumnInfo,
            debugMappedData: mappedDatasource,
            debugGlobalRaw: rawGlobalRows,
            debugGlobalColumnInfo: globalColumnInfo,
            debugMappedGlobal: mappedGlobalAbsences,

            onRecordsChange: this.handleRecordsChange,
            onCurrentUserChange: this.handleCurrentUserChange,
            onGoBack: this.handleGoBack
        });
    }

    public getOutputs(): IOutputs {
        return {
            newrecords: this.newrecords ?? (null as any),
            deletedrecords: this.deletedrecords ?? (null as any),
            currentUser: this.currentUser ?? (null as any),
            event: this.event ?? (null as any)
        };
    }

    public destroy(): void {
        // Cleanup
    }
}
