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

let leads = [], visitas = [], propiedades = [], facturas = [];
let view = 'dashboard', editId = null, deleteId = null, dragId = null, q = '';
