const mongoose = require('mongoose');
const Models = require('./models.js');
const bodyParser = require('body-parser');
const express = require("express"),
  morgan = require('morgan');
const app = express();
const path = require("path");
const cors = require('cors');
app.use(cors());
app.use(bodyParser());
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');
const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/myFlixDB', {useNewUrlParser: true,
//useUnifiedTopology: true });

//mongoose.connect('mongodb+srv://dill337:newpassword@dbclusters.ldlwd.mongodb.net/myFlixDB?retryWrites=true&w=majority',{useNewUrlParser: true,
//  useUnifiedTopology: true });)

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


//let Movie = mongoose.model('Movie', movieSchema);
//let User = mongoose.model('User', userSchema);




app.use(express.static('public'));
app.use("/client", express.static(path.join(__dirname, "client/dist")))
app.get("/client/*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist", "index.html"));
});
app.use(morgan('common'));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ain\'t workin\'')
});

/* We'll expect JSON in this information

{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date,
}*/
app.post('/users',
  // Validation logic here for requests
  //Can use chain of methods like .not().isEmpty()- OPPPOsite of isEmpty
  //Can use .isLength({min: 5}) means minnium of 5 characters only allowed
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {
    //check validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) //Search to see if username already exists
      .then((user) => {
        if (user) {
          //If user is found, send message that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              //    res.status.(500).send('Error: ' + error);
            });
        };
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });



// Get all users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Get a movie by title
app.get('/movies/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ _id: req.params.id })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//Get info about a director
app.get('/movies/Director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ "Director.Name": req.params.Name })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Get a data about a genre
app.get('/movies/genre/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ "Genre.Name": req.params.name })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/movies/:Title/genre', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});




//Get a user by Username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//Update a user;s info by username
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  let fields = Object.keys(req.body)
  let updateObject = {};
  fields.forEach((field) => {
    if (req.body[field] != undefined) {
      updateObject[field] = req.body[field]
    }
  })
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $set:
      { ...updateObject }
  },
    { new: true }, //this line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

//add a movie to a user's list of favorites
app.post('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  },
    { new: true }, //this line makes sure updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

app.put('/users/:Username/Movies/:_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params._id }
  },
    { new: true }, //this line makes sure updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});
//remove a movie from a user's list of favorites
app.delete('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.MovieID + 'was not found');
      } else {
        let movieID = req.params.MovieID;
        console.log(movieID);
        let movieIndex = user.FavoriteMovies.indexOf(movieID);
        let oldMovies = user.FavoriteMovies
        oldMovies.splice(movieIndex, 1);
        //let favoriteMovies = user.FavoriteMovies.filter((movieid) => movieid !== movieID)
        console.log(oldMovies);
        Users.findOneAndUpdate({ Username: req.params.Username }, {
          $set: {
            FavoriteMovies: oldMovies
          }
        }, { new: true }, //this line makes sure that the updated document is returned
          (err, updatedUser) => {
            if (err) {
              console.error(err);
              res.status(500).send('Error: ' + err);
            } else {
              res.status(200).send(req.params.MovieID + 'was deleted');
            }
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// GET requests

/*app.use(express.static('public'));
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
});*/


// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
