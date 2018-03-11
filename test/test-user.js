'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');
const {User} = require('../users');
const {TEST_DATABASE_URL} = require('../config');

const expect = chai.expect;
chai.use(chaiHttp);

describe('/api/user', function() {
  const email = 'exampleUser@example.com';
  const password = 'examplePass';
  const cellphone = 1111111111;

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function() { });

  afterEach(function() {
    return User.remove({});
  });

  describe('/api/users', function() {
    describe('POST', function() {
      it('Should reject users with missing email', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({password,cellphone})
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('email');
          });
      });

      it('Should reject users with missing email', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({password,cellphone})
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('email');
          });
      });

      it('Should reject users with missing password', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({email, cellphone})
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('password');
          });
      });

      it('Should reject users with missing cellphone', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({email, password})
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('cellphone');
          });
      });

      it('Should reject users with non-string email', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({email: 1234, password, cellphone})
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('email');
          });
      });

      it('Should reject users with non-string password', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({email, password: 1234, cellphone})
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('password');
          });
      });

      it('Should reject users with password less than ten characters', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({email, password: '123456789', cellphone})
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at least 10 characters long'
            );
            expect(res.body.location).to.equal('password');
          });
      });

      it('Should reject users with password greater than 72 characters', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({email, password: new Array(73).fill('a').join(''), cellphone})
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at most 72 characters long'
            );
            expect(res.body.location).to.equal('password');
          });
      });

      it('Should reject users with duplicate username', function () {
        // Create an initial user
        return User.create({email, password, cellphone})
          .then(() =>
            // Try to create a second user with the same username
            chai.request(app).post('/api/users').send(
              {email, password, cellphone})
          )
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Email already taken'
            );
            expect(res.body.location).to.equal('email');
          });
      });

      it('Should create a new user', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({email, password, cellphone})
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('email', 'cellphone', 'id');
            expect(res.body.email).to.equal(email);
            expect(res.body.cellphone).to.equal(cellphone);
            return User.findOne({
              email
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.cellphone).to.equal(cellphone);
            return user.validatePassword(password);
          })
          .then(passwordIsCorrect => {
            expect(passwordIsCorrect).to.be.true;
          });
      });

    });
  });
});