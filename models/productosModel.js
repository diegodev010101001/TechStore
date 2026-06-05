let productos = [
  { id: 1,  nombre: "Laptop Dell XPS 15",           precio: 28999, categoria: "Laptops"        },
  { id: 2,  nombre: "MacBook Air M3",                precio: 32999, categoria: "Laptops"        },
  { id: 3,  nombre: "iPhone 15 Pro",                 precio: 22999, categoria: "Smartphones"    },
  { id: 4,  nombre: "Samsung Galaxy S24 Ultra",      precio: 24999, categoria: "Smartphones"    },
  { id: 5,  nombre: "Monitor LG 27\" 4K",            precio: 9500,  categoria: "Monitores"      },
  { id: 6,  nombre: "Monitor Samsung Odyssey 32\"",  precio: 12499, categoria: "Monitores"      },
  { id: 7,  nombre: "Teclado Mecánico Logitech G915",precio: 3299,  categoria: "Periféricos"    },
  { id: 8,  nombre: "Mouse MX Master 3S",            precio: 1999,  categoria: "Periféricos"    },
  { id: 9,  nombre: "AirPods Pro 2da Gen",           precio: 7999,  categoria: "Audio"          },
  { id: 10, nombre: "Sony WH-1000XM5",               precio: 8499,  categoria: "Audio"          },
  { id: 11, nombre: "SSD Samsung 990 Pro 1TB",       precio: 1899,  categoria: "Almacenamiento" },
  { id: 12, nombre: "Disco Externo WD 2TB",          precio: 1299,  categoria: "Almacenamiento" },
];

let nextId = 13;

const getAll = () => productos;

const getById = (id) => productos.find(p => p.id === parseInt(id));

const create = ({ nombre, precio, categoria }) => {
  const nuevo = { id: nextId++, nombre, precio: parseFloat(precio), categoria };
  productos.push(nuevo);
  return nuevo;
};

const remove = (id) => {
  const index = productos.findIndex(p => p.id === parseInt(id));
  if (index === -1) return null;
  const [eliminado] = productos.splice(index, 1);
  return eliminado;
};

module.exports = { getAll, getById, create, remove };
