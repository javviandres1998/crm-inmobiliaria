function renderFacturas() {
  const now = new Date();
  const mes = now.toISOString().slice(0,7);
  const emitidoMes = facturas.filter(f=>String(f.fecha_emision||'').startsWith(mes)).reduce((s,f)=>s+(f.total||0),0);
  const cobrado = facturas.filter(f=>f.estado==='Cobrada').reduce((s,f)=>s+(f.total||0),0);
  const pendiente = facturas.filter(f=>['Emitida','Borrador'].includes(f.estado)).reduce((s,f)=>s+(f.total||0),0);
  const c = document.getElementById('content');
  c.innerHTML = `
    <div class="toolbar">
      <button class="btn-primary" onclick="openFormFactura()">+ Nueva Factura</button>
      <div class="fact-totales">
        <span>Emitido mes: <b>€${emitidoMes.toLocaleString('es')}</b></span>
        <span>Cobrado: <b style="color:#16A34A">€${cobrado.toLocaleString('es')}</b></span>
        <span>Pendiente: <b style="color:#F59E0B">€${pendiente.toLocaleString('es')}</b></span>
      </div>
    </div>
    <table class="data-table"><thead><tr>
      <th>Número</th><th>Fecha</th><th>Vence</th><th>Cliente</th><th>Concepto</th><th>Base</th><th>IVA</th><th>Total</th><th>Estado</th><th>Acciones</th>
    </tr></thead><tbody>${facturas.map(f=>`
      <tr>
        <td>${esc(f.numero||'')}</td><td>${esc(f.fecha_emision||'')}</td><td>${esc(f.fecha_vencimiento||'')}</td>
        <td>${esc(f.cliente_nombre||'')}</td><td>${esc(f.concepto||'')}</td>
        <td>€${Number(f.base||0).toLocaleString('es')}</td>
        <td>€${Number(f.iva||0).toLocaleString('es')}</td>
        <td><b>€${Number(f.total||0).toLocaleString('es')}</b></td>
        <td>${facturaBadge(f.estado)}</td>
        <td>
          <button class="btn-icon" onclick="openFormFactura('${f.id}')">✏️</button>
          <button class="btn-icon" onclick="printFactura('${f.id}')">🖨️</button>
          <button class="btn-icon" onclick="askDeleteFact('${f.id}')">🗑️</button>
        </td>
      </tr>`).join('')}
    </tbody></table>`;
}

function facturaBadge(s) {
  const map = { 'Borrador':'#64748B','Emitida':'#2563EB','Cobrada':'#16A34A','Vencida':'#DC2626' };
  return `<span class="badge" style="background:${map[s]||'#64748B'}">${esc(s||'')}</span>`;
}

function nextFactNum() {
  if (!facturas.length) return 'FAC-2025-001';
  const nums = facturas.map(f=>{const m=String(f.numero||'').match(/(\d+)$/);return m?parseInt(m[1]):0;});
  return 'FAC-2025-' + String(Math.max(...nums)+1).padStart(3,'0');
}

function openFormFactura(id) {
  const f = id ? facturas.find(x => x.id == id) : null;
  editId = id || null;
  document.getElementById('modal-fact-body').innerHTML = `
    <h2>${id?'Editar':'Nueva'} Factura</h2>
    <form id="fact-form" onsubmit="saveFactura(event)">
      <div class="form-grid">
        <label>Número <input name="numero" class="form-input" value="${esc(f?.numero||nextFactNum())}"></label>
        <label>Fecha Emisión <input type="date" name="fecha_emision" class="form-input" value="${f?.fecha_emision||new Date().toISOString().slice(0,10)}"></label>
        <label>Fecha Vencimiento <input type="date" name="fecha_vencimiento" class="form-input" value="${esc(f?.fecha_vencimiento||'')}"></label>
        <label>Cliente <input name="cliente_nombre" class="form-input" value="${esc(f?.cliente_nombre||'')}"></label>
        <label>NIF Cliente <input name="cliente_nif" class="form-input" value="${esc(f?.cliente_nif||'')}"></label>
        <label>Referencia Propiedad <input name="propiedad_ref" class="form-input" value="${esc(f?.propiedad_ref||'')}"></label>
        <label>Base (€) <input type="number" step="0.01" name="base" class="form-input" value="${f?.base||''}" oninput="calcTotal()"></label>
        <label>IVA (€) <input type="number" step="0.01" name="iva" id="fact-iva" class="form-input" value="${f?.iva||''}" readonly></label>
        <label>Total (€) <input type="number" step="0.01" name="total" id="fact-total" class="form-input" value="${f?.total||''}" readonly></label>
        <label>Estado <select name="estado" class="form-input">${['Borrador','Emitida','Cobrada','Vencida'].map(s=>`<option ${f?.estado===s?'selected':''}>${s}</option>`).join('')}</select></label>
        <label>Forma de Pago <select name="forma_pago" class="form-input">${['Transferencia','Efectivo','Cheque'].map(s=>`<option ${f?.forma_pago===s?'selected':''}>${s}</option>`).join('')}</select></label>
      </div>
      <label>Concepto <textarea name="concepto" class="form-input" rows="2">${esc(f?.concepto||'')}</textarea></label>
      <label>Notas <textarea name="notas" class="form-input" rows="2">${esc(f?.notas||'')}</textarea></label>
      <div style="display:flex;gap:.5rem;margin-top:1rem">
        <button type="submit" class="btn-primary">Guardar</button>
        <button type="button" class="btn-secondary" onclick="closeFormFact()">Cancelar</button>
      </div>
    </form>`;
  document.getElementById('modal-fact').style.display = 'flex';
}

