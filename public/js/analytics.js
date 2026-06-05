// analytics.js — Dashboard de Estadísticas
// Lógica de gráficas aislada; depende de Chart.js (cargado antes en index.html)

const PALETTE = [
  '#2563eb', '#7c3aed', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#f97316', '#8b5cf6'
];

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

const _charts = {};

function initCharts() {
  // Gráfica 1: Barras — Cantidad de productos por categoría
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

  // Gráfica 2: Pastel (doughnut) — Porcentaje por categoría
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

  // Gráfica 3: Barras horizontales — Productos más caros
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

  // Gráfica 4: Barras — Precio promedio por categoría
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

function renderDashboard(productos) {
  if (!productos || productos.length === 0) {
    _updateKPIs({});
    Object.values(_charts).forEach(c => {
      c.data.labels = [];
      c.data.datasets[0].data = [];
      c.update();
    });
    return;
  }

  // Agrupación por categoría
  const byCategory = {};
  productos.forEach(p => {
    if (!byCategory[p.categoria]) byCategory[p.categoria] = { count: 0, total: 0 };
    byCategory[p.categoria].count++;
    byCategory[p.categoria].total += p.precio;
  });

  const catNames = Object.keys(byCategory);
  const catCounts = catNames.map(c => byCategory[c].count);
  const catAvgs   = catNames.map(c => Math.round(byCategory[c].total / byCategory[c].count));

  const sorted    = [...productos].sort((a, b) => b.precio - a.precio);
  const topN      = sorted.slice(0, 8);

  // KPIs
  _updateKPIs({
    total:     productos.length,
    categorias: catNames.length,
    promedio:  productos.reduce((s, p) => s + p.precio, 0) / productos.length,
    masCaro:   sorted[0],
    masBarato: sorted[sorted.length - 1]
  });

  // Gráfica 1 — Barras categorías
  _setChart(_charts.barCat, catNames, catCounts);

  // Gráfica 2 — Pastel
  _setChart(_charts.pie, catNames, catCounts);

  // Gráfica 3 — Horizontal más caros
  const hLabels = topN.map(p => p.nombre.length > 24 ? p.nombre.slice(0, 22) + '…' : p.nombre);
  _setChart(_charts.hbar, hLabels, topN.map(p => p.precio));

  // Gráfica 4 — Promedios
  _setChart(_charts.avgCat, catNames, catAvgs);
}

function _setChart(chart, labels, data) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.data.datasets[0].backgroundColor = labels.map((_, i) => PALETTE[i % PALETTE.length]);
  chart.update();
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
