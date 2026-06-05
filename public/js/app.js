const API = '/api/productos';

let todosLosProductos = [];
let categoriaActiva = 'Todos';
let textoBusqueda = '';

// ===== FETCH =====
async function cargarProductos() {
  try {
    const res = await fetch(API);
    todosLosProductos = await res.json();
    renderCategoryTabs();
    renderStats();
    renderProductos();
    renderDashboard(todosLosProductos);
  } catch {
    toast('Error al conectar con la API', 'error');
  }
}

// ===== STATS =====
function renderStats() {
  const productos = todosLosProductos;
  const categorias = new Set(productos.map(p => p.categoria));
  const total = productos.length;
  const promedio = total ? productos.reduce((s, p) => s + p.precio, 0) / total : 0;
  const max = total ? Math.max(...productos.map(p => p.precio)) : 0;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statCategorias').textContent = categorias.size;
  document.getElementById('statPromedio').textContent = formatPrecio(promedio);
  document.getElementById('statMax').textContent = formatPrecio(max);
}

// ===== CATEGORÍAS =====
function renderCategoryTabs() {
  const cats = ['Todos', ...new Set(todosLosProductos.map(p => p.categoria))];
  const container = document.getElementById('categoryTabs');

  // Mantener botones que ya existen o reconstruir
  container.innerHTML = '';
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (cat === categoriaActiva ? ' active' : '');
    btn.dataset.cat = cat;
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      categoriaActiva = cat;
      container.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
      renderProductos();
    });
    container.appendChild(btn);
  });

  // Actualizar datalist del modal con categorías existentes
  const dl = document.getElementById('categoriasDatalist');
  dl.innerHTML = '';
  cats.slice(1).forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    dl.appendChild(opt);
  });
}

// ===== RENDER PRODUCTOS =====
function renderProductos() {
  let lista = [...todosLosProductos];

  if (categoriaActiva !== 'Todos') {
    lista = lista.filter(p => p.categoria === categoriaActiva);
  }
  if (textoBusqueda) {
    const q = textoBusqueda.toLowerCase();
    lista = lista.filter(p =>
      p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q)
    );
  }

  const grid = document.getElementById('productsGrid');
  const empty = document.getElementById('emptyState');
  const info  = document.getElementById('resultsInfo');

  grid.innerHTML = '';

  if (lista.length === 0) {
    empty.classList.remove('hidden');
    info.textContent = '';
    return;
  }
  empty.classList.add('hidden');

  const total = todosLosProductos.length;
  info.textContent = lista.length === total
    ? `Mostrando ${total} producto${total !== 1 ? 's' : ''}`
    : `Mostrando ${lista.length} de ${total} producto${total !== 1 ? 's' : ''}`;

  lista.forEach(p => {
    const card = crearCard(p);
    grid.appendChild(card);
  });
}

function crearCard(p) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.id = p.id;
  card.innerHTML = `
    <div class="card-top">
      <span class="card-category">${escapeHtml(p.categoria)}</span>
      <span class="card-id">#${p.id}</span>
    </div>
    <div class="card-body">
      <p class="card-name">${escapeHtml(p.nombre)}</p>
      <p class="card-price">${formatPrecio(p.precio)} <span>MXN</span></p>
    </div>
    <div class="card-footer">
      <button class="btn-danger btn-eliminar" data-id="${p.id}">
        🗑 Eliminar
      </button>
    </div>
  `;
  card.querySelector('.btn-eliminar').addEventListener('click', () => confirmarEliminar(p));
  return card;
}

// ===== ELIMINAR =====
function confirmarEliminar(p) {
  if (!confirm(`¿Eliminar "${p.nombre}" (${formatPrecio(p.precio)})?`)) return;
  eliminarProducto(p.id);
}

