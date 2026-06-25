function openForm() {
  editId = null;
  document.getElementById('form-title').textContent = 'Nuevo Lead';
  document.getElementById('lead-form').reset();
  document.getElementById('modal-lead').style.display = 'flex';
}

function openEditForm(id) {
  const l = leads.find(x => x.id == id);
  if (!l) return;
  editId = id;
  document.getElementById('form-title').textContent = 'Editar Lead';
  const f = document.getElementById('lead-form');
  f.nombre.value = l.nombre || '';
  f.email.value = l.email || '';
  f.telefono.value = l.telefono || '';
  f.portal.value = l.portal || '';
  f.estado.value = l.estado || 'Nuevo';
  f.inmueble.value = l.inmueble || '';
  f.agente.value = l.agente || '';
  f.fecha.value = l.fecha || '';
  f.fecha_visita.value = l.fecha_visita || '';
  f.calidad.value = l.calidad || '';
  f.presupuesto.value = l.presupuesto || '';
  f.zona.value = l.zona || '';
  document.getElementById('modal-lead').style.display = 'flex';
}

async function saveForm(e) {
  e.preventDefault();
  const f = document.getElementById('lead-form');
  const body = {
    nombre: f.nombre.value.trim(),
    email: f.email.value.trim(),
    telefono: f.telefono.value.trim(),
    portal: f.portal.value.trim(),
    estado: f.estado.value,
    inmueble: f.inmueble.value.trim(),
    agente: f.agente.value.trim(),
    fecha: f.fecha.value || null,
    fecha_visita: f.fecha_visita.value || null,
    calidad: f.calidad.value || null,
    presupuesto: f.presupuesto.value ? parseFloat(f.presupuesto.value) : null,
    zona: f.zona.value.trim() || null
  };
  const fechaVisita = document.querySelector('[name="fecha_visita"]')?.value;
  const agenteVal   = document.querySelector('[name="agente"]')?.value?.toLowerCase();

  if (fechaVisita && agenteVal) {
    const diaVisita = new Date(fechaVisita);
    const bloqueado = vacaciones.some(v => {
      if (v.estado !== 'Aprobada') return false;
      if (!v.usuario || v.usuario.toLowerCase().replace(' ','') !== agenteVal.replace(' ','')) return false;
      const ini = new Date(v.fecha_inicio);
      const fin = new Date(v.fecha_fin);
      return diaVisita >= ini && diaVisita <= fin;
    });
    if (bloqueado) {
      toast('⚠️ El agente está de vacaciones en esa fecha', '#EF4444');
      return;
    }
  }

  try {
    if (editId) {
      await sbFetch('PATCH', 'inmob_leads', body, `id=eq.${editId}`);
      toast('Lead actualizado', '#16A34A');
    } else {
      await sbFetch('POST', 'inmob_leads', body);
      toast('Lead creado', '#16A34A');
    }
    closeForm();
    await loadData();
  } catch(err) { toast('Error: ' + err.message, '#EF4444'); }
}

function closeForm() {
  document.getElementById('modal-lead').style.display = 'none';
  document.getElementById('modal-detail').style.display = 'none';
  editId = null;
}

function askDelete(id) {
  deleteId = id;
  document.getElementById('modal-del').style.display = 'flex';
}

function closeDel() {
  deleteId = null;
  document.getElementById('modal-del').style.display = 'none';
}

async function confirmDelete() {
  try {
    await sbFetch('DELETE', 'inmob_leads', null, `id=eq.${deleteId}`);
    toast('Lead eliminado', '#F59E0B');
    closeDel();
    closeForm();
    await loadData();
  } catch(err) { toast('Error: ' + err.message, '#EF4444'); }
}

async function changeStage(id, stage) {
  await sbFetch('PATCH', 'inmob_leads', { estado: stage }, `id=eq.${id}`);
  await loadData();
}

async function addNota(id) {
  const inp = document.getElementById('nota-input');
  const texto = inp.value.trim();
  if (!texto) return;
  const l = leads.find(x => x.id == id);
  const notas = Array.isArray(l.notas) ? [...l.notas] : [];
  notas.push({ ts: new Date().toLocaleString('es'), texto });
  await sbFetch('PATCH', 'inmob_leads', { notas }, `id=eq.${id}`);
  inp.value = '';
  await loadData();
  openDetail(id);
}

function pdragStart(e, id) { dragId = id; e.currentTarget.classList.add('dragging'); }
function pdragEnd(e) { e.currentTarget.classList.remove('dragging'); }
function pdragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
function pdragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
async function pdrop(e, stage) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (!dragId) return;

  // Si es un lead demo (id empieza por 'd' y es corto), actualiza solo en memoria
  const lead = leads.find(x => x.id == dragId);
  if (lead && (String(dragId).startsWith('d') && String(dragId).length <= 3)) {
    lead.estado = stage;
    dragId = null;
    renderPipeline();
    renderStats();
    return;
  }

  // Lead real: actualiza en Supabase
  try {
    await changeStage(dragId, stage);
  } catch(e) {
    toast('⚠️ Error al mover lead', '#EF4444');
  }
  dragId = null;
}
