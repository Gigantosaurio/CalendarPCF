import * as React from "react";
import { CalendarApp } from "./components/CalendarApp";

interface CalendarioAnualProps {
  datasource: any[];
  admin: boolean;
  userid: string;
  darkMode: boolean;
  onRecordsChange: (newRecords: any[], deletedRecords: any[]) => void;
}

export const CalendarioAnual: React.FC<CalendarioAnualProps> = ({ datasource, admin, userid, darkMode, onRecordsChange }) => {
  return (
    <CalendarApp
      datasource={datasource} // aquí pasamos los registros que vienen del PCF
      admin={admin}
      userid={userid}
      darkMode={darkMode}
      onSave={(updatedEvents: any[]) => {
        // llamamos al callback para notificar al PCF
        onRecordsChange(updatedEvents, []);
      }}
      onDelete={(deletedRecords: any[]) => {
        // llamamos al callback para notificar al PCF
        onRecordsChange([], deletedRecords);
      }}
    />
  );
};
