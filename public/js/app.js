// Guardamos la dirección de nuestro servidor web en una variable constante para usarla más fácil después.
const API = '/api/productos';

// Creamos variables para guardar los productos, saber qué categoría estamos viendo, y qué texto se está buscando.
let todosLosProductos = [];
let categoriaActiva = 'Todos';
let textoBusqueda = '';

// ===== CONEXIÓN AL SERVIDOR (FETCH) =====
// Esta función asíncrona es la que va a internet (o a nuestro servidor) a pedir los datos.
async function cargarProductos() {
  try {
    // Usamos 'fetch' para tocar la puerta de la API y le decimos "dame la info".
    const res = await fetch(API);
    // Convertimos esa información a un formato que Javascript entienda (JSON) y la guardamos en nuestra lista.
    todosLosProductos = await res.json();
    // Llamamos a otras funciones para que dibujen los botones, las gráficas y las tarjetas en la pantalla.
    renderCategoryTabs();
    renderStats();
    renderProductos();
    renderDashboard(todosLosProductos);
  } catch {
    // Si algo sale mal (ej. el servidor está apagado), mostramos una notificación roja de error.
    toast('Error al conectar con la API', 'error');
  }
}

// ===== ESTADÍSTICAS RÁPIDAS =====
// Esta función calcula y muestra los 4 cuadritos de resumen de arriba (Total, Categorías, Promedio, etc).
function renderStats() {
  const productos = todosLosProductos;
  // Usamos 'Set' que es un truco matemático para obtener las categorías sin repetir nombres.
  const categorias = new Set(productos.map(p => p.categoria));
  const total = productos.length;
  // Calculamos el promedio: sumamos todos los precios y dividimos entre el total. Si no hay productos, es 0.
  const promedio = total ? productos.reduce((s, p) => s + p.precio, 0) / total : 0;
  // Buscamos el precio más alto de toda la lista.
  const max = total ? Math.max(...productos.map(p => p.precio)) : 0;

  // Pegamos estos números calculados en los textos correspondientes del HTML.
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statCategorias').textContent = categorias.size;
  document.getElementById('statPromedio').textContent = formatPrecio(promedio);
  document.getElementById('statMax').textContent = formatPrecio(max);
}

// ===== BOTONES DE CATEGORÍAS =====
// Esta función dibuja los botoncitos para filtrar (Todos, Laptops, Audio, etc).
function renderCategoryTabs() {
  // Obtenemos una lista de todas las categorías únicas y le agregamos "Todos" al principio.
  const cats = ['Todos', ...new Set(todosLosProductos.map(p => p.categoria))];
  const container = document.getElementById('categoryTabs');

  // Limpiamos los botones que estuvieran antes.
  container.innerHTML = '';
  // Para cada categoría, fabricamos un botón nuevo en la memoria.
  cats.forEach(cat => {
    const btn = document.createElement('button');
    // Le ponemos una clase CSS para que se vea bonito y si es la activa, lo pintamos de azul.
    btn.className = 'cat-btn' + (cat === categoriaActiva ? ' active' : '');
    btn.dataset.cat = cat;
    btn.textContent = cat; // Le ponemos el texto (ej. "Laptops").
    
    // Le decimos: "Cuando alguien te haga clic, cambia la categoría activa por la tuya y vuelve a dibujar los productos".
    btn.addEventListener('click', () => {
      categoriaActiva = cat;
      // Quitamos el color azul de todos los botones y se lo ponemos solo al que acaban de clicar.
      container.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
      renderProductos();
    });
    // Finalmente, pegamos el botón fabricado en la página HTML.
    container.appendChild(btn);
  });

  // Hacemos algo parecido para llenar las opciones del campo "Categoría" en la ventanita de agregar producto.
  const dl = document.getElementById('categoriasDatalist');
  dl.innerHTML = '';
  cats.slice(1).forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    dl.appendChild(opt);
  });
}

