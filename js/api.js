const DEMO_VISITAS = [
  { id:'d1', nombre:'Ana García',    estado:'Visita agendada', fecha_visita:'2026-06-23T10:00', portal:'Idealista',  agente:'Agente 1', inmueble:'REF-2024-001', created_at: new Date().toISOString() },
  { id:'d2', nombre:'Carlos López',  estado:'Visita agendada', fecha_visita:'2026-06-24T11:30', portal:'Fotocasa',   agente:'Agente 2', inmueble:'REF-2024-002', created_at: new Date().toISOString() },
  { id:'d3', nombre:'María Ruiz',    estado:'Visita agendada', fecha_visita:'2026-06-25T09:00', portal:'Idealista',  agente:'Agente 1', inmueble:'REF-2024-003', created_at: new Date().toISOString() },
  { id:'d4', nombre:'Pedro Sánchez', estado:'Visita agendada', fecha_visita:'2026-06-26T16:00', portal:'Web propia', agente:'Manager',  inmueble:'REF-2024-004', created_at: new Date().toISOString() },
  { id:'d5', nombre:'Laura Martín',  estado:'Visita agendada', fecha_visita:'2026-06-28T10:00', portal:'Fotocasa',   agente:'Agente 1', inmueble:'REF-2024-005', created_at: new Date().toISOString() },
  { id:'d6', nombre:'Javier Torres', estado:'Visita agendada', fecha_visita:'2026-06-30T12:00', portal:'Habitaclia', agente:'Agente 2', inmueble:'REF-2024-006', created_at: new Date().toISOString() },
  { id:'d7', nombre:'Sofía Gil',     estado:'Visita agendada', fecha_visita:'2026-07-02T17:00', portal:'Idealista',  agente:'Manager',  inmueble:'REF-2024-007', created_at: new Date().toISOString() },
];

async function sbFetch(method, table, body, filter) {
  let url = `${SB}/rest/v1/${table}`;
  if (filter) url += `?${filter}`;
  const opts = { method, headers: HDR };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function loadData() {
  try {
    const [l, v, p, f] = await Promise.all([
      sbFetch('GET', 'inmob_leads', null, 'order=created_at.desc'),
      sbFetch('GET', 'inmob_visitas', null, 'order=fecha.asc,hora.asc'),
      sbFetch('GET', 'inmob_propiedades', null, 'order=created_at.desc').catch(() => []),
      sbFetch('GET', 'inmob_facturas', null, 'order=fecha_emision.desc').catch(() => [])
    ]);
    leads = Array.isArray(l) ? l : [];
    const idsReales = leads.map(l => l.id);
    const demoFiltrados = DEMO_VISITAS.filter(d => !idsReales.includes(d.id));
    leads = [...leads, ...demoFiltrados];
    visitas = v || [];
    propiedades = p || [];
    facturas = f || [];
    renderStats();
    renderView();
  } catch (e) {
    toast('Error cargando datos: ' + e.message, '#EF4444');
  }
}
