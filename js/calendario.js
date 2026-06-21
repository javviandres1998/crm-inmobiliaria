let calFecha = new Date(2026, 5, 1); // junio 2026
let calNotas = JSON.parse(localStorage.getItem('crm-cal-notas') || '{}');

function renderCalendario() {
  const y = calFecha.getFullYear(), m = calFecha.getMonth();
  const mesNombre = calFecha.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const primerDia = new Date(y, m, 1).getDay();          // 0=dom
  const diasMes   = new Date(y, m + 1, 0).getDate();
  const hoy       = new Date().toISOString().split('T')[0];
  const offset    = (primerDia + 6) % 7;                 // lun=0 … dom=6

  let celdas = '';

  for (let i = 0; i < offset; i++) {
    celdas += `<div style="opacity:0;min-height:90px"></div>`;
  }

  for (let d = 1; d <= diasMes; d++) {
    const fechaStr = `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const esHoy      = fechaStr === hoy;
    const visitasDia = leads.filter(l => l.fecha_visita && l.fecha_visita.startsWith(fechaStr));
    const notasDia   = calNotas[fechaStr] || [];

    const visitasHTML = visitasDia.map(l =>
      `<div style="background:#F9731622;color:#F97316;border-radius:4px;font-size:10px;padding:2px 5px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">🏠 ${esc((l.nombre||'').slice(0,10))}</div>`
    ).join('');

    const notasHTML = notasDia.map(n =>
      `<div style="background:#3B82F622;color:#3B82F6;border-radius:4px;font-size:10px;padding:2px 5px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">📝 ${esc(n.slice(0,10))}</div>`
    ).join('');

    const clickCelda = visitasDia.length > 0
      ? `onclick="openDetail('${visitasDia[0].id}')"`
      : `onclick=""`;

    celdas += `
      <div ${clickCelda} style="background:var(--card);border:${esHoy ? '2px solid #F97316' : '1px solid var(--border)'};border-radius:8px;padding:8px;min-height:90px;cursor:pointer;position:relative">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <span style="font-size:13px;font-weight:600">${d}</span>
          <span onclick="event.stopPropagation();abrirNotaCal('${fechaStr}')"
                style="font-size:14px;color:var(--text-muted);cursor:pointer;line-height:1;padding:0 2px"
                title="Añadir nota">+</span>
        </div>
        ${visitasHTML}${notasHTML}
      </div>`;
  }

  document.getElementById('content').innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <button onclick="calMes(-1)" class="btn-ghost">←</button>
      <div style="font-weight:700;font-size:18px;text-transform:capitalize">${mesNombre}</div>
      <button onclick="calMes(1)"  class="btn-ghost">→</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:6px;text-align:center">
      ${['Lu','Ma','Mi','Ju','Vi','Sa','Do'].map(d =>
        `<div style="color:var(--text-muted);font-size:12px;padding:4px 0">${d}</div>`
      ).join('')}
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">
      ${celdas}
    </div>`;
}

function calMes(dir) {
  calFecha = new Date(calFecha.getFullYear(), calFecha.getMonth() + dir, 1);
  renderCalendario();
}

function abrirNotaCal(fechaStr) {
  const nota = prompt('Añadir nota para ' + fechaStr + ':');
  if (!nota || !nota.trim()) return;
  if (!calNotas[fechaStr]) calNotas[fechaStr] = [];
  calNotas[fechaStr].push(nota.trim());
  localStorage.setItem('crm-cal-notas', JSON.stringify(calNotas));
  renderCalendario();
}
