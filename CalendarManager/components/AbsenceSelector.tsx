import * as React from "react";
import "../css/AbsenceSelector.css";
import { AbsenceType, AbsenceDescriptions, AbsenceColors } from "../types/absence";

interface AbsenceSelectorProps {
  isDarkMode: boolean;
  onAssign: (type: AbsenceType) => void;
  onDelete: () => void;
}

export const AbsenceSelector: React.FC<AbsenceSelectorProps> = ({ isDarkMode, onAssign, onDelete }) => {
  const absenceTypesNoFiltered = Object.keys(AbsenceDescriptions) as AbsenceType[];
  // eliminamos el tipo de ausencia vacaciones confirmadas ya que estas no se pueden asignar desde el selector
  // Tampoco mostramos Festivos (BH) en el selector, petición del usuario (pero mantenemos soporte interno)
  const absenceTypes = absenceTypesNoFiltered.filter(type => type !== "HP" && type !== "BH");

  return (
    <div className={`absence-selector ${isDarkMode ? "dark-mode" : ""}`}>
      <h4 className="absence-selector-title">Seleccionar tipo de ausencia</h4>

      <div className="absence-grid">
        {absenceTypes.map(type => (
          <button
            key={type}
            title={AbsenceDescriptions[type]}
            className="absence-btn"
            style={{
              backgroundColor: AbsenceColors[type] + 95,
            }}
            onClick={() => {
              if (type === "") {
                onDelete();
                // Si se selecciona Vacaciones, en lugar de asignar, asignamos vacaciones pdte aprobación
              } else if (type === "H") {
                onAssign("HP");
              } else {
                onAssign(type);
              }
            }}
          >
            <span
              style={{
                backgroundColor: AbsenceColors[type],
              }}
              className="absence-code">
              {type}
            </span>
            <span className="absence-label">{AbsenceDescriptions[type]}</span>
          </button>
        ))}
      </div>

      <div className="absence-footer">
        <button className="delete-btn" onClick={onDelete}>
          🗑 Borrar selección
        </button>
      </div>
    </div>
  );
};
