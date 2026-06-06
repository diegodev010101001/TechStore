// analytics.js — Dashboard de Estadísticas
// Lógica de gráficas aislada; depende de Chart.js (cargado antes en index.html)

// Variable donde guardamos un catálogo de colores bonitos para pintar los pedazos de las gráficas.
const PALETTE = [
  '#2563eb', '#7c3aed', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#f97316', '#8b5cf6'
];

// Objeto para guardar la estructura básica que llevarán todas nuestras gráficas (cómo se ven, si son responsivas y cómo es la letra).
const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 700, easing: 'easeInOutQuart' },
  plugins: {
    legend: { labels: { font: { family: 'Inter', size: 12 }, color: '#1e293b', padding: 16 } },
    tooltip: {
      backgroundColor: '#0f172a',
      titleFont: { family: 'Inter', weight: '600', size: 13 },
      bodyFont: { family: 'Inter', size: 12 },
      padding: 10,
      cornerRadius: 8
    }
  }
};

const SCALE_X = {
  ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
  grid: { display: false }
};
const SCALE_Y_COUNT = {
  beginAtZero: true,
  ticks: { stepSize: 1, color: '#64748b', font: { family: 'Inter', size: 11 } },
  grid: { color: '#f1f5f9' }
};
const SCALE_Y_PRICE = {
  beginAtZero: true,
  ticks: {
    color: '#64748b', font: { family: 'Inter', size: 11 },
    callback: v => '$' + Number(v).toLocaleString('es-MX')
  },
  grid: { color: '#f1f5f9' }
};

// Guardaremos las gráficas reales aquí adentro, para poder borrarlas y redibujarlas después.
const _charts = {};

// Esta función simplemente crea "el lienzo en blanco" de nuestras 4 gráficas en el HTML, pero no les pone datos todavía.
function initCharts() {
  // Inicializamos la gráfica 1: Tipo barra vertical para categorías.
  _charts.barCat = new Chart(
    document.getElementById('chartBarCategorias'),
    {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Productos',
          data: [],
          backgroundColor: PALETTE,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        ...CHART_DEFAULTS,
        plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
        scales: { x: SCALE_X, y: SCALE_Y_COUNT }
      }
    }
  );

  // Inicializamos la gráfica 2: Tipo Dona (pastel con hueco) para los porcentajes.
  _charts.pie = new Chart(
    document.getElementById('chartPie'),
    {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: PALETTE,
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverOffset: 8
        }]
      },
      options: {
        ...CHART_DEFAULTS,
        cutout: '55%',
        plugins: {
          ...CHART_DEFAULTS.plugins,
          legend: {
            position: 'bottom',
            labels: { font: { family: 'Inter', size: 12 }, color: '#1e293b', padding: 14 }
          },
          tooltip: {
            ...CHART_DEFAULTS.plugins.tooltip,
            callbacks: {
              label: ctx => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                return `  ${ctx.label}: ${ctx.parsed} producto${ctx.parsed !== 1 ? 's' : ''} (${pct}%)`;
              }
            }
          }
        }
      }
    }
  );

  // Inicializamos la gráfica 3: Tipo barra horizontal para el ranking de precios.
  _charts.hbar = new Chart(
    document.getElementById('chartHBarPrecios'),
    {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Precio (MXN)',
          data: [],
          backgroundColor: PALETTE,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        ...CHART_DEFAULTS,
        indexAxis: 'y',
        plugins: {
          ...CHART_DEFAULTS.plugins,
          legend: { display: false },
          tooltip: {
            ...CHART_DEFAULTS.plugins.tooltip,
            callbacks: {
              label: ctx => `  $${Number(ctx.parsed.x).toLocaleString('es-MX')} MXN`
            }
          }
        },
        scales: {
          x: {
            ...SCALE_Y_PRICE,
            grid: { color: '#f1f5f9' }
          },
          y: {
            ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
            grid: { display: false }
          }
        }
      }
    }
  );

  // Inicializamos la gráfica 4: Tipo barra vertical para promedios de precios.
  _charts.avgCat = new Chart(
    document.getElementById('chartPromedios'),
    {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Precio Promedio (MXN)',
          data: [],
          backgroundColor: PALETTE,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        ...CHART_DEFAULTS,
        plugins: {
          ...CHART_DEFAULTS.plugins,
          legend: { display: false },
          tooltip: {
            ...CHART_DEFAULTS.plugins.tooltip,
            callbacks: {
              label: ctx => `  $${Number(ctx.parsed.y).toLocaleString('es-MX')} MXN promedio`
            }
          }
        },
        scales: { x: SCALE_X, y: SCALE_Y_PRICE }
      }
    }
  );
}

