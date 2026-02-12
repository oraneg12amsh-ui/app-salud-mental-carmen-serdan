import { MesactsResult, TmmsResult, Gender } from '../types';

// --- MESACTS SCORING ---
export const calculateMesactsScore = (answers: Record<number, number>): MesactsResult => {
  // Dimension Groups
  const pertenenciaIds = [1, 2, 3, 4];
  const participacionIds = [7, 8, 9, 11];
  const inclusividadIds = [5, 6, 10];

  const sumIds = (ids: number[]) => ids.reduce((acc, id) => acc + (answers[id] || 0), 0);

  const pertenencia = sumIds(pertenenciaIds);
  const participacion = sumIds(participacionIds);
  const inclusividad = sumIds(inclusividadIds);
  const total = pertenencia + participacion + inclusividad;

  // Helper for ranges
  const getLevel = (score: number, lowMax: number, medLowMax: number, medHighMax: number) => {
    if (score <= lowMax) return "Nivel Bajo";
    if (score <= medLowMax) return "Nivel Medio-Bajo";
    if (score <= medHighMax) return "Nivel Medio-Alto";
    return "Nivel Alto";
  };

  return {
    total,
    subscales: { pertenencia, participacion, inclusividad },
    interpretation: {
      total: getLevel(total, 19, 27, 35),
      pertenencia: getLevel(pertenencia, 7, 10, 13),
      participacion: getLevel(participacion, 7, 10, 13),
      inclusividad: getLevel(inclusividad, 5, 7, 9)
    }
  };
};

// --- TMMS-24 SCORING ---
export const calculateTmmsScore = (answers: Record<number, number>, gender: Gender): TmmsResult => {
  const sumRange = (start: number, end: number) => {
    let sum = 0;
    for (let i = start; i <= end; i++) {
      sum += (answers[i] || 0);
    }
    return sum;
  };

  const atencion = sumRange(1, 8);
  const claridad = sumRange(9, 16);
  const reparacion = sumRange(17, 24);

  let interpAtencion = "";
  let interpClaridad = "";
  let interpReparacion = "";

  if (gender === 'male') {
    // Atención (Hombres)
    if (atencion <= 21) interpAtencion = "Debe mejorar su atención: presta poca atención";
    else if (atencion <= 32) interpAtencion = "Adecuada atención";
    else interpAtencion = "Debe mejorar su atención: presta demasiada atención";

    // Claridad (Hombres)
    if (claridad <= 25) interpClaridad = "Debe mejorar su claridad";
    else if (claridad <= 35) interpClaridad = "Adecuada claridad";
    else interpClaridad = "Excelente claridad";

    // Reparación (Hombres)
    if (reparacion <= 23) interpReparacion = "Debe mejorar su reparación";
    else if (reparacion <= 35) interpReparacion = "Adecuada reparación";
    else interpReparacion = "Excelente reparación";

  } else { // Female
    // Atención (Mujeres)
    if (atencion <= 24) interpAtencion = "Debe mejorar su atención: presta poca atención";
    else if (atencion <= 35) interpAtencion = "Adecuada atención";
    else interpAtencion = "Debe mejorar su atención: presta demasiada atención";

    // Claridad (Mujeres)
    if (claridad <= 23) interpClaridad = "Debe mejorar su claridad";
    else if (claridad <= 34) interpClaridad = "Adecuada claridad";
    else interpClaridad = "Excelente claridad";

    // Reparación (Mujeres)
    if (reparacion <= 23) interpReparacion = "Debe mejorar su reparación";
    else if (reparacion <= 34) interpReparacion = "Adecuada reparación";
    else interpReparacion = "Excelente reparación";
  }

  return {
    atencion,
    claridad,
    reparacion,
    interpretation: {
      atencion: interpAtencion,
      claridad: interpClaridad,
      reparacion: interpReparacion
    }
  };
};