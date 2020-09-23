const express = require("express"),
  morgan = require('morgan');
const app = express();

let topMovies = [
  {
    title: 'Braveheart',
    director: 'Mel Gibson'
  },
  {
    title: 'Reservoir Dogs',
    director: 'Quentin Tarantino'
  },
  {
    title: 'Idiocracy',
    director: 'Mike Judge'
  },
  {
    title: 'Office Space',
    director: 'Mike Judge'
  },
  {
    title: 'Dumb and Dumber',
    director: 'Farrely Brothers'
  },
  {
    title: 'Terminator 2',
    director: 'James Cameron'
  },
  {
    title: 'Trainspotting',
    director: 'Danny Boyle'
  },
  {
    title: 'Snatch',
    director: 'Guy Ritchie'
  },
  {
    title: 'Fight Club',
    director: 'David Fincher'
  },
  {
    title: 'Godfather',
    director: 'Francis Ford Coppolla'
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


// listen for requests
app.listen(8080, () =>
  console.log('Your app is listening on port 8080.')
);
