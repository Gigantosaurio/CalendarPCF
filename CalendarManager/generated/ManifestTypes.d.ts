/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    datasource: ComponentFramework.PropertyTypes.StringProperty;
    userid: ComponentFramework.PropertyTypes.StringProperty;
    admin: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    darkMode: ComponentFramework.PropertyTypes.TwoOptionsProperty;
}
export interface IOutputs {
    newrecords?: string;
    deletedrecords?: string;
}
