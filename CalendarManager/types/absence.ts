export type AbsenceType =
  | ""   // Día Trabajado (DEFAULT)
  | "FD"  // Días de Libre Disposición
  | "F"   // Formación
  | "US"  // Colaboración con la US
  | "CM"  // Reunión cliente
  | "CE"  // Compensados NTT DATA Centers
  | "OP"  // Cargado a otro proyecto o staff
  | "WE"  // Fin Semana
  | "BH"  // Festivo
  | "H"   // Vacaciones Confirmadas
  | "C"   // Navidad / S. Santa
  | "B"   // Baja
  | "MI"  // Visita médico
  | "P"   // PaP Nocturno
  | "LA"  // Ausencia Legal
  | "D"   // Día Debido
  | "PC"  // Salida de Proyecto
  | "HP"; // Vacaciones NO Confirmadas

export const AbsenceDescriptions: Record<AbsenceType, string> = {
  "": "Día Trabajado",
  D: "Día Debido",
  FD: "Días de Libre Disposición",
  F: "Formación",
  US: "Colaboración con la US",
  CM: "Reunión cliente",
  CE: "Compensados NTT DATA Centers",
  OP: "Cargado a otro proyecto o staff",
  WE: "Fin Semana",
  BH: "Festivo",
  H: "Vacaciones Confirmadas",
  C: "Navidad / S. Santa",
  B: "Baja",
  MI: "Visita médico",
  P: "PaP Nocturno",
  LA: "Ausencia Legal",
  PC: "Salida de Proyecto",
  HP: "Vacaciones NO Confirmadas"
};

export const AbsenceColors: Record<AbsenceType, string> = {
  "": "#ffffff",
  D: "#948080ff",
  FD: "#81c784",
  F: "#64b5f6",
  US: "#9575cd",
  CM: "#ffb74d",
  CE: "#4dd0e1",
  OP: "#90a4ae",
  WE: "#aed581",
  BH: "#ffcc80",
  H: "#4caf50",
  C: "#ba68c8",
  B: "#e57373",
  MI: "#ff8a65",
  P: "#7986cb",
  LA: "#fff176",
  PC: "#f06292",
  HP: "#aed581"
};