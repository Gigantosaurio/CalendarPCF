import * as React from "react";
import "../css/AbsenceSelector.css";
import { AbsenceType, AbsenceDescriptions, AbsenceColors } from "../types/absence";

interface AbsenceSelectorProps {
  onAssign: (type: AbsenceType) => void;
  onDelete: () => void;
}

export const AbsenceSelector: React.FC<AbsenceSelectorProps> = ({ onAssign, onDelete }) => {
  const absenceTypes = Object.keys(AbsenceDescriptions) as AbsenceType[];

  return (
    <div className="absence-selector">
      <h4 className="absence-selector-title">Seleccionar tipo de ausencia</h4>

      <div className="absence-grid">
        {absenceTypes.map(type => (
          <button
            key={type}
            title={AbsenceDescriptions[type]}
            className="absence-btn"
            style={{
              backgroundColor: AbsenceColors[type],
              color: type === "" ? "#222" : "white",
            }}
            onClick={() => {
               if (type === "") {
                 onDelete();
               } else {
                 onAssign(type);
               }
             }}
          >
            <span className="absence-code">{type}</span>
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