async function eliminarProducto(id) {
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    const data = await res.json();
    todosLosProductos = todosLosProductos.filter(p => p.id !== id);
    renderCategoryTabs();
    renderStats();
    renderProductos();
    renderDashboard(todosLosProductos);
    toast(`"${data.producto.nombre}" eliminado`, 'success');
  } catch {
    toast('No se pudo eliminar el producto', 'error');
  }
}

// ===== MODAL =====
const modalOverlay  = document.getElementById('modalOverlay');
const formProducto  = document.getElementById('formProducto');

function abrirModal() {
  formProducto.reset();
  limpiarErrores();
  modalOverlay.classList.remove('hidden');
  document.getElementById('inputNombre').focus();
}

function cerrarModal() {
  modalOverlay.classList.add('hidden');
}

document.getElementById('btnAbrirModal').addEventListener('click', abrirModal);
document.getElementById('btnCerrarModal').addEventListener('click', cerrarModal);
document.getElementById('btnCancelar').addEventListener('click', cerrarModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) cerrarModal(); });

document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });

// ===== FORM SUBMIT =====
formProducto.addEventListener('submit', async (e) => {
  e.preventDefault();
  limpiarErrores();

  const nombre    = document.getElementById('inputNombre').value.trim();
  const precio    = document.getElementById('inputPrecio').value.trim();
  const categoria = document.getElementById('inputCategoria').value.trim();
  let valido = true;

  if (!nombre) {
    setError('errNombre', 'inputNombre', 'El nombre es requerido');
    valido = false;
  }
  if (!precio || isNaN(precio) || parseFloat(precio) <= 0) {
    setError('errPrecio', 'inputPrecio', 'Ingresa un precio válido mayor a 0');
    valido = false;
  }
  if (!categoria) {
    setError('errCategoria', 'inputCategoria', 'La categoría es requerida');
    valido = false;
  }
  if (!valido) return;

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, precio: parseFloat(precio), categoria }),
    });
    if (!res.ok) {
      const err = await res.json();
      toast(err.error || 'Error al guardar', 'error');
      return;
    }
    const nuevo = await res.json();
    todosLosProductos.push(nuevo);
    cerrarModal();
    categoriaActiva = 'Todos';
    renderCategoryTabs();
    renderStats();
    renderProductos();
    renderDashboard(todosLosProductos);
    toast(`"${nuevo.nombre}" agregado correctamente`, 'success');
  } catch {
    toast('Error al conectar con la API', 'error');
  }
});

// ===== BÚSQUEDA =====
const inputBuscar = document.getElementById('inputBuscar');
const btnLimpiar  = document.getElementById('btnLimpiarBuscar');

inputBuscar.addEventListener('input', () => {
  textoBusqueda = inputBuscar.value.trim();
  btnLimpiar.classList.toggle('hidden', !textoBusqueda);
  renderProductos();
});

btnLimpiar.addEventListener('click', () => {
  inputBuscar.value = '';
  textoBusqueda = '';
  btnLimpiar.classList.add('hidden');
  renderProductos();
  inputBuscar.focus();
});

// ===== HELPERS =====
function formatPrecio(n) {
  return '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setError(errId, inputId, msg) {
  document.getElementById(errId).textContent = msg;
  document.getElementById(inputId).classList.add('error');
}

function limpiarErrores() {
  ['errNombre', 'errPrecio', 'errCategoria'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
  ['inputNombre', 'inputPrecio', 'inputCategoria'].forEach(id => {
    document.getElementById(id).classList.remove('error');
  });
}

// ===== TOAST =====
function toast(mensaje, tipo = 'success') {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${tipo}`;
  const icon = tipo === 'success' ? '✅' : tipo === 'error' ? '❌' : 'ℹ️';
  el.innerHTML = `<span class="toast-icon">${icon}</span><span>${escapeHtml(mensaje)}</span><div class="toast-bar"></div>`;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('fade-out');
    el.addEventListener('animationend', () => el.remove());
  }, 3000);
}

// ===== INIT =====
btnLimpiar.classList.add('hidden');
initCharts();
cargarProductos();
