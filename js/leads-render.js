function calidadBadge(c) {
  if (!c) return '';
  const map = { 'Frío': '#2563EB', 'Templado': '#F97316', 'Caliente': '#EF4444' };
  return `<span class="badge" style="background:${map[c]||'#64748B'}">${esc(c)}</span>`;
}

function stageBadge(s) {
  const map = { 'Cerrado ✓': '#16A34A', 'Perdido ✗': '#DC2626', 'Nuevo': '#64748B', 'Contactado': '#2563EB', 'Visita agendada': '#7C3AED', 'Propuesta': '#F59E0B' };
  return `<span class="badge" style="background:${map[s]||'#64748B'}">${esc(s)}</span>`;
}

function renderPipeline() {
  const c = document.getElementById('content');
  c.innerHTML = `<div class="pipeline-board">${STAGES.map(s => `
    <div class="pipeline-col" data-stage="${esc(s)}" ondragover="pdragOver(event)" ondragleave="pdragLeave(event)" ondrop="pdrop(event,'${esc(s)}')">
      <div class="col-header"><span>${esc(s)}</span><span class="col-count">${leads.filter(l=>l.estado===s).length}</span></div>
      <div class="col-cards">${leads.filter(l=>l.estado===s).map(l=>`
        <div class="lead-card" draggable="true" ondragstart="pdragStart(event,'${l.id}')" ondragend="pdragEnd(event)" onclick="openDetail('${l.id}')">
          <div class="card-name">${esc(l.nombre)}</div>
          <div class="card-meta">${esc(l.portal||'')} ${calidadBadge(l.calidad||'')}</div>
          <div class="card-meta">${esc(l.inmueble||'')} ${l.presupuesto?'€'+Number(l.presupuesto).toLocaleString('es'):''}</div>
        </div>`).join('')}
      </div>
    </div>`).join('')}
  </div>`;
}

function renderLista() {
  const c = document.getElementById('content');
  const lista = q ? leads.filter(l => JSON.stringify(l).toLowerCase().includes(q.toLowerCase())) : leads;
  c.innerHTML = `
    <div class="toolbar"><input id="lista-search" class="search-input" placeholder="Buscar..." oninput="filterLista(this.value)"></div>
    <table class="data-table"><thead><tr>
      <th>Nombre</th><th>Email</th><th>Teléfono</th><th>Portal</th><th>Estado</th><th>Calidad</th><th>Inmueble</th><th>Agente</th><th>Acciones</th>
    </tr></thead><tbody>${lista.map(l=>`
      <tr onclick="openDetail('${l.id}')" style="cursor:pointer">
        <td>${esc(l.nombre)}</td><td>${esc(l.email||'')}</td><td>${esc(l.telefono||'')}</td>
        <td>${esc(l.portal||'')}</td><td>${stageBadge(l.estado)}</td><td>${calidadBadge(l.calidad||'')}</td>
        <td>${esc(l.inmueble||'')}</td><td>${esc(l.agente||'')}</td>
        <td onclick="event.stopPropagation()">
          <button class="btn-icon" onclick="openEditForm('${l.id}')">✏️</button>
          <button class="btn-icon" onclick="askDelete('${l.id}')">🗑️</button>
        </td>
      </tr>`).join('')}
    </tbody></table>`;
  document.getElementById('lista-search').value = q;
}

function filterLista(v) { q = v; renderLista(); }

function openDetail(id) {
  const l = leads.find(x => x.id == id);
  if (!l) return;
  const notas = Array.isArray(l.notas) ? l.notas : [];
  document.getElementById('detail-body').innerHTML = `
    <h2>${esc(l.nombre)}</h2>
    <p><b>Email:</b> ${esc(l.email||'')} | <b>Tel:</b> ${esc(l.telefono||'')} | <b>Portal:</b> ${esc(l.portal||'')}</p>
    <p><b>Inmueble:</b> ${esc(l.inmueble||'')} | <b>Zona:</b> ${esc(l.zona||'')} | <b>Presupuesto:</b> ${l.presupuesto?'€'+Number(l.presupuesto).toLocaleString('es'):''}</p>
    <p><b>Estado:</b> ${stageBadge(l.estado)} ${calidadBadge(l.calidad||'')} | <b>Agente:</b> ${esc(l.agente||'')}</p>
    <p><b>Fecha:</b> ${esc(l.fecha||'')} | <b>Visita:</b> ${esc(l.fecha_visita||'')}</p>
    <hr style="border-color:#1E2235;margin:1rem 0">
    <h3>Notas</h3>
    <div id="notas-list">${notas.map(n=>`<div class="nota-item"><span class="nota-ts">${esc(n.ts||'')}</span> ${esc(n.texto||n)}</div>`).join('')}</div>
    <div style="display:flex;gap:.5rem;margin-top:.5rem">
      <input id="nota-input" class="form-input" placeholder="Añadir nota..." style="flex:1">
      <button class="btn-primary" onclick="addNota('${l.id}')">Añadir</button>
    </div>
    <div style="margin-top:1rem;display:flex;gap:.5rem">
      <button class="btn-primary" onclick="openEditForm('${l.id}')">Editar</button>
      <button class="btn-danger" onclick="askDelete('${l.id}')">Eliminar</button>
    </div>`;
  document.getElementById('modal-detail').style.display = 'flex';
}
