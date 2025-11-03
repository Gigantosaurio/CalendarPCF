import * as React from "react";
import { CalendarApp } from "./CalendarApp";
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
import "../css/AdminDashboard.css";

export interface AbsenceRecordAdmin {
  guid: string;
  day: number;
  month: number;
  year: number;
  type: string;
  userid: string;
  username: string;
}

interface SummaryAdminViewProps {
  datasource: AbsenceRecordAdmin[];
  onBack: () => void;
  onAdminMonthlyView: (userid: string) => void;
}

export const AdminDashboard: React.FC<SummaryAdminViewProps> = ({ datasource, onBack, onAdminMonthlyView }) => {
  const [yearFilter, setYearFilter] = React.useState<number | "all">("all");
  const [userFilter, setUserFilter] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const filteredData = datasource
    .filter(d =>
      (yearFilter === "all" || d.year === yearFilter) &&
      (userFilter === "all" || d.userid === userFilter)
    )
    .filter(d => d.type && d.type !== "");

  const users = Array.from(new Map(
    datasource.map(d => [d.userid, d.username])
  ).entries()).map(([userid, username]) => ({ userid, username }));

  const absenceTypes = Array.from(new Set(datasource.map(d => d.type).filter(t => t && t !== "")));

  const COLORS = ["#42a5f5","#66bb6a","#ffb74d","#e57373","#9575cd","#4db6ac","#f06292","#ffd54f","#a1887f"];
  const typeColorMap: Record<string, string> = {};
  absenceTypes.forEach((t, i) => typeColorMap[t] = COLORS[i % COLORS.length]);

  const groupedData: Record<string, Record<string, number | string>> = {};
  filteredData.forEach(d => {
    if (!groupedData[d.userid]) groupedData[d.userid] = {};
    groupedData[d.userid][d.type] = (groupedData[d.userid][d.type] as number || 0) + 1;
    groupedData[d.userid]["username"] = String(d.username);
    groupedData[d.userid]["userid"] = String(d.userid);
  });

  const tableData = Object.values(groupedData) as { username: string; [type: string]: number | string; userid: string }[];
  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const paginatedData = tableData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const pieData = absenceTypes.map(t => ({
    name: t,
    value: filteredData.filter(d => d.type === t).length
  })).filter(d => d.value > 0);

  const monthData: { mes: string; total: number }[] = Array.from({ length: 12 }, (_, i) => ({
    mes: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][i],
    total: filteredData.filter(d => d.month === i).length
  }));

  return (
    <div className="summary-admin-container">
      <h2 className="summary-title">Dashboard Admin</h2>

      {/* Gráficos */}
      <div className="charts-grid">
        <div className="summary-card">
          <h3 className="card-title">Distribución por tipo</h3>
          <div className="chart-container chart-taller">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false}>
                  {pieData.map((d, i) => <Cell key={i} fill={typeColorMap[d.name]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

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
      </div>

      {/* Controles + Filtros en una sola línea */}
      <div className="table-controls-row">
        <div className="pagination-controls-inline">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>⬅</button>
          <span>Página {currentPage} de {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>➡</button>

          <select
            value={rowsPerPage}
            onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          >
            {[5, 10, 20].map(n => <option key={n} value={n}>{n} por página</option>)}
          </select>
        </div>

        <div className="filters-inline-row">
          <div className="filter-item">
            Año:
            <select
              value={yearFilter}
              onChange={e => {
                setYearFilter(e.target.value === "all" ? "all" : Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="all">Todos</option>
              {Array.from(new Set(datasource.map(d => d.year))).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            Usuario:
            <select
              value={userFilter}
              onChange={e => {
                setUserFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Todos</option>
              {users.map(u => (
                <option key={u.userid} value={u.userid}>{u.username}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-wrapper">
        <div
          className={`table-scroll ${absenceTypes.length >= 3 ? "scroll-horizontal" : ""} ${paginatedData.length >= 6 ? "scroll-vertical" : ""}`}
          style={{ "--num-columns": absenceTypes.length + 1 } as React.CSSProperties}
        >
          <table
            className="summary-table"
            style={{
              minWidth: absenceTypes.length >= 5 ? `${120 * (absenceTypes.length + 1)}px` : "100%"
            }}
          >
            <thead>
              <tr>
                <th>Usuario</th>
                {absenceTypes.map((t, i) => <th key={i}>{t}</th>)}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((u, i) => (
                <tr
                  key={i}
                  onClick={() => {
                    if (userFilter === "all") {
                      setUserFilter(String(u.userid));
                      setCurrentPage(1);
                    } else {
                      setUserFilter("all");
                      setCurrentPage(1);
                    }
                  }}
                  className="table-row-hover"
                >
                  <td>{u.username}</td>
                  {absenceTypes.map((t, j) => (
                    <td key={j}>{u[t] || 0}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="summary-footer">
        <button className="back-btn" onClick={onBack}>⬅ Volver</button>
      </div>

      {/* Creamos un boton que se mostrara si el userFilter no es "all" y al darle al boton navegaremos al calendario de ese user */}
      {userFilter !== "all" && (
        <div className="summary-footer">
          <button className="back-btn" onClick={() => onAdminMonthlyView(userFilter)}>Ver Calendario</button>
        </div>
      )}

    </div>
  );
};
