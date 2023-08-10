const express = require('express');
const crypto = require('node:crypto');
const cors = require('cors');
const movies = require('./movies.json');
const { validateMovie, validateParcialmovie } = require('./schema/movies');

const app = express(); // Inicializamos express
app.disable('x-powered-by'); // Deshabilita el header x-powered-by: express
app.use(express.json()); // Middleware que transforma los jsons que llegan en objetos de javascript

// Middleware para validar el origin en CORS
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://localhost:1234',
      'http://127.0.0.1:5500',
      'http://movies.com'
    ];

    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
      return callback(null, true);
    }
    if (!origin) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed'));
  }
}));

// Devuelve en la página de inicio el mensaje 'Hola Mundo'
app.get('/', (req, res) => {
  res.json({ mensaje: 'Hola Mundo' });
});

// Lista de origenes aceptados para CORS

app.get('/movies', (req, res) => {
  // const origin = req.header('origin');
  // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
  //   res.header('Access-Control-Allow-Origin', origin);
  // }

  // Obtenemos el parametro de generos para realizar la busqueda
  const { genre } = req.query;

  // Si el parametro de busqueda es un genero, filtramos las peliculas por el genero
  if (genre) {
    const filterMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    );
    return res.json(filterMovies);
  }
  // Si no se pasa ningun parametro, regresamos todas las peliculas
  return res.json(movies);
});

// Lista de peliculas por ID
app.get('/movies/:id', (req, res) => {
  const { id } = req.params;

  const movie = movies.find(movie => movie.id === id);
  if (movie) return res.json(movie);

  res.status(404).json({ message: 'Movie not found' });
});

// POST para agrega una pelicula nueva
app.post('/movies', (req, res) => {
  // Validamos que la estructura de los datos sea correcta
  const result = validateMovie(req.body);

  // Si hay un error en la estructura validad regresamos la respuesta con el error
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
    // NOTA: Tambien se podría usar el status code: 422 - Unprocessable Entity
  }

  // En caso de la estructura de los datos ser correcta, creamos el objeto con los datos
  const newMovie = {
    // Crea un UUID v.4
    id: crypto.randomUUID(),
    // Esta linea reemplaza todas las siguientes, ya que no son necesarias gracias a que estamos validando los datos desde el schema
    ...result.data

    // title,
    // year,
    // director,
    // duration,
    // poster,
    // genre,
    // rate: rate ?? 0
  };
  // Esto no es REST porque estamos guardando por lo mientras en memoria
  // Se continuara la carga a una bbdd en la siguiente clase

  // Agregamos el objeto a la lista de peliculas
  movies.push(newMovie);
  res.status(201).json(newMovie);
});

// PATCH para actualizar datos de una pelicula
app.patch('/movies/:id', (req, res) => {
  // Validamos que la estructura de los datos sea correcta
  const result = validateParcialmovie(req.body);

  // Si la validación de los datos no es correcta regresamos el error
  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  // Recuperamos el ID de los parametros del request
  const { id } = req.params;

  // Buscamos el indice a traves del ID recuperado
  const movieIndex = movies.findIndex(movie => movie.id === id);

  // Si no se encuentra el ID mandamos mensaje de error
  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie no found' });
  }

  // Creamos el objeto que se va a actualizar con los datos de la pelicula que estamos actualizando y los datos que se van a actualizar
  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  };

  // Actualizamos el objeto indicando el indice y mandando el objeto actual
  movies[movieIndex] = updateMovie;

  // Regresamos el JSON actualizado
  return res.json(updateMovie);
});

app.delete('/movies/:id', (req, res) => {
  // const origin = req.header('origin');
  // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
  //   res.header('Access-Control-Allow-Origin', origin);
  // };

  const { id } = req.params;
  const movieIndex = movies.findIndex(movie => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' });
  };

  movies.splice(movieIndex, 1);

  return res.json({ message: 'Movie deleted' });
});

// app.options('/movies/:id', (req, res) => {
//   const origin = req.header('origin');
//   if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
//     res.header('Access-Control-Allow-Origin', origin);
//     res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');
//   }
//   res.send();
// });

// Indicamos el puerto en el que se va a ejecutar la aplicacion
const PORT = process.env.PORT ?? 1234;
// Ponemos en escucha el servidor
app.listen(PORT, () => {
  console.log(`Server listening on port: http://localhost:${PORT}`);
});
