const express = require("express"),
  morgan = require('morgan');
const app = express();

let topMovies = [
  {
    title: 'Braveheart',
    director: 'Mel Gibson',
    genre: 'action'
  },
  {
    title: 'Reservoir Dogs',
    director: 'Quentin Tarantino',
    genre: 'action'
  },
  {
    title: 'Idiocracy',
    director: 'Mike Judge',
    genre: 'comedy'
  },
  {
    title: 'Office Space',
    director: 'Mike Judge',
    genre: 'comedy'
  },
  {
    title: 'Dumb and Dumber',
    director: 'Farrely Brothers',
    genre: 'comedy'
  },
  {
    title: 'Terminator 2',
    director: 'James Cameron',
    genre: 'action'
  },
  {
    title: 'Trainspotting',
    director: 'Danny Boyle',
    genre: 'drama'
  },
  {
    title: 'Snatch',
    director: 'Guy Ritchie',
    genre: 'drama'
  },
  {
    title: 'Fight Club',
    director: 'David Fincher',
    genre: 'comedy'
  },
  {
    title: 'The Godfather',
    director: 'Francis Ford Coppolla',
    genre: 'drama'
  },
];



// GET requests

app.use(express.static('public'));
app.use(morgan('common'));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ain\'t workin\'')
});

app.get('/', (req, res) => {
  res.send('Here\'s something on movies');
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.get('/movies/:title', (req, res) => {
  let titleMovies = topMovies.filter((film) => { return film.title == req.params.title});
  //logic to filter topMovies by director field
  res.json(titleMovies);
  console.log('Successful GET request returing information about ' + req.params.title);
});

app.get('/:genre', (req, res) => {
  let genreMovies = topMovies.filter((film) => { return film.genre == req.params.genre});
  //logic to filter topMovies by director field
  res.json(genreMovies);
  console.log('Successful GET request of ' + req.params.genre + ' movies');
});

app.delete('/movies/:title', (req, res) => {
  let movieDelete = topMovies.find((movie) => { return movie.title === req.params.title});

  if (movieDelete) {
    topMovies = topMovies.filter((obj) => { return obj.title !== req.params.title});
    res.status(201).send(req.params.title + ' was deleted.');
  }
});


// listen for requests
app.listen(8080, () =>
  console.log('Your app is listening on port 8080.')
);
