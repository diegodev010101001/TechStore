// Volvemos a importar 'express' porque lo necesitamos para usar su sistema de rutas.
const express = require('express');
// Creamos un "Enrutador", que es como un mini-servidor que solo se encarga de manejar direcciones web.
const router = express.Router();
// Importamos nuestro archivo controlador. Aquí es donde realmente está la lógica matemática y de guardado de los productos.
const ctrl = require('../controllers/productosController');

// Si nos hacen una petición 'GET' (es decir, nos piden información) a la ruta raíz ('/'), llamamos a la función 'getAll' del controlador para devolver todos los productos.
router.get('/',     ctrl.getAll);
// Si nos hacen una petición 'GET' pero le agregan un '/:id' (por ejemplo /1 o /25), llamamos a la función 'getById' para buscar solo ese producto en específico.
router.get('/:id',  ctrl.getById);
// Si nos hacen una petición 'POST' (es decir, nos envían información nueva para guardar), llamamos a la función 'create' del controlador.
router.post('/',    ctrl.create);
// Si nos hacen una petición 'DELETE' con un '/:id', significa que quieren borrar el producto con ese número. Llamamos a la función 'remove'.
router.delete('/:id', ctrl.remove);

// Finalmente, exportamos (hacemos público) este enrutador para que el archivo 'server.js' lo pueda utilizar.
module.exports = router;
