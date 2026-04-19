/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    userid: ComponentFramework.PropertyTypes.StringProperty;
    admin: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    darkMode: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    absencePanel: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    datasource: ComponentFramework.PropertyTypes.DataSet;
    globalabsences: ComponentFramework.PropertyTypes.DataSet;
}
export interface IOutputs {
    newrecords?: string;
    deletedrecords?: string;
}