// Esta es la función principal que toma todos nuestros productos y llena las gráficas de información matemática.
function renderDashboard(productos) {
  // Si por alguna razón nos quedamos sin ningún producto, blanqueamos todo (limpiamos las gráficas).
  if (!productos || productos.length === 0) {
    // Limpia los números...
    _updateKPIs({});
    // Limpia y actualiza gráficas borrándole los datos...
    Object.values(_charts).forEach(c => {
      c.data.labels = [];
      c.data.datasets[0].data = [];
      c.update();
    });
    return;
  }

  // Agrupación por categoría. Aquí creamos "cubetas" separadas para cada categoría y vamos sumando sus productos.
  const byCategory = {};
  productos.forEach(p => {
    // Si la cubeta de la categoría no existe, la creamos con conteo 0 y precio total 0.
    if (!byCategory[p.categoria]) byCategory[p.categoria] = { count: 0, total: 0 };
    // Por cada producto, le sumamos 1 a la cuenta y acumulamos su precio.
    byCategory[p.categoria].count++;
    byCategory[p.categoria].total += p.precio;
  });

  // Obtenemos una lista simple de los nombres de categorías (ej. "Laptops", "Monitores").
  const catNames = Object.keys(byCategory);
  // Obtenemos listas separadas de los conteos y los promedios.
  const catCounts = catNames.map(c => byCategory[c].count);
  const catAvgs   = catNames.map(c => Math.round(byCategory[c].total / byCategory[c].count));

  // Duplicamos el arreglo y lo ordenamos de Mayor a Menor precio usando 'sort'.
  const sorted    = [...productos].sort((a, b) => b.precio - a.precio);
  // 'slice(0,8)' corta ese arreglo ordenado para quedarnos únicamente con el "Top 8" de más caros.
  const topN      = sorted.slice(0, 8);

  // Pasamos todos los datos (el más caro [posición 0], más barato [posición final], y promedios) a los cajones superiores del Dashboard.
  // KPIs
  _updateKPIs({
    total:     productos.length,
    categorias: catNames.length,
    promedio:  productos.reduce((s, p) => s + p.precio, 0) / productos.length,
    masCaro:   sorted[0],
    masBarato: sorted[sorted.length - 1]
  });

  // Finalmente, le decimos a cada gráfica que se dibuje con los nuevos datos organizados.
  // Gráfica 1 — Barras categorías
  _setChart(_charts.barCat, catNames, catCounts);

  // Gráfica 2 — Pastel
  _setChart(_charts.pie, catNames, catCounts);

  // Para la gráfica de barras horizontales que muestra nombres largos, hacemos un pequeño corte ("...") a los textos para que quepan en pantalla si miden más de 24 letras.
  const hLabels = topN.map(p => p.nombre.length > 24 ? p.nombre.slice(0, 22) + '…' : p.nombre);
  _setChart(_charts.hbar, hLabels, topN.map(p => p.precio));

  // Gráfica 4 — Promedios
  _setChart(_charts.avgCat, catNames, catAvgs);
}

// Una pequeña función "ayudante" que automatiza inyectar la información y los colores bonitos a cualquier gráfica que le mandemos.
function _setChart(chart, labels, data) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.data.datasets[0].backgroundColor = labels.map((_, i) => PALETTE[i % PALETTE.length]);
  chart.update(); // Dispara la animación de dibujo en la página.
}

function _updateKPIs({ total, categorias, promedio, masCaro, masBarato } = {}) {
  const fmt = n => '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const _set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  _set('kpiTotalVal',      total      ?? 0);
  _set('kpiCategoriasVal', categorias ?? 0);
  _set('kpiPromedioVal',   promedio   ? fmt(promedio) : '$0');

  _set('kpiMasCaroVal',    masCaro  ? fmt(masCaro.precio)  : '$0');
  _set('kpiMasCaroSub',    masCaro  ? masCaro.nombre        : '—');
  _set('kpiMasBaratoVal',  masBarato ? fmt(masBarato.precio) : '$0');
  _set('kpiMasBaratoSub',  masBarato ? masBarato.nombre      : '—');
}
