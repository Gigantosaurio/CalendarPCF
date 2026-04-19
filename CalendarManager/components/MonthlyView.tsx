import * as React from "react";
import { CalendarGrid } from "./CalendarGrid";
import { AbsenceSelector } from "./AbsenceSelector";
import { AbsenceType } from "../types/absence";
import "../css/MonthlyView.css";

export interface AbsenceRecord {
  guid: string;
  day: number;
  month: number;
  year: number;
  type: AbsenceType;
  userid: string;
}

export interface DeletedAbsenceRecord {
  guid: string;
}

interface MonthlyViewProps {
  month: number;
  year: number;
  datasource: AbsenceRecord[];
  globalabsences: AbsenceRecord[];
  userid: string;
  isDarkMode: boolean;
  absencePanel: boolean;
  onBack: () => void;
  onSave?: (records: AbsenceRecord[]) => void;
  onDelete?: (records: any[]) => void;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  month,
  year,
  datasource,
  globalabsences,
  userid,
  isDarkMode,
  absencePanel,
  onBack,
  onSave,
  onDelete
}) => {
  const [selectedDays, setSelectedDays] = React.useState<number[]>([]);
  const [absences, setAbsences] = React.useState<Record<number, string>>({});
  const [globalAbsencesMap, setGlobalAbsencesMap] = React.useState<Record<number, string>>({});
  const [dayToGuid, setDayToGuid] = React.useState<Record<number, string>>({});

  React.useEffect(() => {
    const absMap: Record<number, string> = {};
    const guidMap: Record<number, string> = {};
    const userData = datasource.filter(e => e.userid === userid);
    userData.forEach(e => {
      if (e.month === month && e.year === year) {
        absMap[e.day] = e.type;
        guidMap[e.day] = e.guid;
      }
    });
    setAbsences(absMap);
    setDayToGuid(guidMap);

    const globalsMap: Record<number, string> = {};
    if (globalabsences) {
      globalabsences.forEach(e => {
        if (e.month === month && e.year === year) {
          globalsMap[e.day] = e.type;
        }
      });
    }
    setGlobalAbsencesMap(globalsMap);

  }, [datasource, month, year, userid]);

  const handleAssignAbsence = (type: AbsenceType) => {
    const newAbsences = { ...absences };
    selectedDays.forEach(day => (newAbsences[day] = type));
    setAbsences(newAbsences);

    const records: AbsenceRecord[] = selectedDays.map(day => ({
      guid: dayToGuid[day] || "",
      day,
      month,
      year,
      type,
      userid
    }));

    onSave?.(records);
    setSelectedDays([]);
  };

  const handleDeleteAbsence = () => {
    const newAbsences = { ...absences };
    selectedDays.forEach(day => delete newAbsences[day]);
    setAbsences(newAbsences);

    const records: DeletedAbsenceRecord[] = selectedDays
      .filter(day => dayToGuid[day])
      .map(day => ({ guid: dayToGuid[day] }));

    onDelete?.(records);
    setSelectedDays([]);
  };

  const monthName = new Date(year, month).toLocaleString("es-ES", {
    month: "long"
  });

  return (
    <div className={`monthly-container ${isDarkMode ? "dark" : "light"}`}>
      {/* CABECERA */}
      <div className="monthly-header">
        <button className="back-btn" onClick={onBack}>
          ⬅ Volver
        </button>
        <p className="monthly-text">
          Selecciona los días y asigna una ausencia
        </p>
        <h2 className="monthly-title">
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}
        </h2>
      </div>

      {/* CONTENIDO EN DOS COLUMNAS */}
      <div className="monthly-body">
        
        {/* Mostramos el panel de ausencias si es true, ahora forzado a if true */}
        {
          absencePanel && (
            <div className="absence-panel">
              <AbsenceSelector
                isDarkMode={isDarkMode}
                onAssign={handleAssignAbsence}
                onDelete={handleDeleteAbsence}
              />
            </div>
          )
        }
        <div className="calendar-panel">
          <CalendarGrid
            year={year}
            month={month}
            absences={absences}
            globalAbsences={globalAbsencesMap}
            selectedDays={selectedDays}
            onDayClick={() => {}}
            onSelectRange={(range) => setSelectedDays(range)}
          />
        </div>
        {
          !absencePanel && (
            <div className="absence-panel">
              <AbsenceSelector
                isDarkMode={isDarkMode}
                onAssign={handleAssignAbsence}
                onDelete={handleDeleteAbsence}
              />
            </div>
          )
        }
      </div>
    </div>
  );
};
