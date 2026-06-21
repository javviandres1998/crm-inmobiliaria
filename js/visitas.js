function renderVisitas() {
  const visitasLeads = leads.filter(l => l.estado === 'Visita agendada');
  const hoy = new Date().toISOString().split('T')[0];

  if (visitasLeads.length === 0) {
    document.getElementById('content').innerHTML =
      '<div style="text-align:center;padding:3rem;color:var(--text-muted)"><div style="font-size:2rem">🏠</div><div>No hay visitas agendadas</div></div>';
    return;
  }

  const filas = visitasLeads.map(l => {
    const fechaStr = l.fecha_visita ? l.fecha_visita.split('T')[0] : '—';
    const horaStr  = l.fecha_visita ? l.fecha_visita.split('T')[1]?.slice(0,5) : '—';
    const esHoy    = fechaStr === hoy;
    const c        = CLR[l.estado] || '#6B7280';
    return `<tr style="border-bottom:1px solid var(--border);${esHoy ? 'background:#F9731611;' : ''}cursor:pointer"
                onclick="openDetail('${esc(l.id)}')">
      <td style="padding:12px 14px;font-weight:600;color:var(--text-primary)">${esc(l.inmueble||'—')}</td>
      <td style="padding:12px 14px;color:var(--text-primary)">${esc(l.nombre||'—')}</td>
      <td style="padding:12px 14px;color:var(--text-muted)">${esc(l.agente||'—')}</td>
      <td style="padding:12px 14px;color:var(--text-muted)">${esc(l.portal||'—')}</td>
      <td style="padding:12px 14px;font-weight:600;color:${esHoy?'#F97316':'var(--text-primary)'}">${fechaStr}</td>
      <td style="padding:12px 14px;font-weight:700;color:#8B5CF6">${horaStr}</td>
      <td style="padding:12px 14px">
        <span class="badge" style="background:${c}22;color:${c}">${esc(l.estado)}</span>
      </td>
      <td style="padding:12px 14px">
        <button class="btn-ghost" style="font-size:11px;padding:4px 10px"
          onclick="event.stopPropagation();openEditForm('${esc(l.id)}')">✏️ Editar</button>
      </td>
    </tr>`;
  }).join('');

  document.getElementById('content').innerHTML = `
    <div style="margin-bottom:14px;font-size:13px;color:var(--text-muted)">
      ${visitasLeads.length} visita${visitasLeads.length!==1?'s':''} agendada${visitasLeads.length!==1?'s':''}
    </div>
    <div style="background:var(--card);border:1px solid var(--border);border-radius:8px;overflow-x:auto">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="border-bottom:2px solid var(--border)">
            <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.8px">Inmueble</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.8px">Cliente</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.8px">Agente</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.8px">Portal</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.8px">Fecha</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.8px">Hora</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.8px">Estado</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.8px">Acciones</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
    </div>`;
}

function visitaBadge(s) {
  const map = { 'Pendiente':'#F59E0B','Confirmada':'#2563EB','Realizada':'#16A34A','Cancelada':'#DC2626' };
  return `<span class="badge" style="background:${map[s]||'#64748B'}">${esc(s||'')}</span>`;
}

function openFormVisita(id) {
  const v = id ? visitas.find(x => x.id == id) : null;
  editId = id || null;
  const leadsOpts = leads.map(l=>`<option value="${l.id}" ${v&&v.lead_id==l.id?'selected':''}>${esc(l.nombre)}</option>`).join('');
  const propOpts = propiedades.map(p=>`<option value="${p.id}" ${v&&v.propiedad_id==p.id?'selected':''}>${esc(p.referencia||p.id)}</option>`).join('');
  document.getElementById('modal-visita-body').innerHTML = `
    <h2>${id?'Editar':'Nueva'} Visita</h2>
    <form id="visita-form" onsubmit="saveVisita(event)">
      <label>Lead <select name="lead_id" class="form-input"><option value="">-- Sin lead --</option>${leadsOpts}</select></label>
      <label>Propiedad <select name="propiedad_id" class="form-input"><option value="">-- Sin propiedad --</option>${propOpts}</select></label>
      <label>Inmueble <input name="inmueble" class="form-input" value="${esc(v?.inmueble||'')}"></label>
      <label>Cliente <input name="cliente" class="form-input" value="${esc(v?.cliente||'')}"></label>
      <label>Agente <input name="agente" class="form-input" value="${esc(v?.agente||'')}"></label>
      <label>Dirección <input name="direccion" class="form-input" value="${esc(v?.direccion||'')}"></label>
      <label>Fecha <input type="date" name="fecha" class="form-input" value="${esc(v?.fecha||'')}"></label>
      <label>Hora <input type="time" name="hora" class="form-input" value="${esc(v?.hora||'')}"></label>
      <label>Estado <select name="estado" class="form-input">
        ${['Pendiente','Confirmada','Realizada','Cancelada'].map(s=>`<option ${v?.estado===s?'selected':''}>${s}</option>`).join('')}
      </select></label>
      <label>Notas <textarea name="notas_previas" class="form-input" rows="2">${esc(v?.notas_previas||'')}</textarea></label>
      <div style="display:flex;gap:.5rem;margin-top:1rem">
        <button type="submit" class="btn-primary">Guardar</button>
        <button type="button" class="btn-secondary" onclick="closeFormVisita()">Cancelar</button>
      </div>
    </form>`;
  document.getElementById('modal-visita').style.display = 'flex';
}

async function saveVisita(e) {
  e.preventDefault();
  const f = document.getElementById('visita-form');
  const body = {
    inmueble: f.inmueble.value.trim(),
    cliente: f.cliente.value.trim(),
    agente: f.agente.value.trim(),
    direccion: f.direccion.value.trim(),
    fecha: f.fecha.value || null,
    hora: f.hora.value || null,
    estado: f.estado.value,
    notas_previas: f.notas_previas.value.trim() || null,
    lead_id: f.lead_id.value || null,
    propiedad_id: f.propiedad_id.value || null
  };
  try {
    if (editId) await sbFetch('PATCH', 'inmob_visitas', body, `id=eq.${editId}`);
    else await sbFetch('POST', 'inmob_visitas', body);
    toast('Visita guardada', '#16A34A');
    closeFormVisita();
    await loadData();
  } catch(err) { toast('Error: ' + err.message, '#EF4444'); }
}

function closeFormVisita() {
  document.getElementById('modal-visita').style.display = 'none';
  editId = null;
}

let deleteVisitaId = null;
function askDeleteVisita(id) { deleteVisitaId = id; if(confirm('¿Eliminar visita?')) confirmDeleteVisita(); }
async function confirmDeleteVisita() {
  try {
    await sbFetch('DELETE', 'inmob_visitas', null, `id=eq.${deleteVisitaId}`);
    toast('Visita eliminada', '#F59E0B');
    await loadData();
  } catch(err) { toast('Error: ' + err.message, '#EF4444'); }
}
