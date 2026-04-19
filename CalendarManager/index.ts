import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { CalendarioAnual } from "./component";
import * as React from "react";

export class CalendarManager implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;
    private admin: boolean | undefined;
    private userid: string | undefined;
    private newrecords: string | undefined;
    private deletedrecords: string | undefined;
    private darkMode: boolean | undefined;
    private absencePanel: boolean | undefined;

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
    //  Lectura genérica de DataSet
    // ──────────────────────────────────────────────

    /**
     * Lee filas del DataSet.
     * @param probeCols — columnas extra a intentar leer directamente (útil cuando
     *                    Canvas Apps no expone las columnas del SP list en dataset.columns)
     */
    private readDatasetRows(
        dataset: ComponentFramework.PropertyTypes.DataSet,
        probeCols: string[] = []
    ): any[] {
        if (dataset.loading) return [];

        // Pedir todas las páginas
        if (dataset.paging && dataset.paging.hasNextPage) {
            dataset.paging.loadNextPage();
        }

        const rows: any[] = [];
        // Filtrar columnas sin nombre (property-sets no mapeados devuelven name=null)
        const columns = dataset.columns.filter((col) => col.name != null);

        dataset.sortedRecordIds.forEach((id) => {
            const record = dataset.records[id];
            const row: any = { _recordId: id };

            // 1) Leer columnas oficiales del dataset
            columns.forEach((col) => {
                row[col.name] = record.getValue(col.name);
                row[`_fmt_${col.name}`] = record.getFormattedValue(col.name);
            });

            // 2) Probar columnas conocidas por nombre (fallback para Canvas Apps)
            for (const colName of probeCols) {
                if (row[colName] !== undefined) continue; // ya leída
                try {
                    const val = record.getValue(colName);
                    row[colName] = val;
                    row[`_fmt_${colName}`] = record.getFormattedValue(colName);
                } catch (_e) {
                    // La columna no existe en este record — ignorar
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
    //  Helpers de conversión
    // ──────────────────────────────────────────────

    /** Parsea un valor numérico que puede venir como string "10.000000000000" o como number */
    private parseNum(value: any): number {
        if (value === null || value === undefined) return 0;
        if (typeof value === "number") return Math.round(value);
        return Math.round(parseFloat(String(value))) || 0;
    }

    /** Devuelve el primer valor no-null/undefined/vacío de entre varias claves de un objeto */
    private pick(obj: any, ...keys: string[]): any {
        for (const k of keys) {
            const v = obj[k];
            if (v !== null && v !== undefined && v !== "") return v;
        }
        return null;
    }

    // ──────────────────────────────────────────────
    //  Remapeo SPCalendar → formato interno
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

    // ──────────────────────────────────────────────
    //  Remapeo SPFestivo → formato interno
    // ──────────────────────────────────────────────
    //  Intenta leer con nombres de SharePoint Y con nombres de property-set (g_*)

    private remapGlobalAbsenceRow(raw: any): any {
        let day = 0, month = 0, year = 0;

        // Buscar la fecha: SharePoint="Fecha", property-set="g_fecha"
        const fecha = this.pick(raw, "Fecha", "g_fecha", "_fmt_Fecha", "_fmt_g_fecha");
        if (fecha) {
            const d = new Date(fecha);
            if (!isNaN(d.getTime())) {
                day = d.getDate();
                month = d.getMonth(); // 0-indexed
                year = d.getFullYear();
            }
        }

        // Buscar tipo: SharePoint="Tipo_x0020_Ausencia", property-set="g_tipo"
        const tipoAusencia = String(
            this.pick(raw,
                "_fmt_Tipo_x0020_Ausencia", "Tipo_x0020_Ausencia",
                "_fmt_g_tipo", "g_tipo"
            ) || ""
        ).trim();

        // Buscar ID: SharePoint="ID", property-set="g_id"
        const guid = String(
            this.parseNum(this.pick(raw, "ID", "g_id")) || raw["_recordId"] || ""
        );

        return { guid, day, month, year, type: tipoAusencia };
    }

    // ──────────────────────────────────────────────
    //  updateView
    // ──────────────────────────────────────────────

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        this.admin = context.parameters.admin?.raw || false;
        this.userid = context.parameters.userid?.raw || "";
        this.darkMode = context.parameters.darkMode?.raw || false;
        this.absencePanel = context.parameters.absencePanel?.raw || false;

        // ── DataSet principal (SPCalendar) ──
        const dsMain = context.parameters.datasource;
        const rawMainRows = this.readDatasetRows(dsMain);
        const mainColumnInfo = this.getDatasetColumnInfo(dsMain);
        const mappedDatasource = rawMainRows.map((r) => this.remapDatasourceRow(r));

        // ── DataSet global absences (SPFestivo) ──
        //    Probar columnas de SharePoint directamente por nombre
        const dsGlobal = context.parameters.globalabsences;
        const rawGlobalRows = this.readDatasetRows(dsGlobal, [
            "ID", "Fecha", "Tipo_x0020_Ausencia", "Oficina"
        ]);
        const globalColumnInfo = this.getDatasetColumnInfo(dsGlobal);
        const mappedGlobalAbsences = rawGlobalRows.map((r) => this.remapGlobalAbsenceRow(r));

        // Render del componente React
        return React.createElement(CalendarioAnual, {
            datasource: mappedDatasource,
            globalabsences: mappedGlobalAbsences,
            admin: this.admin,
            userid: this.userid,
            darkMode: this.darkMode,
            absencePanel: this.absencePanel,
            // Debug: datos crudos + metadata de ambos datasets
            debugRawData: rawMainRows,
            debugColumnNames: dsMain.columns.map((c) => c.name),
            debugColumnInfo: mainColumnInfo,
            debugMappedData: mappedDatasource,
            debugGlobalRaw: rawGlobalRows,
            debugGlobalColumnInfo: globalColumnInfo,
            debugMappedGlobal: mappedGlobalAbsences,
            onRecordsChange: (newRecords: any, deletedrecords: any) => {
                this.newrecords = JSON.stringify(newRecords);
                this.deletedrecords = JSON.stringify(deletedrecords);
                this.notifyOutputChanged();
            }
        });
    }

    public getOutputs(): IOutputs {
        return {
            newrecords: this.newrecords,
            deletedrecords: this.deletedrecords
        };
    }

    public destroy(): void {
        // Cleanup
    }
}
