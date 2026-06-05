const model = require('../models/productosModel');

const getAll = (req, res) => {
  const { categoria, buscar } = req.query;
  let lista = model.getAll();

  if (categoria && categoria !== 'Todos') {
    lista = lista.filter(p => p.categoria === categoria);
  }
  if (buscar) {
    const q = buscar.toLowerCase();
    lista = lista.filter(p => p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q));
  }

  res.json(lista);
};

const getById = (req, res) => {
  const producto = model.getById(req.params.id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(producto);
};

const create = (req, res) => {
  const { nombre, precio, categoria } = req.body;
  if (!nombre || !precio || !categoria) {
    return res.status(400).json({ error: 'nombre, precio y categoria son requeridos' });
  }
  if (isNaN(precio) || parseFloat(precio) <= 0) {
    return res.status(400).json({ error: 'El precio debe ser un número positivo' });
  }
  const nuevo = model.create({ nombre: nombre.trim(), precio, categoria: categoria.trim() });
  res.status(201).json(nuevo);
};

const remove = (req, res) => {
  const eliminado = model.remove(req.params.id);
  if (!eliminado) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ mensaje: 'Producto eliminado correctamente', producto: eliminado });
};

module.exports = { getAll, getById, create, remove };
