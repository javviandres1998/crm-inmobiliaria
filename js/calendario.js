let calFecha = new Date(2026, 5, 1); // junio 2026
const NOTAS_DEMO = {
  '2026-06-23': ['📞 Llamar a Ana García para confirmar visita', 'Preparar documentación REF-2024-001'],
  '2026-06-25': ['Reunión de equipo 10:00h'],
  '2026-06-30': ['Cierre contrato Lucía Castillo - notaría 11:00h'],
  '2026-07-05': ['Revisión propiedades zona Martorell'],
};

let calNotas = JSON.parse(localStorage.getItem('crm-cal-notas') || '{}');

Object.keys(NOTAS_DEMO).forEach(fecha => {
  if (!calNotas[fecha]) {
    calNotas[fecha] = NOTAS_DEMO[fecha];
  } else {
    NOTAS_DEMO[fecha].forEach(nota => {
      if (!calNotas[fecha].includes(nota)) calNotas[fecha].push(nota);
    });
  }
});
localStorage.setItem('crm-cal-notas', JSON.stringify(calNotas));

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
    const visitasDia = (typeof leads !== 'undefined' ? leads : []).filter(l => {
      if (!l.fecha_visita) return false;
      const fv = l.fecha_visita.includes('T') ? l.fecha_visita.split('T')[0] : l.fecha_visita;
      return fv === fechaStr;
    });
    const notasDia   = calNotas[fechaStr] || [];

    const visitasHTML = visitasDia.map(l =>
      `<div style="background:#F9731622;color:#F97316;border-radius:4px;font-size:10px;padding:2px 5px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">🏠 ${esc((l.nombre||'').slice(0,10))}</div>`
    ).join('');

    const notasHTML = notasDia.map(n =>
      `<div style="background:#3B82F622;color:#3B82F6;border-radius:4px;font-size:10px;padding:2px 5px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">📝 ${esc(n.slice(0,10))}</div>`
    ).join('');

    const vacDia = vacaciones.filter(v => {
      if (v.estado !== 'Aprobada') return false;
      const ini = new Date(v.fecha_inicio);
      const fin = new Date(v.fecha_fin);
      const dia = new Date(fechaStr);
      return dia >= ini && dia <= fin;
    });

    const vacHTML = vacDia.map(v =>
      `<div style="background:#8B5CF622;color:#8B5CF6;border-radius:4px;font-size:10px;padding:2px 5px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">🌴 ${esc(v.nombre.split(' ')[0])}</div>`
    ).join('');

    const cellBg = vacDia.length > 0
      ? 'color-mix(in srgb, var(--card) 85%, #8B5CF6 15%)'
      : 'var(--card)';

    const clickCelda = `onclick="abrirDiaCal('${fechaStr}')"`;

    celdas += `
      <div ${clickCelda} style="background:${cellBg};border:${esHoy ? '2px solid #F97316' : '1px solid var(--border)'};border-radius:8px;padding:8px;min-height:90px;cursor:pointer;position:relative">
        <span style="font-size:13px;font-weight:600">${d}</span>
        ${visitasHTML}${notasHTML}${vacHTML}
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

function abrirDiaCal(fechaStr) {
  const visitasDia = (typeof leads !== 'undefined' ? leads : []).filter(l => {
    if (!l.fecha_visita) return false;
    const fv = l.fecha_visita.includes('T') ? l.fecha_visita.split('T')[0] : l.fecha_visita;
    return fv === fechaStr;
  });
  const notasDia = calNotas[fechaStr] || [];

  const visitasHTML = visitasDia.length > 0
    ? visitasDia.map(l => `
        <div style="display:flex;align-items:center;justify-content:space-between;
             background:#F9731622;border-radius:8px;padding:8px 12px;margin-bottom:6px;cursor:pointer"
             onclick="abrirDetalleLead('${esc(l.id)}')">
          <span>🏠 <strong>${esc(l.nombre)}</strong> — ${esc(l.inmueble||'')}</span>
          <span style="color:#F97316;font-size:12px">${esc(l.fecha_visita?.split('T')[1]?.slice(0,5)||'')}</span>
        </div>`).join('')
    : '<div style="color:var(--text-muted);font-size:13px">Sin visitas este día</div>';

  const notasHTML = notasDia.length > 0
    ? notasDia.map((n, i) => `
        <div style="display:flex;align-items:center;justify-content:space-between;
             background:#3B82F622;border-radius:8px;padding:8px 12px;margin-bottom:6px">
          <span style="color:var(--text-primary);font-size:13px">📝 ${esc(n)}</span>
          <button onclick="borrarNotaCal('${fechaStr}',${i})"
                  style="background:none;border:none;color:#EF4444;cursor:pointer;font-size:16px;padding:0 4px">×</button>
        </div>`).join('')
    : '<div style="color:var(--text-muted);font-size:13px">Sin notas este día</div>';

  const fecha = new Date(fechaStr + 'T12:00:00').toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' });

  document.getElementById('modal-cal-body').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h2 style="text-transform:capitalize;font-size:17px">${fecha}</h2>
      <button onclick="document.getElementById('modal-cal').style.display='none'"
              style="background:none;border:none;color:var(--text-muted);font-size:22px;cursor:pointer">×</button>
    </div>

    <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;
         letter-spacing:.8px;margin-bottom:8px">Visitas</div>
    ${visitasHTML}

    <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;
         letter-spacing:.8px;margin:16px 0 8px">Notas</div>
    ${notasHTML}

    <div style="display:flex;gap:8px;margin-top:14px">
      <input id="nota-input-${fechaStr}" class="form-input" placeholder="Añadir nota..."
             style="flex:1" onkeydown="if(event.key==='Enter')abrirNotaCal('${fechaStr}')">
      <button class="btn-primary" onclick="abrirNotaCal('${fechaStr}')">Añadir</button>
    </div>`;

  document.getElementById('modal-cal').style.display = 'flex';
}

function abrirDetalleLead(id) {
  document.getElementById('modal-cal').style.display = 'none';
  openDetail(id);
}

function borrarNotaCal(fechaStr, index) {
  calNotas[fechaStr].splice(index, 1);
  localStorage.setItem('crm-cal-notas', JSON.stringify(calNotas));
  abrirDiaCal(fechaStr);
}

function abrirNotaCal(fechaStr) {
  const input = document.getElementById('nota-input-' + fechaStr);
  const nota  = input ? input.value.trim() : prompt('Añadir nota para ' + fechaStr + ':');
  if (!nota) return;
  if (!calNotas[fechaStr]) calNotas[fechaStr] = [];
  calNotas[fechaStr].push(nota);
  localStorage.setItem('crm-cal-notas', JSON.stringify(calNotas));
  if (input) abrirDiaCal(fechaStr);
  else renderCalendario();
}