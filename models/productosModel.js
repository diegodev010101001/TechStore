// Creamos una variable llamada 'productos' que es una "lista" (Array) que funciona como nuestra base de datos en memoria.
let productos = [
  // Cada elemento entre { } es un producto. Tiene un número único (id), un nombre, un precio y su categoría.
  { id: 1,  nombre: "Laptop Dell XPS 15",               precio: 28999, categoria: "Laptops"        },
  { id: 2,  nombre: "MacBook Air M3",                    precio: 32999, categoria: "Laptops"        },
  { id: 3,  nombre: "iPhone 15 Pro",                     precio: 22999, categoria: "Smartphones"    },
  { id: 4,  nombre: "Samsung Galaxy S24 Ultra",          precio: 24999, categoria: "Smartphones"    },
  { id: 5,  nombre: "Monitor LG 27\" 4K",                precio: 9500,  categoria: "Monitores"      },
  { id: 6,  nombre: "Monitor Samsung Odyssey 32\"",      precio: 12499, categoria: "Monitores"      },
  { id: 7,  nombre: "Teclado Mecánico Logitech G915",    precio: 3299,  categoria: "Periféricos"    },
  { id: 8,  nombre: "Mouse MX Master 3S",                precio: 1999,  categoria: "Periféricos"    },
  { id: 9,  nombre: "AirPods Pro 2da Gen",               precio: 7999,  categoria: "Audio"          },
  { id: 10, nombre: "Sony WH-1000XM5",                   precio: 8499,  categoria: "Audio"          },
  { id: 11, nombre: "SSD Samsung 990 Pro 1TB",           precio: 1899,  categoria: "Almacenamiento" },
  { id: 12, nombre: "Disco Externo WD 2TB",              precio: 1299,  categoria: "Almacenamiento" },
  // Laptops
  { id: 13, nombre: "Laptop HP Spectre x360",            precio: 26999, categoria: "Laptops"        },
  { id: 14, nombre: "Lenovo ThinkPad X1 Carbon",         precio: 30499, categoria: "Laptops"        },
  { id: 15, nombre: "ASUS ROG Zephyrus G14",             precio: 31999, categoria: "Laptops"        },
  { id: 16, nombre: "Acer Swift 3",                      precio: 13999, categoria: "Laptops"        },
  { id: 17, nombre: "Microsoft Surface Laptop 5",        precio: 27499, categoria: "Laptops"        },
  { id: 18, nombre: "MSI Stealth 16 Studio",             precio: 34999, categoria: "Laptops"        },
  { id: 19, nombre: "Razer Blade 15",                    precio: 36999, categoria: "Laptops"        },
  // Smartphones
  { id: 20, nombre: "Google Pixel 8 Pro",                precio: 19999, categoria: "Smartphones"    },
  { id: 21, nombre: "OnePlus 12",                        precio: 15999, categoria: "Smartphones"    },
  { id: 22, nombre: "Xiaomi 14 Ultra",                   precio: 21499, categoria: "Smartphones"    },
  { id: 23, nombre: "iPhone 15",                         precio: 17999, categoria: "Smartphones"    },
  { id: 24, nombre: "Samsung Galaxy A55",                precio: 9499,  categoria: "Smartphones"    },
  { id: 25, nombre: "Motorola Edge 50 Pro",              precio: 11999, categoria: "Smartphones"    },
  // Monitores
  { id: 26, nombre: "Dell UltraSharp U2723D 27\"",       precio: 11299, categoria: "Monitores"      },
  { id: 27, nombre: "BenQ PD2725U 27\" 4K",             precio: 13999, categoria: "Monitores"      },
  { id: 28, nombre: "AOC CQ27G3S 27\" Curvo",           precio: 6799,  categoria: "Monitores"      },
  { id: 29, nombre: "ASUS ProArt PA279CV 27\"",          precio: 10499, categoria: "Monitores"      },
  { id: 30, nombre: "LG UltraWide 34\" WQHD",           precio: 14999, categoria: "Monitores"      },
  // Periféricos
  { id: 31, nombre: "Teclado Keychron Q1 Pro",           precio: 2899,  categoria: "Periféricos"    },
  { id: 32, nombre: "Mouse Razer DeathAdder V3",         precio: 1699,  categoria: "Periféricos"    },
  { id: 33, nombre: "Webcam Logitech C920 HD Pro",       precio: 1499,  categoria: "Periféricos"    },
  { id: 34, nombre: "Mousepad Logitech G840 XL",         precio: 899,   categoria: "Periféricos"    },
  { id: 35, nombre: "Hub USB-C Anker 7 en 1",            precio: 999,   categoria: "Periféricos"    },
  { id: 36, nombre: "Controlador Xbox Inalámbrico",      precio: 1299,  categoria: "Periféricos"    },
  { id: 37, nombre: "Soporte Laptop Ergotron LX",        precio: 1799,  categoria: "Periféricos"    },
  // Audio
  { id: 38, nombre: "Jabra Evolve2 85",                  precio: 9999,  categoria: "Audio"          },
  { id: 39, nombre: "Bose QuietComfort 45",              precio: 7499,  categoria: "Audio"          },
  { id: 40, nombre: "Samsung Galaxy Buds2 Pro",          precio: 3999,  categoria: "Audio"          },
  { id: 41, nombre: "Sennheiser HD 560S",                precio: 4299,  categoria: "Audio"          },
  { id: 42, nombre: "Edifier R1280DB Bocinas Estéreo",   precio: 2499,  categoria: "Audio"          },
  { id: 43, nombre: "JBL Charge 5 Portátil",            precio: 2799,  categoria: "Audio"          },
  // Almacenamiento
  { id: 44, nombre: "SSD Kingston NV2 2TB",              precio: 1599,  categoria: "Almacenamiento" },
  { id: 45, nombre: "NAS Synology DS223",                precio: 8999,  categoria: "Almacenamiento" },
  { id: 46, nombre: "USB SanDisk Extreme Pro 256GB",     precio: 699,   categoria: "Almacenamiento" },
  { id: 47, nombre: "Tarjeta SD Samsung Pro 128GB",      precio: 499,   categoria: "Almacenamiento" },
  { id: 48, nombre: "Disco Externo Seagate 4TB",         precio: 1899,  categoria: "Almacenamiento" },
  { id: 49, nombre: "SSD WD Black SN850X 1TB NVMe",     precio: 2199,  categoria: "Almacenamiento" },
  { id: 50, nombre: "Disco Externo LaCie Rugged 1TB",   precio: 1499,  categoria: "Almacenamiento" },
];

