import * as React from "react";
import { AnnualView } from "./AnnualView";
import { MonthlyView } from "./MonthlyView";
import { SummaryView } from "./SummaryView";
import { AdminDashboard } from "./AdminDashboard";
import "../css/CalendarApp.css";

type View = "annual" | "monthly" | "summary" | "admin";

interface CalendarAppProps {
  datasource: any[]; // Lista de eventos que viene del Canvas
  admin: boolean; // Indica si el usuario es admin
  userid: string; // ID del usuario actual
  onSave: (event: any) => void; // Actualizar un evento
  onDelete: (event: any) => void; // Eliminar un evento
}

export const CalendarApp: React.FC<CalendarAppProps> = ({
  datasource,
  admin,
  userid,
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

  return (
    <div className="calendar-app-container">
      {currentView === "annual" && (
        <AnnualView
          year={selectedYear}
          admin={admin}
          isDarkMode={false}
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
          userid={(selectedUserId ? selectedUserId : userid)}
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
        />
      )}

      {currentView === "admin" && (
          <AdminDashboard
            datasource={datasource}
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