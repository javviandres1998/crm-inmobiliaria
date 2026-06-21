function toast(msg, color = '#2563EB') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = color;
  t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 3000);
}

function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function setView(v) {
  view = v;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  renderView();
}

function renderView() {
  const c = document.getElementById('content');
  if (view === 'dashboard') { renderDashboard(); return; }
  if (view === 'pipeline') { renderPipeline(); return; }
  if (view === 'lista') { renderLista(); return; }
  if (view === 'visitas') { renderVisitas(); return; }
  if (view === 'propiedades') { renderPropiedades(); return; }
  if (view === 'facturas') { renderFacturas(); return; }
  if (view === 'calendario') { renderCalendario(); return; }
  if (view === 'vacaciones') { renderVacaciones(); return; }
}

function renderStats() {
  const hoy = new Date().toISOString().slice(0,10);
  const enProceso = leads.filter(l => !['Cerrado ✓','Perdido ✗'].includes(l.estado)).length;
  const visita = leads.filter(l => l.fecha_visita && l.fecha_visita.startsWith(hoy)).length;
  const cerrados = leads.filter(l => l.estado === 'Cerrado ✓').length;
  const pct = leads.length ? Math.round(cerrados / leads.length * 100) : 0;
  document.getElementById('stats').innerHTML = `
    <div class="stat-card"><div class="stat-num">${leads.length}</div><div class="stat-lbl">Total Leads</div></div>
    <div class="stat-card"><div class="stat-num">${enProceso}</div><div class="stat-lbl">En Proceso</div></div>
    <div class="stat-card"><div class="stat-num">${visita}</div><div class="stat-lbl">Visitas Hoy</div></div>
    <div class="stat-card"><div class="stat-num">${cerrados}</div><div class="stat-lbl">Cerrados</div></div>
    <div class="stat-card"><div class="stat-num">${pct}%</div><div class="stat-lbl">Conversión</div></div>
  `;
}