function calcTotal() {
  const base = parseFloat(document.querySelector('#fact-form [name=base]').value) || 0;
  const iva = Math.round(base * 0.21 * 100) / 100;
  document.getElementById('fact-iva').value = iva;
  document.getElementById('fact-total').value = Math.round((base + iva) * 100) / 100;
}

async function saveFactura(e) {
  e.preventDefault();
  const f = document.getElementById('fact-form');
  const base = parseFloat(f.base.value) || 0;
  const iva = Math.round(base * 0.21 * 100) / 100;
  const body = {
    numero: f.numero.value.trim(), fecha_emision: f.fecha_emision.value || null,
    fecha_vencimiento: f.fecha_vencimiento.value || null, cliente_nombre: f.cliente_nombre.value.trim(),
    cliente_nif: f.cliente_nif.value.trim(), concepto: f.concepto.value.trim(),
    propiedad_ref: f.propiedad_ref.value.trim() || null, base, iva,
    total: Math.round((base+iva)*100)/100, estado: f.estado.value,
    forma_pago: f.forma_pago.value, notas: f.notas.value.trim() || null
  };
  try {
    if (editId) await sbFetch('PATCH', 'inmob_facturas', body, `id=eq.${editId}`);
    else await sbFetch('POST', 'inmob_facturas', body);
    toast('Factura guardada', '#16A34A');
    closeFormFact();
    await loadData();
  } catch(err) { toast('Error: ' + err.message, '#EF4444'); }
}

function closeFormFact() { document.getElementById('modal-fact').style.display = 'none'; editId = null; }

function printFactura(id) {
  const f = facturas.find(x => x.id == id);
  if (!f) return;
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Factura ${esc(f.numero)}</title>
  <style>body{font-family:Arial,sans-serif;max-width:800px;margin:2rem auto;color:#111}h1{color:#2563EB}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:.5rem}th{background:#f5f5f5}.total{font-size:1.4rem;font-weight:bold;text-align:right;margin-top:1rem}@media print{button{display:none}}</style></head>
  <body><h1>FACTURA ${esc(f.numero||'')}</h1>
  <p><b>Fecha emisión:</b> ${esc(f.fecha_emision||'')} | <b>Vencimiento:</b> ${esc(f.fecha_vencimiento||'')} | <b>Estado:</b> ${esc(f.estado||'')}</p>
  <h3>Cliente</h3><p>${esc(f.cliente_nombre||'')} — NIF: ${esc(f.cliente_nif||'')}</p>
  <h3>Concepto</h3><p>${esc(f.concepto||'')} ${f.propiedad_ref?'(Ref: '+esc(f.propiedad_ref)+')':''}</p>
  <table><tr><th>Base Imponible</th><th>IVA (21%)</th><th>Total</th></tr>
  <tr><td>€${Number(f.base||0).toLocaleString('es')}</td><td>€${Number(f.iva||0).toLocaleString('es')}</td><td><b>€${Number(f.total||0).toLocaleString('es')}</b></td></tr></table>
  <p><b>Forma de pago:</b> ${esc(f.forma_pago||'')} ${f.notas?'| '+esc(f.notas):''}</p>
  <div class="total">TOTAL: €${Number(f.total||0).toLocaleString('es')}</div>
  <button onclick="window.print()" style="margin-top:2rem;padding:.5rem 1rem;background:#2563EB;color:#fff;border:none;cursor:pointer;border-radius:4px">Imprimir</button>
  </body></html>`);
  w.document.close();
}

let deleteFactId = null;
function askDeleteFact(id) { deleteFactId = id; if(confirm('¿Eliminar factura?')) { sbFetch('DELETE','inmob_facturas',null,`id=eq.${id}`).then(()=>{toast('Factura eliminada','#F59E0B');loadData();}).catch(err=>toast('Error: '+err.message,'#EF4444')); } }
