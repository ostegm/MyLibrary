'use strict';
const {Strategy: LocalStrategy} = require('passport-local');
const {Strategy: JwtStrategy, ExtractJwt} = require('passport-jwt');

const {User} = require('../users/models');
const {JWT_SECRET} = require('../config');

const opt = {
  usernameField: 'email',
  passwordField: 'password',
  session: false
};

const localStrategy = new LocalStrategy(opt, (email, password, callback) => {
  let user;
  User.findOne({email: email})
    .then(_user => {
      user = _user;
      if (!user) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect email or password'
        });
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect email or password'
        });
      }
      return callback(null, user);
    })
    .catch(err => {
      if (err.reason === 'LoginError') {
        return callback(null, false, err);
      }
      return callback(err, false);
    });
});

const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    algorithms: ['HS256']
  },
  (payload, done) => {
    done(null, payload.user);
  }
);

module.exports = {localStrategy, jwtStrategy};