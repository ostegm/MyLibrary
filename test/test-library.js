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

 it('Should list content on GET', function() {
    let res;
    return chai.request(app)
      .get('/api/library')
      .set('Authorization', `Bearer ${TOKEN}`)
      .then(function(_res) {
        res = _res; //for future then blocks.
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.be.at.least(1);
        const expectedKeys = ['id', 'title', 'author', 'dateFinished'];
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.include.keys(expectedKeys);
        })
      return Library.count();
      }).then(function(count) {
        expect(res.body.length === count).to.be.true;
      });
  });

  // it('Should find by ID on GET', function() {
  //   let res, id;
  //   return chai.request(app)
  //     .get('/blog-posts')
  //     .then(function(_res) {
  //       id = _res.body[0].id
  //       return chai.request(app)
  //         .get(`/blog-posts/${id}`)
  //         .then(function(_res) {
  //           res = _res
  //           expect(res).to.have.status(200)
  //           expect(res).to.be.json;
  //           expect(res.body).to.be.a('object');
  //           return BlogPosts.findById(id)
  //         }).then( function (expectedPost) {
  //           const keysToCheck = ['id', 'title', 'content']
  //           keysToCheck.map(function(key) {
  //             expect(res.body[key]).to.equal(expectedPost[key]);
  //           })
  //         });
  //     });
  // });

  // it('should add an item on POST', function() {
  //   const newItem = {
  //     content: 'test',
  //     title: 'test',
  //     author: 'test',
  //   };
  //   const originalLength = BlogPosts.count();
  //   return chai.request(app)
  //     .post('/blog-posts')
  //     .send(newItem)
  //     .then(function(res) {
  //       expect(res).to.have.status(201);
  //       expect(res.body.content).to.equal(newItem.content);
  //     return (BlogPosts.findById(res.body.id));
  //     }).then(function(foundItem) {
  //         expect(foundItem.content).to.equal(newItem.content);
  //     });;
  // });

  // it('should update items on PUT', function() {
  //   const updateData = {
  //     content: 'test',
  //     title: 'test',
  //     author: 'test',
  //   };
  //   return chai.request(app)
  //     // first have to get so we have an idea of object to update
  //     .get('/blog-posts')
  //     .then(function(res) {
  //       updateData.id = res.body[0].id;
  //       return chai.request(app)
  //         .put(`/blog-posts/${updateData.id}`)
  //         .send(updateData);
  //     })
  //     .then(function(res) {
  //       expect(res).to.have.status(204);
  //       return BlogPosts.findById(updateData.id);
  //     }).then(function(foundItem) {
  //       expect(foundItem.title).to.equal(updateData.title);
  //     });
  // });

  // it('should delete items on DELETE', function() {
  //   return chai.request(app)
  //     // first have to get so we have an `id` of item
  //     // to delete
  //     .get('/blog-posts')
  //     .then(function(res) {
  //       return chai.request(app)
  //         .delete(`/blog-posts/${res.body[0].id}`);
  //     })
  //     .then(function(res) {
  //       expect(res).to.have.status(204);
  //     });
  // });
});