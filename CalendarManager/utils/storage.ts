//export type AbsenceType = "Vacaciones" | "Enfermedad" | "Asuntos propios" | "Formación" ;
export type AbsenceType = 
"Día Trabajado"|
"Días de Libre Disposición"|
"Formación"|
"Colaboración con la US"|
"Reunión cliente"|
"Compensados NTT DATA Centers"|
"Cargado a otro proyecto o staff"|
"Fin Semana"|
"Festivo"|
"Vacaciones Confirmadas"|
"Navidad / S. Santa"|
"Baja"|
"Visita médico"|
"PaP Nocturno"|
"Ausencia Legal"|
"Salida de Proyecto"|
"Vacaciones NO Confirmadas";

export interface AbsenceRecord {
  day: number;
  month: number;
  year: number;
  type: AbsenceType;
}