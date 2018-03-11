'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const {Library} = require('./models');
const router = express.Router();
const jsonParser = bodyParser.json();
const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', {session: false});

router.use(jwtAuth);

// Get all books for a specific userId.
router.get('/', (req, res) => {
  // Protected by JWT auth, so all requests should have a user object.
  let userId = req.user.id;
  return Library.find({userId})
    .then(posts => {
      res.json(posts.map(post => post.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went wrong'});
    });
});


// Post to add a new book.
router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['title', 'author', 'dateFinished', 'userId'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  let {title, author, dateFinished} = req.body;
  let userId = req.user.id;
  return Library.find({userId, title, author})
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Book already present in library.',
        });
      }
    return {title, author, dateFinished, userId};
  }).then(newBook => {
    return Library.create(newBook);
  }).then( created => {
    return res.status(201).json(created.serialize());
  })
  .catch(err => {
    res.status(err.code).json(err);
  });

});

router.delete('/:id', (req, res) => {
  Library
    .findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
});

router.put('/:id', jsonParser, (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['title', 'author', 'dateFinished'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Library
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(() => res.status(204).end())
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
});


module.exports = {router};