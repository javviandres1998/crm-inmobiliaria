// v2
const DEMO_VACACIONES = [
  { id:'dv1', usuario:'agente1', nombre:'Agente 1', fecha_inicio:'2026-07-01', fecha_fin:'2026-07-14', motivo:'Vacaciones de verano', estado:'Pendiente', created_at:'2026-06-10T00:00:00Z' },
  { id:'dv2', usuario:'agente2', nombre:'Agente 2', fecha_inicio:'2026-08-01', fecha_fin:'2026-08-07', motivo:'Viaje familiar', estado:'Pendiente', created_at:'2026-06-12T00:00:00Z' },
  { id:'dv3', usuario:'agente1', nombre:'Agente 1', fecha_inicio:'2026-12-24', fecha_fin:'2026-12-31', motivo:'Navidades', estado:'Aprobada', created_at:'2026-06-01T00:00:00Z' },
];

function vacBadge(s) {
  const map = { 'Pendiente': '#F97316', 'Aprobada': '#16A34A', 'Rechazada': '#DC2626' };
  return `<span class="badge" style="background:${map[s]||'#64748B'}">${esc(s||'')}</span>`;
}

async function renderVacaciones() {
  const user      = sessionStorage.getItem('crm-user');
  const role      = sessionStorage.getItem('crm-role');
  const isManager = role === 'manager';

  let vacs = [];
  try {
    const filter = isManager
      ? 'order=created_at.desc'
      : `usuario=eq.${user}&order=created_at.desc`;
    const reales = await sbFetch('GET', 'inmob_vacaciones', null, filter).catch(() => []);
    vacs = Array.isArray(reales) ? reales : [];
  } catch(e) {
    vacs = [];
  }

  const idsReales = vacs.map(v => v.id);
  const demoFiltrados = isManager
    ? DEMO_VACACIONES.filter(d => !idsReales.includes(d.id))
    : DEMO_VACACIONES.filter(d => !idsReales.includes(d.id) && d.usuario === user);
  vacs = [...vacs, ...demoFiltrados];
  vacs.sort((a,b) => b.created_at.localeCompare(a.created_at));

  const rows = vacs.map(v => `
    <tr>
      ${isManager ? `<td>${esc(v.nombre||v.usuario)}</td>` : ''}
      <td>${esc(v.fecha_inicio||'')}</td>
      <td>${esc(v.fecha_fin||'')}</td>
      <td>${esc(v.motivo||'')}</td>
      <td>${vacBadge(v.estado)}</td>
      <td>${isManager && v.estado === 'Pendiente' ? `
        <button class="btn-icon" title="Aprobar"  onclick="aprobarVacacion('${v.id}')">✓</button>
        <button class="btn-icon" title="Rechazar" onclick="rechazarVacacion('${v.id}')">✗</button>` : ''}
      </td>
    </tr>`).join('');

  document.getElementById('content').innerHTML = `
    <div class="toolbar">
      ${!isManager ? '<button class="btn-primary" onclick="openFormVacacion()">+ Solicitar vacaciones</button>' : ''}
    </div>
    <table class="data-table"><thead><tr>
      ${isManager ? '<th>Agente</th>' : ''}
      <th>Fecha inicio</th><th>Fecha fin</th><th>Motivo</th><th>Estado</th><th>Acciones</th>
    </tr></thead><tbody>
      ${rows || `<tr><td colspan="${isManager?6:5}" style="text-align:center;color:var(--text-muted);padding:2rem">Sin solicitudes</td></tr>`}
    </tbody></table>`;
}

function openFormVacacion() {
  document.getElementById('vac-form').reset();
  document.getElementById('modal-vac').style.display = 'flex';
}

function closeFormVacacion() {
  document.getElementById('modal-vac').style.display = 'none';
}

async function saveVacacion(e) {
  e.preventDefault();
  const f      = document.getElementById('vac-form');
  const user   = sessionStorage.getItem('crm-user');
  const nombre = sessionStorage.getItem('crm-nombre') || user;
  const body   = {
    usuario:      user,
    nombre:       nombre,
    fecha_inicio: f.fecha_inicio.value || null,
    fecha_fin:    f.fecha_fin.value    || null,
    motivo:       f.motivo.value.trim() || null,
    estado:       'Pendiente'
  };
  try {
    await sbFetch('POST', 'inmob_vacaciones', body);
    toast('Solicitud enviada', '#16A34A');
    closeFormVacacion();
    renderVacaciones();
  } catch(err) { toast('Error: ' + err.message, '#EF4444'); }
}

async function aprobarVacacion(id) {
  if (id.startsWith('dv')) {
    const v = DEMO_VACACIONES.find(x => x.id === id);
    if (v) v.estado = 'Aprobada';
    toast('Vacación aprobada ✓', '#16A34A');
    renderVacaciones();
    return;
  }
  try {
    await sbFetch('PATCH', 'inmob_vacaciones', { estado:'Aprobada' }, `id=eq.${id}`);
    toast('Vacación aprobada ✓', '#16A34A');
    renderVacaciones();
  } catch(err) { toast('Error: ' + err.message, '#EF4444'); }
}

async function rechazarVacacion(id) {
  if (id.startsWith('dv')) {
    const v = DEMO_VACACIONES.find(x => x.id === id);
    if (v) v.estado = 'Rechazada';
    toast('Vacación rechazada', '#DC2626');
    renderVacaciones();
    return;
  }
  try {
    await sbFetch('PATCH', 'inmob_vacaciones', { estado:'Rechazada' }, `id=eq.${id}`);
    toast('Vacación rechazada', '#DC2626');
    renderVacaciones();
  } catch(err) { toast('Error: ' + err.message, '#EF4444'); }
}
