'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const faker = require('faker');
mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {router: libraryRouter, Library} = require('./library');
const {router: usersRouter, User} = require('./users');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');
passport.use(localStrategy);
passport.use(jwtStrategy);
const jwtAuth = passport.authenticate('jwt', { session: false });

const app = express();

app.use(morgan('common'));
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

app.use(express.static('client'));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './client', 'index.html'));
});

// Routers
app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);
app.use('/api/library/', libraryRouter);


// Protected endpoint for testing.
app.get('/api/protected', jwtAuth, (req, res) => {
  return res.json({
    data: 'this is a supersecret endpoint.'
  });
});


app.use('*', (req, res) => {
  return res.status(404).json({status: 404, message: 'Not Found'});
});


//Setup an example account for demos.
const demoEmail = 'demo@test.com'
const demoPass = '1234567890'
async function setupDemoAccount() {
  let user = await User.findOne({email: demoEmail})
  if (!user) {
    let hash = await User.hashPassword(demoPass)
    user = await User.create({email: demoEmail, password: hash})
  };
  let existingBooks = await Library.count({userId: user._id})
  if (!existingBooks) {
    const seedData = [];
    for (let i = 1; i <= 8; i++) {
      seedData.push({
        userId: user._id,
        author: `${faker.name.firstName()} ${faker.name.lastName()}`,
        title: faker.lorem.sentence(),
        dateFinished: faker.date.past(10),
        comments: faker.lorem.text(),
      });
    }
    // this will return a promise
    let seeded = await Library.insertMany(seedData);
    console.log('Seeded demo account.')
  } else {
    console.log('Demo account already seeded.')
  }
}

async function clearDemoAccount() {
  let userId = await User.findOne({email: demoEmail})._id
  let removed = await Library.remove({userId});
  console.log('Removed demo account entries: ', removed)
}


// Referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer(databaseUrl, port = PORT) {
  setupDemoAccount()
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
