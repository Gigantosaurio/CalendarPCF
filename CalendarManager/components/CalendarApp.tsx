import * as React from "react";
import { AnnualView } from "./AnnualView";
import { MonthlyView } from "./MonthlyView";
import { SummaryView } from "./SummaryView";
import { AdminDashboard } from "./AdminDashboard";
import "../css/CalendarApp.css";

type View = "annual" | "monthly" | "summary" | "admin";

interface CalendarAppProps {
  datasource: any[]; // Lista de eventos que viene del Canvas
  globalabsences: any[]; // Lista de ausencias globales que viene del Canvas
  admin: boolean; // Indica si el usuario es admin
  userid: string; // ID del usuario actual
  darkMode: boolean; // Indica si el modo oscuro está activado
  absencePanel: boolean; // Indica si el panel de ausencias está a la izquierda o derecha
  onSave: (event: any) => void; // Actualizar un evento
  onDelete: (event: any) => void; // Eliminar un evento
}

export const CalendarApp: React.FC<CalendarAppProps> = ({
  datasource,
  globalabsences,
  admin,
  userid,
  darkMode,
  absencePanel,
  onSave,
  onDelete
}) => {
  const [currentView, setCurrentView] = React.useState<View>("annual");
  const [selectedMonth, setSelectedMonth] = React.useState<number>(0);
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  const [selectedUserId, setSelectedUserId] = React.useState<string>(userid);

  const goToMonth = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setCurrentView("monthly");
  };

  // Determinar si estamos viendo el calendario de otro usuario
  const isViewingOtherUser = admin && selectedUserId !== userid;

  // Obtener nombre del usuario visualizado
  const viewedUserName = React.useMemo(() => {
    if (!isViewingOtherUser) return "";
    const record = datasource.find(d => d.userid === selectedUserId);
    return record ? record.username : selectedUserId; // Fallback al ID si no encuentra nombre
  }, [datasource, selectedUserId, isViewingOtherUser]);

  return (
    <div className={`calendar-app-container ${darkMode ? "dark-mode" : ""}`}>
      {/* Banner de Admin View Mode */}
      {isViewingOtherUser && (
        <div className="admin-banner">
          <span>
            👁️ {viewedUserName}
          </span>
          <button onClick={() => {
            setSelectedUserId(userid);
            setCurrentView("annual");
          }}>
            Salir
          </button>
        </div>
      )}

      {currentView === "annual" && (
        <AnnualView
          year={selectedYear}
          admin={admin}
          isDarkMode={darkMode}
          onSelectMonth={goToMonth}
          onViewSummary={() => setCurrentView("summary")}
          onAdminDashboard={() => setCurrentView("admin")}
        />
      )}

      {currentView === "monthly" && (
        <MonthlyView
          month={selectedMonth}
          year={selectedYear}
          datasource={datasource}
          globalabsences={globalabsences}
          userid={(selectedUserId ? selectedUserId : userid)}
          isDarkMode={darkMode}
          absencePanel={absencePanel}
          onBack={() => setCurrentView("annual")}
          onSave={onSave}
          onDelete={onDelete}
        />
      )}

      {currentView === "summary" && (
        <SummaryView
          onBack={() => setCurrentView("annual")}
          userid={userid}
          datasource={datasource}
        //isDarkMode={darkMode}
        />
      )}

      {currentView === "admin" && (
        <AdminDashboard
          datasource={datasource}
          //isDarkMode={darkMode}
          onBack={() => setCurrentView("annual")}
          onAdminMonthlyView={(userid: string) => {
            setSelectedUserId(userid);
            setCurrentView("monthly")
          }}
        />
      )}
    </div>
  );
};