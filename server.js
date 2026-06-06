// Importamos 'express', una herramienta que nos facilita muchísimo la creación de servidores web.
const express = require('express');
// Importamos 'path', una herramienta de Node.js que nos ayuda a unir las rutas de las carpetas sin importar si estamos en Windows o Mac.
const path = require('path');
// Creamos nuestra aplicación ejecutando la función 'express()'. Esta variable 'app' representa a todo nuestro servidor.
const app = express();
// Definimos en qué "puerto" (canal de comunicación) va a escuchar nuestro servidor. Usará el que la computadora le asigne (process.env.PORT) o el 3000 por defecto.
const PORT = process.env.PORT || 3000;

// Le decimos a nuestra aplicación que sea capaz de entender la información que le enviamos en formato JSON (que es como se comunican las páginas web hoy en día).
app.use(express.json());
// Configuramos una carpeta pública. Esto hace que cualquier archivo dentro de la carpeta 'public' (como tus imágenes, CSS o index.html) pueda ser visto libremente desde el navegador de internet.
app.use(express.static(path.join(__dirname, 'public')));

// Le indicamos al servidor que, si alguien visita la URL que termine en '/api/productos', debe ir a buscar las reglas de qué hacer al archivo './routes/productos'.
app.use('/api/productos', require('./routes/productos'));

// La ruta '*' funciona como un atrapalotodo. Significa "cualquier otra dirección web que el usuario intente visitar y no hayamos definido antes".
app.get('*', (req, res) => {
  // Cuando eso pase, en lugar de mostrar un error de "Página no encontrada", le enviamos nuestro archivo principal 'index.html'. Esto es muy común en aplicaciones de una sola página.
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Finalmente, le decimos a nuestro servidor que se "encienda" y empiece a escuchar en el puerto que definimos arriba (el 3000).
app.listen(PORT, () => {
  // Una vez que el servidor arranca con éxito, imprimimos este mensaje en la consola para saber que todo salió bien.
  console.log(`TechStore corriendo en http://localhost:${PORT}`);
});
