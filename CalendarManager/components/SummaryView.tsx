import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { AbsenceType } from "../types/absence";
import "../css/SummaryView.css";

export interface AbsenceRecord {
  guid: string;
  day: number;
  month: number;
  year: number;
  type: AbsenceType;
  userid: string;
}

interface SummaryViewProps {
  onBack: () => void;
  userid: string;
  datasource: AbsenceRecord[];
  darkMode?: boolean; // 👈 añadimos el modo oscuro
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  onBack,
  userid,
  datasource,
  darkMode = false,
}) => {
  const COLORS = ["#42a5f5", "#66bb6a", "#ffb74d", "#e57373", "#9575cd", "#4caf50", "#ff8a65"];

  // ---- Filtrar por usuario ----
  datasource = datasource.filter((rec) => rec.userid === userid);

  // ---- Agrupar por tipo ----
  const typeMap: Record<string, number> = {};
  datasource.forEach((rec) => {
    if (rec.type) {
      typeMap[rec.type] = (typeMap[rec.type] || 0) + 1;
    }
  });
  const absenceData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  // ---- Agrupar por mes ----
  const monthNames = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const monthMap: Record<number, number> = {};
  for (let i = 0; i < 12; i++) monthMap[i] = 0;
  datasource.forEach((rec) => {
    if (rec.type) monthMap[rec.month] = (monthMap[rec.month] || 0) + 1;
  });
  const monthData = monthNames.map((mes, i) => ({ mes, total: monthMap[i] }));

  // ---- Totales ----
  const totalAbsences = datasource.filter((rec) => rec.type).length;

  return (
    <div className={`summary-container ${darkMode ? "dark-mode" : ""}`}>
      <h2 className="summary-title">Resumen de Ausencias</h2>

      <div className="summary-grid">
        {/* Distribución por tipo */}
        <div className="summary-card">
          <h3 className="card-title">Distribución por tipo</h3>
          <div className="chart-container chart-taller">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={absenceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={false}
                >
                  {absenceData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ausencias por mes */}
        <div className="summary-card">
          <h3 className="card-title">Ausencias por mes</h3>
          <div className="chart-container chart-taller">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#42a5f5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Totales del año */}
        <div className="summary-card summary-card-wide">
          <h3 className="card-title">Totales del año</h3>
          <div className="summary-stats-grid">
            <div className="summary-stat">
              <span className="stat-label">Total de ausencias</span>
              <span className="stat-value">{totalAbsences}</span>
            </div>

            {absenceData.map((t, i) => (
              <div key={i} className="summary-stat">
                <span className="stat-label">{t.name}</span>
                <span className="stat-value">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="summary-footer">
        <button className="back-btn" onClick={onBack}>
          ⬅ Volver
        </button>
      </div>
    </div>
  );
};
