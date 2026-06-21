function renderPropiedades() {
  const c = document.getElementById('content');
  c.innerHTML = `
    <div class="toolbar"><button class="btn-primary" onclick="openFormPropiedad()">+ Nueva Propiedad</button></div>
    <div class="prop-grid">${propiedades.map(p=>`
      <div class="prop-card" onclick="openFormPropiedad('${p.id}')">
        <div class="prop-ref">${esc(p.referencia||'')}</div>
        <div class="prop-tipo">${esc(p.tipo||'')} · ${esc(p.operacion||'')}</div>
        <div class="prop-precio">${p.precio_venta?'€'+Number(p.precio_venta).toLocaleString('es')+(p.precio_alquiler?' / €'+Number(p.precio_alquiler).toLocaleString('es')+'/mes':''):p.precio_alquiler?'€'+Number(p.precio_alquiler).toLocaleString('es')+'/mes':''}</div>
        <div class="prop-city">${esc(p.ciudad||'')} ${p.superficie?p.superficie+'m²':''} ${p.habitaciones?p.habitaciones+'hab':''}</div>
        <div>${propBadge(p.estado)}</div>
        <div onclick="event.stopPropagation();askDeleteProp('${p.id}')" style="margin-top:.5rem"><button class="btn-icon">🗑️</button></div>
      </div>`).join('')}
    </div>`;
}

function propBadge(s) {
  const map = { 'Disponible':'#16A34A','Reservada':'#F59E0B','Vendida':'#2563EB','Alquilada':'#7C3AED','Retirada':'#DC2626' };
  return `<span class="badge" style="background:${map[s]||'#64748B'}">${esc(s||'')}</span>`;
}

function nextRef() {
  if (!propiedades.length) return 'REF-2025-001';
  const nums = propiedades.map(p=>{const m=String(p.referencia||'').match(/(\d+)$/);return m?parseInt(m[1]):0;});
  return 'REF-2025-' + String(Math.max(...nums)+1).padStart(3,'0');
}

function openFormPropiedad(id) {
  const p = id ? propiedades.find(x => x.id == id) : null;
  editId = id || null;
  document.getElementById('modal-prop-body').innerHTML = `
    <h2>${id?'Editar':'Nueva'} Propiedad</h2>
    <form id="prop-form" onsubmit="savePropiedad(event)">
      <div class="form-grid">
        <label>Referencia <input name="referencia" class="form-input" value="${esc(p?.referencia||nextRef())}"></label>
        <label>Tipo <select name="tipo" class="form-input">${['Piso','Casa','Local','Garaje','Terreno','Oficina'].map(t=>`<option ${p?.tipo===t?'selected':''}>${t}</option>`).join('')}</select></label>
        <label>Operación <select name="operacion" class="form-input">${['Venta','Alquiler','Ambas'].map(t=>`<option ${p?.operacion===t?'selected':''}>${t}</option>`).join('')}</select></label>
        <label>Estado <select name="estado" class="form-input">${['Disponible','Reservada','Vendida','Alquilada','Retirada'].map(t=>`<option ${p?.estado===t?'selected':''}>${t}</option>`).join('')}</select></label>
        <label>Ciudad <input name="ciudad" class="form-input" value="${esc(p?.ciudad||'')}"></label>
        <label>Precio Venta <input type="number" name="precio_venta" class="form-input" value="${p?.precio_venta||''}"></label>
        <label>Precio Alquiler <input type="number" name="precio_alquiler" class="form-input" value="${p?.precio_alquiler||''}"></label>
        <label>Superficie m² <input type="number" name="superficie" class="form-input" value="${p?.superficie||''}"></label>
        <label>Habitaciones <input type="number" name="habitaciones" class="form-input" value="${p?.habitaciones||''}"></label>
        <label>Baños <input type="number" name="banos" class="form-input" value="${p?.banos||''}"></label>
        <label>Agente <input name="agente" class="form-input" value="${esc(p?.agente||'')}"></label>
        <label>Propietario <input name="propietario_nombre" class="form-input" value="${esc(p?.propietario_nombre||'')}"></label>
        <label>Tel Propietario <input name="propietario_tel" class="form-input" value="${esc(p?.propietario_tel||'')}"></label>
      </div>
      <label>Notas <textarea name="notas" class="form-input" rows="2">${esc(p?.notas||'')}</textarea></label>
      <div style="display:flex;gap:.5rem;margin-top:1rem">
        <button type="submit" class="btn-primary">Guardar</button>
        <button type="button" class="btn-secondary" onclick="closeFormProp()">Cancelar</button>
      </div>
    </form>`;
  document.getElementById('modal-prop').style.display = 'flex';
}

async function savePropiedad(e) {
  e.preventDefault();
  const f = document.getElementById('prop-form');
  const body = {
    referencia: f.referencia.value.trim(), tipo: f.tipo.value, operacion: f.operacion.value,
    estado: f.estado.value, ciudad: f.ciudad.value.trim(),
    precio_venta: f.precio_venta.value ? parseFloat(f.precio_venta.value) : null,
    precio_alquiler: f.precio_alquiler.value ? parseFloat(f.precio_alquiler.value) : null,
    superficie: f.superficie.value ? parseFloat(f.superficie.value) : null,
    habitaciones: f.habitaciones.value ? parseInt(f.habitaciones.value) : null,
    banos: f.banos.value ? parseInt(f.banos.value) : null,
    agente: f.agente.value.trim(), propietario_nombre: f.propietario_nombre.value.trim(),
    propietario_tel: f.propietario_tel.value.trim(), notas: f.notas.value.trim() || null
  };
  try {
    if (editId) await sbFetch('PATCH', 'inmob_propiedades', body, `id=eq.${editId}`);
    else await sbFetch('POST', 'inmob_propiedades', body);
    toast('Propiedad guardada', '#16A34A');
    closeFormProp();
    await loadData();
  } catch(err) { toast('Error: ' + err.message, '#EF4444'); }
}

function closeFormProp() { document.getElementById('modal-prop').style.display = 'none'; editId = null; }

let deletePropId = null;
function askDeleteProp(id) { deletePropId = id; if(confirm('¿Eliminar propiedad?')) deletePropiedad(id); }
async function deletePropiedad(id) {
  try {
    await sbFetch('DELETE', 'inmob_propiedades', null, `id=eq.${id}`);
    toast('Propiedad eliminada', '#F59E0B');
    await loadData();
  } catch(err) { toast('Error: ' + err.message, '#EF4444'); }
}
