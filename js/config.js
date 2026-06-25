const SB = 'https://mmddkdeiipzbkitgoxsq.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZGRrZGVpaXB6YmtpdGdveHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTYyNjAsImV4cCI6MjA5NDY5MjI2MH0.91dmRsvbPiIJO2iCCnMwymusXb46TyrPsAsIGZpGDF8';
const HDR = { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

const STAGES = ['Nuevo', 'Contactado', 'Visita agendada', 'Propuesta', 'Cerrado ✓', 'Perdido ✗'];

const CLR = {
  fondo: '#0D0F18',
  card: '#131620',
  borde: '#1E2235',
  acento: '#2563EB',
  texto: '#E2E8F0',
  textoMuted: '#94A3B8'
};

let leads = [], visitas = [], propiedades = [], facturas = [], vacaciones = [];
let view = 'dashboard', editId = null, deleteId = null, dragId = null, q = '';

const DEMO_LEADS = [
  { id:'dl1', nombre:'Roberto Fernández', estado:'Nuevo',        calidad:'Frío',     portal:'Idealista',  agente:'Agente 1', inmueble:'REF-2024-008', fecha:'2026-06-20', created_at:'2026-06-20T09:00:00Z' },
  { id:'dl2', nombre:'Carmen Vidal',      estado:'Contactado',   calidad:'Templado', portal:'Fotocasa',   agente:'Agente 2', inmueble:'REF-2024-009', fecha:'2026-06-19', created_at:'2026-06-19T10:00:00Z' },
  { id:'dl3', nombre:'Miguel Ángel Ros',  estado:'Contactado',   calidad:'Caliente', portal:'Web propia', agente:'Manager',  inmueble:'REF-2024-010', fecha:'2026-06-18', created_at:'2026-06-18T11:00:00Z' },
  { id:'dl4', nombre:'Isabel Puig',       estado:'Propuesta',    calidad:'Caliente', portal:'Habitaclia', agente:'Agente 1', inmueble:'REF-2024-011', fecha:'2026-06-17', created_at:'2026-06-17T12:00:00Z' },
  { id:'dl5', nombre:'David Moreno',      estado:'Propuesta',    calidad:'Templado', portal:'Idealista',  agente:'Agente 2', inmueble:'REF-2024-012', fecha:'2026-06-16', created_at:'2026-06-16T13:00:00Z' },
  { id:'dl6', nombre:'Lucía Castillo',    estado:'Cerrado ✓',    calidad:'Caliente', portal:'Fotocasa',   agente:'Agente 1', inmueble:'REF-2024-013', fecha:'2026-06-15', created_at:'2026-06-15T14:00:00Z' },
  { id:'dl7', nombre:'Tomás Herrera',     estado:'Perdido ✗',    calidad:'Frío',     portal:'Web propia', agente:'Manager',  inmueble:'REF-2024-014', fecha:'2026-06-14', created_at:'2026-06-14T15:00:00Z' },
  { id:'dl8', nombre:'Nuria Soler',       estado:'Nuevo',        calidad:'Templado', portal:'Idealista',  agente:'Agente 2', inmueble:'REF-2024-015', fecha:'2026-06-13', created_at:'2026-06-13T16:00:00Z' },
];

const DEMO_PROPIEDADES = [
  { id:'dp1', referencia:'REF-2024-001', tipo:'Piso',  operacion:'Venta',    estado:'Disponible', ciudad:'Martorell',               precio_venta:185000,  superficie:82,  habitaciones:3, banos:1, agente:'Agente 1', propietario_nombre:'Joan Mas',     created_at:'2026-01-10T00:00:00Z', descripcion:'Piso luminoso en el centro de Martorell con parking.' },
  { id:'dp2', referencia:'REF-2024-002', tipo:'Casa',  operacion:'Venta',    estado:'Reservado',  ciudad:'Sant Andreu de la Barca', precio_venta:320000,  superficie:160, habitaciones:4, banos:2, agente:'Agente 2', propietario_nombre:'Rosa Giménez', created_at:'2026-02-15T00:00:00Z', descripcion:'Casa unifamiliar con jardín y piscina.' },
  { id:'dp3', referencia:'REF-2024-003', tipo:'Piso',  operacion:'Alquiler', estado:'Disponible', ciudad:'Abrera',                  precio_alquiler:850,  superficie:65,  habitaciones:2, banos:1, agente:'Manager',  propietario_nombre:'Pere Font',    created_at:'2026-03-20T00:00:00Z', descripcion:'Piso reformado a estrenar, segunda planta con ascensor.' },
  { id:'dp4', referencia:'REF-2024-004', tipo:'Local', operacion:'Alquiler', estado:'Disponible', ciudad:'Martorell',               precio_alquiler:1200, superficie:95,  habitaciones:0, banos:1, agente:'Agente 1', propietario_nombre:'Marta Roca',   created_at:'2026-04-05T00:00:00Z', descripcion:'Local comercial en zona de alta afluencia, escaparate.' },
];

const DEMO_FACTURAS = [
  { id:'df1',  numero:'FAC-2026-001', fecha_emision:'2026-01-15', cliente_nombre:'Joan Mas',          cliente_nif:'12345678A', concepto:'Honorarios por venta',    propiedad_ref:'REF-2024-001', base:5550, iva:21, total:6715.50, estado:'Cobrada', forma_pago:'Transferencia', created_at:'2026-01-15T00:00:00Z' },
  { id:'df2',  numero:'FAC-2026-002', fecha_emision:'2026-01-28', cliente_nombre:'Rosa Giménez',      cliente_nif:'23456789B', concepto:'Honorarios por venta',    propiedad_ref:'REF-2024-002', base:9600, iva:21, total:11616,   estado:'Emitida', forma_pago:'Transferencia', created_at:'2026-01-28T00:00:00Z' },
  { id:'df3',  numero:'FAC-2026-003', fecha_emision:'2026-02-10', cliente_nombre:'Pere Font',         cliente_nif:'34567890C', concepto:'Honorarios por alquiler', propiedad_ref:'REF-2024-003', base:850,  iva:21, total:1028.50, estado:'Cobrada', forma_pago:'Efectivo',      created_at:'2026-02-10T00:00:00Z' },
  { id:'df4',  numero:'FAC-2026-004', fecha_emision:'2026-02-20', cliente_nombre:'Marta Roca',        cliente_nif:'45678901D', concepto:'Gestión',                 propiedad_ref:'REF-2024-004', base:1200, iva:21, total:1452,    estado:'Cobrada', forma_pago:'Transferencia', created_at:'2026-02-20T00:00:00Z' },
  { id:'df5',  numero:'FAC-2026-005', fecha_emision:'2026-03-05', cliente_nombre:'Isabel Puig',       cliente_nif:'56789012E', concepto:'Honorarios por venta',    propiedad_ref:'REF-2024-005', base:7200, iva:21, total:8712,    estado:'Emitida', forma_pago:'Transferencia', created_at:'2026-03-05T00:00:00Z' },
  { id:'df6',  numero:'FAC-2026-006', fecha_emision:'2026-03-18', cliente_nombre:'David Moreno',      cliente_nif:'67890123F', concepto:'Gestión',                 propiedad_ref:'REF-2024-006', base:600,  iva:21, total:726,     estado:'Vencida', forma_pago:'Efectivo',      created_at:'2026-03-18T00:00:00Z' },
  { id:'df7',  numero:'FAC-2026-007', fecha_emision:'2026-04-02', cliente_nombre:'Lucía Castillo',    cliente_nif:'78901234G', concepto:'Honorarios por venta',    propiedad_ref:'REF-2024-007', base:8400, iva:21, total:10164,   estado:'Cobrada', forma_pago:'Transferencia', created_at:'2026-04-02T00:00:00Z' },
  { id:'df8',  numero:'FAC-2026-008', fecha_emision:'2026-04-22', cliente_nombre:'Carmen Vidal',      cliente_nif:'89012345H', concepto:'Honorarios por alquiler', propiedad_ref:'REF-2024-008', base:950,  iva:21, total:1149.50, estado:'Emitida', forma_pago:'Cheque',        created_at:'2026-04-22T00:00:00Z' },
  { id:'df9',  numero:'FAC-2026-009', fecha_emision:'2026-05-10', cliente_nombre:'Roberto Fernández', cliente_nif:'90123456I', concepto:'Gestión',                 propiedad_ref:'REF-2024-009', base:450,  iva:21, total:544.50,  estado:'Borrador', forma_pago:'Transferencia', created_at:'2026-05-10T00:00:00Z' },
  { id:'df10', numero:'FAC-2026-010', fecha_emision:'2026-05-28', cliente_nombre:'Nuria Soler',       cliente_nif:'01234567J', concepto:'Honorarios por venta',    propiedad_ref:'REF-2024-010', base:6300, iva:21, total:7623,    estado:'Emitida', forma_pago:'Transferencia', created_at:'2026-05-28T00:00:00Z' },
];
