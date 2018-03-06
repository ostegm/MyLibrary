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

      it('Should reject users with non-trimmed email', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({email: ` ${email} `, password, cellphone})
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(500);
          });
      });

    //   it('Should reject users with empty username', function () {
    //     return chai
    //       .request(app)
    //       .post('/api/users')
    //       .send({
    //         username: '',
    //         password,
    //         firstName,
    //         lastName
    //       })
    //       .then(() =>
    //         expect.fail(null, null, 'Request should not succeed')
    //       )
    //       .catch(err => {
    //         if (err instanceof chai.AssertionError) {
    //           throw err;
    //         }

    //         const res = err.response;
    //         expect(res).to.have.status(422);
    //         expect(res.body.reason).to.equal('ValidationError');
    //         expect(res.body.message).to.equal(
    //           'Must be at least 1 characters long'
    //         );
    //         expect(res.body.location).to.equal('username');
    //       });
    //   });
    //   it('Should reject users with password less than ten characters', function () {
    //     return chai
    //       .request(app)
    //       .post('/api/users')
    //       .send({
    //         username,
    //         password: '123456789',
    //         firstName,
    //         lastName
    //       })
    //       .then(() =>
    //         expect.fail(null, null, 'Request should not succeed')
    //       )
    //       .catch(err => {
    //         if (err instanceof chai.AssertionError) {
    //           throw err;
    //         }

    //         const res = err.response;
    //         expect(res).to.have.status(422);
    //         expect(res.body.reason).to.equal('ValidationError');
    //         expect(res.body.message).to.equal(
    //           'Must be at least 10 characters long'
    //         );
    //         expect(res.body.location).to.equal('password');
    //       });
    //   });
    //   it('Should reject users with password greater than 72 characters', function () {
    //     return chai
    //       .request(app)
    //       .post('/api/users')
    //       .send({
    //         username,
    //         password: new Array(73).fill('a').join(''),
    //         firstName,
    //         lastName
    //       })
    //       .then(() =>
    //         expect.fail(null, null, 'Request should not succeed')
    //       )
    //       .catch(err => {
    //         if (err instanceof chai.AssertionError) {
    //           throw err;
    //         }

    //         const res = err.response;
    //         expect(res).to.have.status(422);
    //         expect(res.body.reason).to.equal('ValidationError');
    //         expect(res.body.message).to.equal(
    //           'Must be at most 72 characters long'
    //         );
    //         expect(res.body.location).to.equal('password');
    //       });
    //   });
    //   it('Should reject users with duplicate username', function () {
    //     // Create an initial user
    //     return User.create({
    //       username,
    //       password,
    //       firstName,
    //       lastName
    //     })
    //       .then(() =>
    //         // Try to create a second user with the same username
    //         chai.request(app).post('/api/users').send({
    //           username,
    //           password,
    //           firstName,
    //           lastName
    //         })
    //       )
    //       .then(() =>
    //         expect.fail(null, null, 'Request should not succeed')
    //       )
    //       .catch(err => {
    //         if (err instanceof chai.AssertionError) {
    //           throw err;
    //         }

    //         const res = err.response;
    //         expect(res).to.have.status(422);
    //         expect(res.body.reason).to.equal('ValidationError');
    //         expect(res.body.message).to.equal(
    //           'Username already taken'
    //         );
    //         expect(res.body.location).to.equal('username');
    //       });
    //   });
    //   it('Should create a new user', function () {
    //     return chai
    //       .request(app)
    //       .post('/api/users')
    //       .send({
    //         username,
    //         password,
    //         firstName,
    //         lastName
    //       })
    //       .then(res => {
    //         expect(res).to.have.status(201);
    //         expect(res.body).to.be.an('object');
    //         expect(res.body).to.have.keys(
    //           'username',
    //           'firstName',
    //           'lastName'
    //         );
    //         expect(res.body.username).to.equal(username);
    //         expect(res.body.firstName).to.equal(firstName);
    //         expect(res.body.lastName).to.equal(lastName);
    //         return User.findOne({
    //           username
    //         });
    //       })
    //       .then(user => {
    //         expect(user).to.not.be.null;
    //         expect(user.firstName).to.equal(firstName);
    //         expect(user.lastName).to.equal(lastName);
    //         return user.validatePassword(password);
    //       })
    //       .then(passwordIsCorrect => {
    //         expect(passwordIsCorrect).to.be.true;
    //       });
    //   });
    //   it('Should trim firstName and lastName', function () {
    //     return chai
    //       .request(app)
    //       .post('/api/users')
    //       .send({
    //         username,
    //         password,
    //         firstName: ` ${firstName} `,
    //         lastName: ` ${lastName} `
    //       })
    //       .then(res => {
    //         expect(res).to.have.status(201);
    //         expect(res.body).to.be.an('object');
    //         expect(res.body).to.have.keys(
    //           'username',
    //           'firstName',
    //           'lastName'
    //         );
    //         expect(res.body.username).to.equal(username);
    //         expect(res.body.firstName).to.equal(firstName);
    //         expect(res.body.lastName).to.equal(lastName);
    //         return User.findOne({
    //           username
    //         });
    //       })
    //       .then(user => {
    //         expect(user).to.not.be.null;
    //         expect(user.firstName).to.equal(firstName);
    //         expect(user.lastName).to.equal(lastName);
    //       });
    //   });
    // });

    // describe('GET', function () {
    //   it('Should return an empty array initially', function () {
    //     return chai.request(app).get('/api/users').then(res => {
    //       expect(res).to.have.status(200);
    //       expect(res.body).to.be.an('array');
    //       expect(res.body).to.have.length(0);
    //     });
    //   });
    //   it('Should return an array of users', function () {
    //     return User.create(
    //       {
    //         username,
    //         password,
    //         firstName,
    //         lastName
    //       },
    //       {
    //         username: usernameB,
    //         password: passwordB,
    //         firstName: firstNameB,
    //         lastName: lastNameB
    //       }
    //     )
    //       .then(() => chai.request(app).get('/api/users'))
    //       .then(res => {
    //         expect(res).to.have.status(200);
    //         expect(res.body).to.be.an('array');
    //         expect(res.body).to.have.length(2);
    //         expect(res.body[0]).to.deep.equal({
    //           username,
    //           firstName,
    //           lastName
    //         });
    //         expect(res.body[1]).to.deep.equal({
    //           username: usernameB,
    //           firstName: firstNameB,
    //           lastName: lastNameB
    //         });
    //       });
      // });
    });
  });
});