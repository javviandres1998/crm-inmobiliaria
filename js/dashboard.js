function renderDashboard() {
  const now = new Date();
  const mes = now.toISOString().slice(0,7);
  const semIni = new Date(now); semIni.setDate(now.getDate() - now.getDay());
  const semFin = new Date(semIni); semFin.setDate(semIni.getDate() + 6);
  const semIniS = semIni.toISOString().slice(0,10);
  const semFinS = semFin.toISOString().slice(0,10);

  const leadsMes = leads.filter(l => String(l.created_at||'').startsWith(mes)).length;
  const visitasSem = visitas.filter(v => v.fecha >= semIniS && v.fecha <= semFinS).length;
  const propActivas = propiedades.filter(p => p.estado === 'Disponible').length;
  const factCobMes = facturas.filter(f => f.estado === 'Cobrada' && String(f.fecha_emision||'').startsWith(mes)).reduce((s,f)=>s+(f.total||0),0);
  const cerrados = leads.filter(l => l.estado === 'Cerrado ✓').length;
  const pct = leads.length ? Math.round(cerrados / leads.length * 100) : 0;

  const stageCounts = STAGES.slice(0,-1).map(s => ({ s, n: leads.filter(l=>l.estado===s).length }));
  const maxN = Math.max(...stageCounts.map(x=>x.n), 1);

  const proxVisitas = [...visitas].filter(v=>v.fecha>=now.toISOString().slice(0,10)).slice(0,5);
  const ultLeads = leads.slice(0,8);

  document.getElementById('content').innerHTML = `
    <div class="dash-kpis">
      <div class="kpi-card"><div class="kpi-num">${leadsMes}</div><div class="kpi-lbl">Leads este mes</div></div>
      <div class="kpi-card"><div class="kpi-num">${visitasSem}</div><div class="kpi-lbl">Visitas esta semana</div></div>
      <div class="kpi-card"><div class="kpi-num">${propActivas}</div><div class="kpi-lbl">Propiedades activas</div></div>
      <div class="kpi-card"><div class="kpi-num">€${factCobMes.toLocaleString('es')}</div><div class="kpi-lbl">Cobrado este mes</div></div>
      <div class="kpi-card"><div class="kpi-num">${pct}%</div><div class="kpi-lbl">% Conversión</div></div>
    </div>

    <div class="dash-row">
      <div class="dash-panel">
        <h3>Funnel de Ventas</h3>
        <div>${stageCounts.map(({s,n})=>`
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <div style="width:120px;font-size:13px;color:var(--text-muted);flex-shrink:0">${esc(s)}</div>
            <div style="font-size:13px;font-weight:700;color:var(--text-primary);width:24px;text-align:right;flex-shrink:0">${n}</div>
            <div style="flex:1;background:var(--border);border-radius:4px;height:18px;overflow:hidden">
              <div style="height:100%;border-radius:4px;background:var(--accent);width:${Math.round(n/maxN*100)}%;transition:width .4s ease"></div>
            </div>
          </div>`).join('')}
        </div>
      </div>

      <div class="dash-panel">
        <h3>Próximas 5 Visitas</h3>
        ${proxVisitas.length ? `<table class="data-table"><thead><tr><th>Fecha</th><th>Hora</th><th>Cliente</th><th>Inmueble</th></tr></thead><tbody>
          ${proxVisitas.map(v=>`<tr><td>${esc(v.fecha||'')}</td><td>${esc(v.hora||'')}</td><td>${esc(v.cliente||'')}</td><td>${esc(v.inmueble||'')}</td></tr>`).join('')}
        </tbody></table>` : '<p style="color:#94A3B8">Sin visitas próximas</p>'}
      </div>
    </div>

    <div class="dash-panel" style="margin-top:1rem">
      <h3>Últimos 8 Leads</h3>
      <table class="data-table"><thead><tr><th>Nombre</th><th>Portal</th><th>Estado</th><th>Calidad</th><th>Agente</th><th>Fecha</th></tr></thead><tbody>
        ${ultLeads.map(l=>`<tr>
          <td>${esc(l.nombre)}</td><td>${esc(l.portal||'')}</td>
          <td>${stageBadge(l.estado)}</td><td>${calidadBadge(l.calidad||'')}</td>
          <td>${esc(l.agente||'')}</td><td>${esc(l.created_at?l.created_at.slice(0,10):'')}</td>
        </tr>`).join('')}
      </tbody></table>
    </div>`;
}