// ===== DIBUJAR LOS PRODUCTOS EN PANTALLA =====
// Esta función filtra y dibuja las "tarjetas" de cada producto.
function renderProductos() {
  // Hacemos una copia de nuestra lista maestra.
  let lista = [...todosLosProductos];

  // Si estamos en una pestaña diferente a "Todos", filtramos la lista para que solo queden esos.
  if (categoriaActiva !== 'Todos') {
    lista = lista.filter(p => p.categoria === categoriaActiva);
  }
  // Si escribimos en el buscador de arriba, filtramos para que solo queden los que coincidan con la búsqueda.
  if (textoBusqueda) {
    const q = textoBusqueda.toLowerCase();
    lista = lista.filter(p =>
      p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q)
    );
  }

  // Buscamos la cuadrícula y la limpiamos vaciando su contenido.
  const grid = document.getElementById('productsGrid');
  const empty = document.getElementById('emptyState');
  const info  = document.getElementById('resultsInfo');
  grid.innerHTML = '';

  // Si después de filtrar no quedó ningún producto, mostramos el dibujito de "Sin resultados".
  if (lista.length === 0) {
    empty.classList.remove('hidden'); // Quitar la clase 'hidden' lo hace visible.
    info.textContent = '';
    return; // Salimos de la función aquí.
  }
  // Si sí hay productos, escondemos el dibujito de "Sin resultados".
  empty.classList.add('hidden');

  // Mostramos el textito que dice "Mostrando X de Y productos".
  const total = todosLosProductos.length;
  info.textContent = lista.length === total
    ? `Mostrando ${total} producto${total !== 1 ? 's' : ''}`
    : `Mostrando ${lista.length} de ${total} producto${total !== 1 ? 's' : ''}`;

  // Para cada producto en nuestra lista filtrada, creamos una tarjeta y la pegamos en la cuadrícula HTML.
  lista.forEach(p => {
    const card = crearCard(p);
    grid.appendChild(card);
  });
}

// Esta función "fabrica" el HTML (visual) de una tarjeta individual de producto.
function crearCard(p) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.id = p.id;
  // Dibujamos toda la estructura con el nombre, precio formateado y el botón de eliminar. Usamos escapeHtml por seguridad.
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
  // Le agregamos la capacidad de escuchar clics al botón de eliminar, y que llame a la función 'confirmarEliminar'.
  card.querySelector('.btn-eliminar').addEventListener('click', () => confirmarEliminar(p));
  return card;
}

// ===== ELIMINAR =====
// Cuando tocan eliminar, preguntamos al usuario si está seguro con una ventana emergente del navegador.
function confirmarEliminar(p) {
  if (!confirm(`¿Eliminar "${p.nombre}" (${formatPrecio(p.precio)})?`)) return;
  // Si dicen que sí, disparamos la orden al servidor de borrar ese ID.
  eliminarProducto(p.id);
}

// Esta función es la que realmente manda la señal de borrado al Servidor.
async function eliminarProducto(id) {
  try {
    // Mandamos la petición 'DELETE' a la ruta de la API con el ID del producto.
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(); // Si algo falló lanzamos un error.
    
    const data = await res.json();
    // Borramos el producto también de nuestra lista local de Javascript.
    todosLosProductos = todosLosProductos.filter(p => p.id !== id);
    
    // Volvemos a dibujar TODO porque ahora falta un producto y las cuentas (gráficas y números) cambiaron.
    renderCategoryTabs();
    renderStats();
    renderProductos();
    renderDashboard(todosLosProductos);
    // Mostramos una notificación verde de éxito.
    toast(`"${data.producto.nombre}" eliminado`, 'success');
  } catch {
    toast('No se pudo eliminar el producto', 'error');
  }
}

// ===== MODAL (Ventanita Emergente de Agregar Producto) =====
const modalOverlay  = document.getElementById('modalOverlay');
const formProducto  = document.getElementById('formProducto');