// Creamos una variable 'nextId' que inicia en 51. Nos servirá para saber qué número darle al próximo producto nuevo que agreguemos.
let nextId = 51;

// Función para devolver la lista completa de productos tal y como está.
const getAll = () => productos;

// Función que busca un producto por su ID. Convierte el ID a número entero (parseInt) y busca en la lista si hay alguno que coincida.
const getById = (id) => productos.find(p => p.id === parseInt(id));

// Función para crear y guardar un producto nuevo en nuestra lista.
const create = ({ nombre, precio, categoria }) => {
  // Armamos el "paquete" del nuevo producto. Le asignamos el 'nextId', aumentamos 'nextId' en 1 para la próxima vez (nextId++), y guardamos el resto.
  const nuevo = { id: nextId++, nombre, precio: parseFloat(precio), categoria };
  // Agregamos este paquete nuevo al final de nuestra lista de productos con el método push.
  productos.push(nuevo);
  // Devolvemos el producto recién creado para que el controlador pueda verlo.
  return nuevo;
};

// Función para borrar un producto de la lista.
const remove = (id) => {
  // Buscamos en qué posición (índice) de la lista se encuentra el producto que tiene ese ID.
  const index = productos.findIndex(p => p.id === parseInt(id));
  // Si nos devuelve -1, significa que no lo encontró en la lista. Devolvemos "nulo" (nada).
  if (index === -1) return null;
  // Si lo encontró, usamos '.splice' para recortar y sacar exactamente ese 1 elemento de la lista.
  const [eliminado] = productos.splice(index, 1);
  // Devolvemos el elemento que acabamos de sacar para indicar cuál se borró.
  return eliminado;
};

// Hacemos públicas las 4 funciones para que el archivo del controlador las pueda utilizar.
module.exports = { getAll, getById, create, remove };
