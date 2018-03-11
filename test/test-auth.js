'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const {app, runServer, closeServer} = require('../server');
const {User} = require('../users');
const {JWT_SECRET, TEST_DATABASE_URL} = require('../config');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Auth endpoints', function() {
  const email = 'exampleUser@example.com';
  const password = 'examplePass1234';

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function() {
    return User.hashPassword(password).then(hash =>
      User.create({email, password:hash})
    );
  });

  afterEach(function() {
    return User.remove({});
  });

  describe('/api/auth/login', function() {
    it('Should reject requests with no credentials', function() {
      return chai
        .request(app)
        .post('/api/auth/login')
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(400);
        });
    });

    it('Should reject requests with incorrect usernames', function() {
      return chai
        .request(app)
        .post('/api/auth/login')
        .send({email: 'wrongUsername', password})
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });

    it('Should reject requests with incorrect passwords', function() {
      return chai
        .request(app)
        .post('/api/auth/login')
        .send({email, password: 'wrongPassword'})
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });

    it('Should return a valid auth token', function() {
      return chai
        .request(app)
        .post('/api/auth/login')
        .send({email, password})
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {algorithm: ['HS256']});
        });
    });
  });

  describe('/api/auth/refresh', function() {
    it('Should reject requests with no credentials', function() {
      return chai
        .request(app)
        .post('/api/auth/refresh')
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });

    it('Should reject requests with an invalid token', function() {
      const exampleUser = User.findOne({});
      const token = jwt.sign(
        {
          id: exampleUser.id,
        },
        'wrongSecret',
        {
          algorithm: 'HS256',
          expiresIn: '7d'
        }
      );
      return chai
        .request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });

    it('Should reject requests with an expired token', function() {
      const exampleUser = User.findOne({});
      const token = jwt.sign(
        {
          id: exampleUser.id,
        },
        'wrongSecret',
        {
          algorithm: 'HS256',
          expiresIn: '7d'
        }
      );
      return chai
        .request(app)
        .post('/api/auth/refresh')
        .set('authorization', `Bearer ${token}`)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });

    it('Should return a valid auth token with a newer expiry date', async function() {
      let res = await chai.request(app)
        .post('/api/auth/login')
        .send({email, password})
      let token = res.body.authToken;
      res = await chai.request(app)
        .post('/api/auth/refresh')
        .set('authorization', `Bearer ${token}`)
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      token = res.body.authToken;
      expect(token).to.be.a('string');
      const payload = jwt.verify(token, JWT_SECRET, {algorithm: ['HS256']});
    });

  });
});