// Para abrir la ventanita: Limpiamos lo que se haya escrito antes, quitamos errores rojos, y la hacemos visible.
function abrirModal() {
  formProducto.reset();
  limpiarErrores();
  modalOverlay.classList.remove('hidden');
  document.getElementById('inputNombre').focus(); // Ponemos el cursor del teclado ahí automáticamente.
}

// Para cerrar la ventanita: Solo la volvemos a ocultar añadiéndole la clase 'hidden'.
function cerrarModal() {
  modalOverlay.classList.add('hidden');
}

// Conectamos los botones de abrir, cerrar y cancelar con sus respectivas funciones.
document.getElementById('btnAbrirModal').addEventListener('click', abrirModal);
document.getElementById('btnCerrarModal').addEventListener('click', cerrarModal);
document.getElementById('btnCancelar').addEventListener('click', cerrarModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) cerrarModal(); });

// Si alguien presiona el teclado la tecla ESC, se cierra la ventanita.
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });

// ===== GUARDAR NUEVO PRODUCTO =====
// Escuchamos el evento de cuando el formulario envía sus datos (Submit).
formProducto.addEventListener('submit', async (e) => {
  // Evitamos que la página entera se recargue (que es lo que hace HTML por defecto).
  e.preventDefault();
  limpiarErrores();

  // Leemos lo que el usuario escribió en las cajas de texto y quitamos los espacios de los lados.
  const nombre    = document.getElementById('inputNombre').value.trim();
  const precio    = document.getElementById('inputPrecio').value.trim();
  const categoria = document.getElementById('inputCategoria').value.trim();
  let valido = true;

  // Verificamos si escribió el nombre. Si no, pintamos de rojo e indicamos error.
  if (!nombre) {
    setError('errNombre', 'inputNombre', 'El nombre es requerido');
    valido = false;
  }
  // Verificamos si escribió un precio y si es válido (mayor a 0 y es número).
  if (!precio || isNaN(precio) || parseFloat(precio) <= 0) {
    setError('errPrecio', 'inputPrecio', 'Ingresa un precio válido mayor a 0');
    valido = false;
  }
  // Verificamos si escribió la categoría.
  if (!categoria) {
    setError('errCategoria', 'inputCategoria', 'La categoría es requerida');
    valido = false;
  }
  // Si algo fue falso, nos salimos de la función y no mandamos nada al servidor.
  if (!valido) return;

  try {
    // Mandamos la orden de crear 'POST' al servidor.
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // Avisamos que la info va en JSON.
      // Empaquetamos la información del formulario a texto JSON.
      body: JSON.stringify({ nombre, precio: parseFloat(precio), categoria }),
    });
    
    // Si la respuesta no fue de éxito, mandamos alerta.
    if (!res.ok) {
      const err = await res.json();
      toast(err.error || 'Error al guardar', 'error');
      return;
    }
    
    // Si todo salió bien, el servidor nos devuelve el nuevo producto creado.
    const nuevo = await res.json();
    // Lo guardamos en nuestra lista local de Javascript.
    todosLosProductos.push(nuevo);
    // Cerramos la ventanita emergente.
    cerrarModal();
    // Regresamos a la pestaña "Todos" para que el usuario pueda ver el nuevo producto.
    categoriaActiva = 'Todos';
    
    // Volvemos a dibujar absolutamente todo para que se actualicen gráficas, botones y tarjetas.
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

// ===== FUNCIONES SECUNDARIAS (HELPERS) =====
// Esta función convierte un simple número 1200 en texto con formato de dinero "$1,200.00".
function formatPrecio(n) {
  return '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Esta función cambia símbolos peligrosos (<, >, ", &) por equivalentes inofensivos. Es vital para evitar hackeos si alguien escribe código raro en el nombre del producto.
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
// Pequeña función para mostrar las notificaciones con tiempo límite en la esquina de la pantalla.
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
// Al arrancar la página web, esta función le dice a las gráficas que se preparen y se carga la lista de productos.
btnLimpiar.classList.add('hidden');
initCharts();
cargarProductos();
