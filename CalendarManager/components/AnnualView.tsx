import * as React from "react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaChartPie, FaUserShield } from "react-icons/fa";
import "../css/AnnualView.css"; // Ruta corregida a la original

// --- PROPS ---
interface AnnualViewProps {
  year: number;
  admin: boolean;
  isDarkMode: boolean; // Prop para el modo oscuro
  onSelectMonth: (month: number, year: number) => void;
  onViewSummary: () => void;
  onAdminDashboard: () => void;
}

// --- COMPONENTE PRINCIPAL ---
export const AnnualView: React.FC<AnnualViewProps> = ({
  year,
  admin,
  isDarkMode,
  onSelectMonth,
  onViewSummary,
  onAdminDashboard
}) => {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const [currentYear, setCurrentYear] = React.useState(year);

  // Sincroniza el estado interno si la prop 'year' cambia
  React.useEffect(() => {
    setCurrentYear(year);
  }, [year]);

  const handlePrevYear = () => setCurrentYear(prev => prev - 1);
  const handleNextYear = () => setCurrentYear(prev => prev + 1);

  // Define la clase del wrapper para aplicar el modo
  const wrapperClass = isDarkMode ? "annual-view-wrapper dark-mode" : "annual-view-wrapper";

  return (
    <div className={wrapperClass}>
      {/* El div del contenedor ahora usa las variables CSS */}
      <div className="annual-container">
        
        <div className="annual-header">
          <button className="year-nav" onClick={handlePrevYear} aria-label="Año anterior">
            <FaChevronLeft />
          </button>
          <h2 className="year-title">{currentYear}</h2>
          <button className="year-nav" onClick={handleNextYear} aria-label="Año siguiente">
            <FaChevronRight />
          </button>
        </div>

        <div className="months-grid">
          {months.map((month, i) => (
            <div
              key={month}
              className="month-card"
              onClick={() => onSelectMonth(i, currentYear)}
              role="button"
              tabIndex={0}
            >
              <div className="month-icon">
                <FaCalendarAlt />
              </div>
              <div className="month-name">{month}</div>
            </div>
          ))}
        </div>

        <div className="annual-footer">
          <button className="footer-btn summary-btn" onClick={onViewSummary}>
            <FaChartPie /> Ver resumen
          </button>

          {admin && (
            <button className="footer-btn admin-btn" onClick={onAdminDashboard}>
              <FaUserShield /> Admin Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Exporta el componente como default
export default AnnualView;

