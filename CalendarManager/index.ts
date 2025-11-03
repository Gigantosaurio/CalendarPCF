import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { CalendarioAnual } from "./component";
import * as React from "react";

export class CalendarManager implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;
    private datasource: string | undefined;
    private admin: boolean | undefined;
    private userid: string | undefined;
    private newrecords: string | undefined;
    private deletedrecords: string | undefined;
    private darkMode: boolean | undefined;
    /**
     * Empty constructor.
     */
    constructor() {
        // Empty
    }

    /**np
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     * @returns ReactElement root react element for the control
     */
    /*public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        return React.createElement(
            CalendarioAnual, { context }
        );
    }*/

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        // Leer el valor actual del JSON desde Power Apps
        this.datasource = context.parameters.datasource?.raw || "";
        this.admin = context.parameters.admin?.raw || false;
        this.userid = context.parameters.userid?.raw || "";
        this.darkMode = context.parameters.darkMode?.raw || false;
        //alert("Dark Mode: " + this.darkMode);

        // Render del componente React
        return React.createElement(CalendarioAnual, {
            datasource: this.datasource ? JSON.parse(this.datasource) : [],
            admin: this.admin,
            userid: this.userid,
            darkMode: this.darkMode,
            onRecordsChange: (newRecords: any, deletedrecords: any) => {
                // Convertir a string JSON y guardar localmente
                this.newrecords = JSON.stringify(newRecords);
                this.deletedrecords = JSON.stringify(deletedrecords);

                // Notificar a Power Apps que hay nuevos outputs
                this.notifyOutputChanged();
            }
        });
    }
    

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return {
            newrecords: this.newrecords,
            deletedrecords: this.deletedrecords
        };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}



//FORMULA POWER APPS PARA GUARDAR CAMBIOS EN DATAVERSE
/*
UpdateContext(
    {
        new_records: Self.newrecords,
        deleted_records: Self.deletedrecords
    }
);
ForAll(
    ParseJSON(new_records) As new,
    With(
        {
            DíaValue: Value(new.day),
            MesValue: Value(new.month)+1,
            AñoValue: Value(new.year)
        },
        Patch(
            Calendars,
            If(
                IsBlank(LookUp(Calendars, Día = DíaValue And Mes = MesValue And Año = AñoValue And Usuario.'Nombre completo' = User().FullName )),
                Defaults(Calendars),
                LookUp(Calendars, Día = DíaValue And Mes = MesValue And Año = AñoValue And Usuario.'Nombre completo' = User().FullName )
            ),
            {
                Usuario: LookUp(Usuarios, 'Nombre completo' = User().FullName),
                Fecha: DateTime(AñoValue,MesValue,DíaValue,12,0,0),
                Mes: MesValue,
                Año: AñoValue,
                'Tipo Ausencia': Switch(
                    PlainText(new.type),
                    "D",
                    Ausencias.'Día Debido',
                    "FD",
                    Ausencias.'Días de Libre Disposición',
                    "F",
                    Ausencias.Formación,
                    "US",
                    Ausencias.'Colaboración con la US',
                    "CM",
                    Ausencias.'Reunión cliente',
                    "CE",
                    Ausencias.'Compensados NTT DATA Centers',
                    "OP",
                    Ausencias.'Cargado a otro proyecto o staff',
                    "WE",
                    Ausencias.'Fin Semana',
                    "BH",
                    Ausencias.Festivo,
                    "H",
                    Ausencias.'Vacaciones Confirmadas',
                    "C",
                    Ausencias.'Navidad / S. Santa',
                    "B",
                    Ausencias.Baja,
                    "MI",
                    Ausencias.'Visita médico',
                    "P",
                    Ausencias.'PaP Nocturno',
                    "LA",
                    Ausencias.'Ausencia Legal',
                    "PC",
                    Ausencias.'Salida de Proyecto',
                    "HP",
                    Ausencias.'Vacaciones NO Confirmadas'
                )
            }
        )
    )
);
ForAll(
    ParseJSON(deleted_records) As deleted,
    With(
        {
            Id: GUID(deleted.guid)
        },
        Remove(Calendars,LookUp(Calendars, Calendar = Id))
    )
);
ClearCollect(
    Calendar,
    ShowColumns(
        AddColumns(
            Filter(Calendars, Usuario.'Nombre completo' = User().FullName) As item,
            guid, item.Calendar,
            day, Day(item.Fecha),
            month, item.Mes - 1,
            year, item.Año,
            type, Text(item.'Tipo Ausencia'),
            username, item.Usuario.'Nombre completo',
            userid, item.Usuario.Usuario
        ),
        guid,
        day,
        month,
        year,
        type,
        username,
        userid
    )
);
Set(json,JSON(Calendar,JSONFormat.IncludeBinaryData))
*/ 

