export interface RespuestaConsulta {
  text: string;
  answeredBy: string;
  createdAt: string;
}

export interface Consulta {
  _id?: string;
  opportunity: string;
  askedBy: string;
  question: string;
  answers?: RespuestaConsulta[];
  createdAt?: string;
  updatedAt?: string;
}
