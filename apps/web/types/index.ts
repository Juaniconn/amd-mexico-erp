export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Otizacion {
  id: string;
  folio: string;
  cliente: string;
  fecha: string;
  estatus: 'borrador' | 'enviada' | 'aceptada' | 'rechazada';
  total: number;
  moneda: 'MXN' | 'USD';
}
