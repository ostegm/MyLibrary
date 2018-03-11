'use strict';
const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const {app, runServer, closeServer} = require('../server');
const {User} = require('../users');
const {Library} = require('../library');
const {TEST_DATABASE_URL} = require('../config');

const expect = chai.expect;
chai.use(chaiHttp);

const TESTUSER = {
  email: 't@t.com',
  password: '1234567890',
  cellphone: 5555555555,
  userId: null //to be filled in by createTestUser()
};
let TOKEN = null; // to be filled in by createTestUser

function getValidToken() {
  return chai
        .request(app)
        .post('/api/auth/login')
        .send(TESTUSER)
        .then(res => {
          TOKEN = res.body.authToken;
        });
}

function createTestUser() {
  return User.hashPassword(TESTUSER.password)
    .then(hash => {
      const newUser = Object.assign({}, TESTUSER);
      newUser.password = hash;
      return User.create(newUser);
    })
    .then(created => {
      TESTUSER.userId = created._id;
    })
    .then(function() {
      return getValidToken();
    });
}

function seedLibraryData(userId) {
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push({
      userId,
      author: `${faker.name.firstName()} ${faker.name.lastName()}`,
      title: faker.lorem.sentence(),
      dateFinished: faker.date.past(10),
    });
  }
  // this will return a promise
  return Library.insertMany(seedData);
}

function clearLibrary() {
  return new Promise((resolve, reject) => {
    Library.deleteMany({})
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}


function removeTestUser() {
  return new Promise((resolve, reject) => {
    User.remove({_id: TESTUSER.userId})
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}


describe('Library api tests', function() {
  
  before(function() {
    return runServer(TEST_DATABASE_URL).then(() => createTestUser());
  });

  after( function() {
    return removeTestUser().then(() => closeServer());
  });

  beforeEach(function () {
    return seedLibraryData(TESTUSER.userId);
  });

  afterEach(function () {
    return clearLibrary();
  });

  it('Should reject requests without a valid token', function() {
    return chai.request(app)
      .get('/api/library')
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

  it('Should list content on GET', async function() {
    const res = await chai.request(app)
      .get('/api/library')
      .set('Authorization', `Bearer ${TOKEN}`)
    expect(res).to.have.status(200);
    expect(res).to.be.json;
    expect(res.body).to.be.a('array');
    expect(res.body.length).to.be.at.least(1);
    const expectedKeys = ['id', 'title', 'author', 'dateFinished'];
    res.body.forEach(function(item) {
      expect(item).to.be.a('object');
      expect(item).to.include.keys(expectedKeys);
    });
    const count = await Library.count();
    expect(res.body.length === count).to.be.true;
  });

  it('should add an item on POST', async function() {
    const newItem = {
      title: 'test',
      author: 'test',
      dateFinished: '2018-01-01',
      userId: TESTUSER.userId,
    };
    const originalCount = await Library.count();
    const res = await chai.request(app)
      .post('/api/library')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send(newItem)
    expect(res).to.have.status(201);
    const newCount = await Library.count();
    expect(newCount).to.equal(originalCount + 1);
  });

  it('should update items on PUT', async function() {
    const updateData = {
      title: 'test',
      author: 'test',
    };
    let res = await chai.request(app)
      .get('/api/library')
      .set('Authorization', `Bearer ${TOKEN}`)
    updateData.id = res.body[0].id;
    res = await chai.request(app)
      .put(`/api/library/${updateData.id}`)
      .set('Authorization', `Bearer ${TOKEN}`)
      .send(updateData);
    expect(res).to.have.status(204);
    let foundItem = await Library.findById(updateData.id);
    expect(foundItem.title).to.equal(updateData.title);
    expect(foundItem.author).to.equal(updateData.author);
  });

  it('should delete items on DELETE', async function() {
    let res = await chai.request(app)
      .get('/api/library')
      .set('Authorization', `Bearer ${TOKEN}`)
    res = await chai.request(app)
      .delete(`/api/library/${res.body[0].id}`)
      .set('Authorization', `Bearer ${TOKEN}`);
   expect(res).to.have.status(204);
  });
});
