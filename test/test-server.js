'use strict'
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;
const {TEST_DATABASE_URL} = require('../config');
const {app, runServer, closeServer} = require('../server');



describe('server.js test', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  it('Should return 200 GET /', function() {
    return chai.request(app)
      .get('/').then(res => {
        expect(res).to.have.status(200);
      })
  });


})
