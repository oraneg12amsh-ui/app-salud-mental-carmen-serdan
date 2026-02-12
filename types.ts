export type TestType = 'START' | 'REGISTER' | 'CONSENT' | 'MESACTS' | 'TMMS24' | 'THANK_YOU' | 'ADMIN_LOGIN' | 'ADMIN_PANEL';

export interface Question {
  id: number;
  text: string;
}

export interface UserData {
  studentName: string;
  guardianName: string;
  grade: string;
  group: string;
  gender: Gender;
  city: string; // Para "Lugar y fecha"
  signature?: string; // DataURL de la firma
  timestamp: string;
}

export interface MesactsResult {
  total: number;
  subscales: {
    pertenencia: number;
    participacion: number;
    inclusividad: number;
  };
  interpretation: {
    total: string;
    pertenencia: string;
    participacion: string;
    inclusividad: string;
  };
}

export type Gender = 'male' | 'female';

export interface TmmsResult {
  atencion: number;
  claridad: number;
  reparacion: number;
  interpretation: {
    atencion: string;
    claridad: string;
    reparacion: string;
  };
}

// Nueva interfaz para guardar el registro completo
export interface Submission {
  id: string;
  userData: UserData;
  mesactsAnswers: Record<number, number>;
  tmmsAnswers: Record<number, number>;
  mesactsScore: MesactsResult;
  tmmsScore: TmmsResult;
}