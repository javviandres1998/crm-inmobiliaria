let USERS = [
  { user: 'manager', pass: '1234', role: 'manager', nombre: 'Manager', email: 'manager@crm.com' }
];

(function initUsers() {
  const stored = localStorage.getItem('crm-users');
  if (stored) USERS = JSON.parse(stored);
})();

function checkSession() {
  if (sessionStorage.getItem('crm-user')) {
    showCRM();
    updateUserInfo();
    loadData();
  } else {
    document.getElementById('login-screen').style.display = 'flex';
  }
}

function showState(s) {
  ['login', 'register', 'recover'].forEach(id => {
    document.getElementById('state-' + id).style.display = id === s ? 'flex' : 'none';
  });
}

function loginSubmit() {
  const u     = document.getElementById('l-user').value.trim();
  const p     = document.getElementById('l-pass').value;
  const err   = document.getElementById('l-error');
  const found = USERS.find(x => x.user === u && x.pass === p);
  if (!found) {
    err.textContent  = 'Usuario o contraseña incorrectos';
    err.style.display = 'block';
    return;
  }
  err.style.display = 'none';
  sessionStorage.setItem('crm-user',   found.user);
  sessionStorage.setItem('crm-role',   found.role);
  sessionStorage.setItem('crm-nombre', found.nombre);
  sessionStorage.setItem('crm-email',  found.email || '');
  showCRM();
  updateUserInfo();
  loadData();
}

function registerSubmit() {
  const nombre = document.getElementById('r-nombre').value.trim();
  const user   = document.getElementById('r-user').value.trim();
  const email  = document.getElementById('r-email').value.trim();
  const pass   = document.getElementById('r-pass').value;
  const pass2  = document.getElementById('r-pass2').value;
  const role   = document.getElementById('r-role').value;
  const err    = document.getElementById('r-error');

  if (!nombre || !user || !email || !pass || !pass2) {
    err.textContent = 'Todos los campos son obligatorios';
    err.style.display = 'block'; return;
  }
  if (pass !== pass2) {
    err.textContent = 'Las contraseñas no coinciden';
    err.style.display = 'block'; return;
  }
  if (USERS.find(x => x.user === user)) {
    err.textContent = 'Ese usuario ya existe';
    err.style.display = 'block'; return;
  }
  err.style.display = 'none';
  USERS.push({ user, pass, role, nombre, email });
  localStorage.setItem('crm-users', JSON.stringify(USERS));
  toast('✓ Cuenta creada, ya puedes entrar', '#16A34A');
  document.getElementById('r-nombre').value = '';
  document.getElementById('r-user').value   = '';
  document.getElementById('r-email').value  = '';
  document.getElementById('r-pass').value   = '';
  document.getElementById('r-pass2').value  = '';
  showState('login');
}

function recoverSubmit() {
  const email = document.getElementById('rec-email').value.trim();
  const msg   = document.getElementById('rec-msg');
  const found = USERS.find(x => x.email === email);
  if (!found) {
    msg.textContent   = 'No existe ninguna cuenta con ese email';
    msg.style.color   = '#EF4444';
    msg.style.display = 'block'; return;
  }
  sendRecoveryEmail(email, found.user);
  msg.textContent   = 'Email enviado, revisa tu bandeja';
  msg.style.color   = '#16A34A';
  msg.style.display = 'block';
}

function sendRecoveryEmail(email, user) {
  emailjs.init('BVoQPF_hLnmuAiwjN');
  emailjs.send('service_cdkgbfd', 'template_nd0sriv', {
    to_email:   email,
    to_name:    user,
    reset_link: 'Tu nueva contraseña temporal es: ' + Math.random().toString(36).slice(-6).toUpperCase()
  });
}

function showCRM() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('crm-app').style.display      = 'block';
}

function doLogout() {
  sessionStorage.clear();
  location.reload();
}

function updateUserInfo() {
  const nombre = sessionStorage.getItem('crm-nombre') || sessionStorage.getItem('crm-user');
  const role   = sessionStorage.getItem('crm-role');
  document.getElementById('user-info').textContent = '👤 ' + nombre + ' · ' + role;
}
