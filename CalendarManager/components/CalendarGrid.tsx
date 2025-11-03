import * as React from "react";
import "../css/CalendarGrid.css";
import { AbsenceType, AbsenceColors, AbsenceDescriptions } from "../types/absence";

interface CalendarGridProps {
  year: number;
  month: number;
  absences: Record<number, string>;
  selectedDays: number[];
  onDayClick: (day: number) => void;
  onSelectRange?: (days: number[]) => void;
  darkMode?: boolean;
}

export const AbsenceTextToType: Record<string, AbsenceType> = Object.fromEntries(
  Object.entries(AbsenceDescriptions).map(([key, value]) => [value, key as AbsenceType])
);

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  year,
  month,
  absences,
  selectedDays,
  onDayClick,
  onSelectRange,
  darkMode = false
}) => {
  const [dragging, setDragging] = React.useState(false);
  const [rangeStart, setRangeStart] = React.useState<number | null>(null);

  const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfWeek = (y: number, m: number) => new Date(y, m, 1).getDay();

  const totalDays = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const leadingEmpty = Array.from({ length: (firstDay + 6) % 7 }, () => null);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const gridDays = [...leadingEmpty, ...days];

  const isWeekend = (day: number) => {
    const weekday = new Date(year, month, day).getDay();
    return weekday === 0 || weekday === 6;
  };

  // 🔒 Determinar si el mes/año está en el pasado
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0 = enero
  const isPastMonth = year < currentYear || (year === currentYear && month < currentMonth);

  const handleMouseDown = (day: number) => {
    if (isPastMonth || isWeekend(day)) return;
    setDragging(true);
    setRangeStart(day);
  };

  const handleMouseUp = () => {
    setDragging(false);
    setRangeStart(null);
  };

  const handleMouseEnter = (day: number) => {
    if (isPastMonth || !dragging || rangeStart === null || !onSelectRange) return;
    const start = Math.min(rangeStart, day);
    const end = Math.max(rangeStart, day);
    const range: number[] = [];
    for (let i = start; i <= end; i++) {
      if (!isWeekend(i)) range.push(i);
    }
    onSelectRange(range);
  };

  return (
    <div
      className={`calendar-grid ${darkMode ? "dark-mode" : ""} ${
        isPastMonth ? "disabled-month" : ""
      }`}
      onMouseLeave={handleMouseUp}
    >
      {daysOfWeek.map((d) => (
        <div key={d} className="calendar-header">
          {d}
        </div>
      ))}

      {gridDays.map((day, i) => {
        if (day === null) return <div key={i} />;

        const weekend = isWeekend(day);
        const isSelected = selectedDays.includes(day);
        const absenceType = absences[day] as AbsenceType | undefined;
        const absenceColor = absenceType
          ? AbsenceColors[AbsenceTextToType[absenceType]]
          : "var(--day-bg)";

        const classes = [
          "calendar-day",
          weekend && "weekend",
          isSelected && "selected",
          isPastMonth && "disabled-day"
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div
            key={i}
            className={classes}
            style={{
              backgroundColor: weekend ? "var(--weekend-bg)" : absenceColor,
              cursor: isPastMonth ? "not-allowed" : "pointer",
              opacity: isPastMonth ? 0.6 : 1
            }}
            onClick={() => {
              if (isPastMonth || weekend) return;
              if (isSelected) {
                onSelectRange?.(selectedDays.filter((d) => d !== day));
              } else {
                onSelectRange?.([...selectedDays, day]);
              }
              onDayClick(day);
            }}
            onMouseDown={() => !isPastMonth && !weekend && handleMouseDown(day)}
            onMouseUp={handleMouseUp}
            onMouseEnter={() => !isPastMonth && !weekend && handleMouseEnter(day)}
          >
            <div className="day-number">{day}</div>
            {absenceType && <div className="absence-text">{absenceType}</div>}
          </div>
        );
      })}
    </div>
  );
};
