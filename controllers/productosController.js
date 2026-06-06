// Importamos el "Modelo", que es el archivo que se comunica con nuestros datos (la lista de productos).
const model = require('../models/productosModel');

// Creamos la función 'getAll' que se ejecutará cuando nos pidan la lista de productos. 'req' es lo que nos pide el usuario, 'res' es nuestra respuesta.
const getAll = (req, res) => {
  // Extraemos las palabras "categoria" y "buscar" de la URL (si es que el usuario las envió, por ejemplo en un filtro de búsqueda).
  const { categoria, buscar } = req.query;
  // Obtenemos todos los productos desde nuestro modelo de datos y los guardamos temporalmente en la variable 'lista'.
  let lista = model.getAll();

  // Si el usuario nos pidió una categoría específica y no es "Todos"...
  if (categoria && categoria !== 'Todos') {
    // Filtramos la lista para quedarnos solo con los productos cuya categoría coincida exactamente.
    lista = lista.filter(p => p.categoria === categoria);
  }
  // Si el usuario escribió algo en la barra de búsqueda...
  if (buscar) {
    // Convertimos lo que buscó a minúsculas para que no haya problemas si escribió "LAPTOP" o "laptop".
    const q = buscar.toLowerCase();
    // Filtramos la lista buscando si el nombre o la categoría del producto incluyen las letras que buscó el usuario.
    lista = lista.filter(p => p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q));
  }

  // Al final, le enviamos (respondemos) al usuario la lista resultante en formato JSON.
  res.json(lista);
};

// Función para obtener un solo producto por su número de ID.
const getById = (req, res) => {
  // Le pedimos al modelo que busque el producto usando el ID que venía en la URL (req.params.id).
  const producto = model.getById(req.params.id);
  // Si no se encontró ningún producto con ese ID, respondemos con un error 404 (No encontrado).
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  // Si lo encontró, lo enviamos de vuelta al usuario.
  res.json(producto);
};

// Función para crear un nuevo producto.
const create = (req, res) => {
  // Sacamos el nombre, precio y categoría de la información (el cuerpo) que nos envió el usuario en su petición POST.
  const { nombre, precio, categoria } = req.body;
  // Validamos: Si falta alguno de los 3 datos, le devolvemos un error 400 (Petición incorrecta).
  if (!nombre || !precio || !categoria) {
    return res.status(400).json({ error: 'nombre, precio y categoria son requeridos' });
  }
  // Validamos: Si el precio no es un número, o si es menor o igual a cero, también devolvemos un error.
  if (isNaN(precio) || parseFloat(precio) <= 0) {
    return res.status(400).json({ error: 'El precio debe ser un número positivo' });
  }
  // Si todo está correcto, le decimos al modelo que cree el producto. Usamos 'trim()' para quitarle espacios vacíos extra al principio o al final de los textos.
  const nuevo = model.create({ nombre: nombre.trim(), precio, categoria: categoria.trim() });
  // Respondemos con un código 201 (Creado con éxito) y le enviamos el producto que acabamos de crear.
  res.status(201).json(nuevo);
};

// Función para eliminar un producto.
const remove = (req, res) => {
  // Le pedimos al modelo que elimine el producto con el ID que viene en la URL.
  const eliminado = model.remove(req.params.id);
  // Si no pudo eliminarlo (porque no existía), devolvemos un error 404.
  if (!eliminado) return res.status(404).json({ error: 'Producto no encontrado' });
  // Si se eliminó bien, enviamos un mensaje de éxito y mostramos qué producto fue el eliminado.
  res.json({ mensaje: 'Producto eliminado correctamente', producto: eliminado });
};

// Exportamos todas estas funciones para que puedan ser utilizadas en el archivo de rutas.
module.exports = { getAll, getById, create, remove };
