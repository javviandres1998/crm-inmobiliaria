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
    vacs = await sbFetch('GET', 'inmob_vacaciones', null, filter) || [];
  } catch(e) {
    toast('Error cargando vacaciones: ' + e.message, '#EF4444');
  }

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
  try {
    await sbFetch('PATCH', 'inmob_vacaciones', { estado: 'Aprobada' }, `id=eq.${id}`);
    toast('Vacación aprobada', '#16A34A');
    renderVacaciones();
  } catch(err) { toast('Error: ' + err.message, '#EF4444'); }
}

async function rechazarVacacion(id) {
  try {
    await sbFetch('PATCH', 'inmob_vacaciones', { estado: 'Rechazada' }, `id=eq.${id}`);
    toast('Vacación rechazada', '#F59E0B');
    renderVacaciones();
  } catch(err) { toast('Error: ' + err.message, '#EF4444'); }
}
