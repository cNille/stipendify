'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Scholorship = mongoose.model('Scholorship'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, scholorship;

/**
 * Scholorship routes tests
 */
describe('Scholorship CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Scholorship
    user.save(function () {
      scholorship = {
        name: 'Scholorship name'
      };

      done();
    });
  });

  it('should be able to save a Scholorship if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Scholorship
        agent.post('/api/scholorships')
          .send(scholorship)
          .expect(200)
          .end(function (scholorshipSaveErr, scholorshipSaveRes) {
            // Handle Scholorship save error
            if (scholorshipSaveErr) {
              return done(scholorshipSaveErr);
            }

            // Get a list of Scholorships
            agent.get('/api/scholorships')
              .end(function (scholorshipsGetErr, scholorshipsGetRes) {
                // Handle Scholorship save error
                if (scholorshipsGetErr) {
                  return done(scholorshipsGetErr);
                }

                // Get Scholorships list
                var scholorships = scholorshipsGetRes.body;

                // Set assertions
                (scholorships[0].user._id).should.equal(userId);
                (scholorships[0].name).should.match('Scholorship name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Scholorship if not logged in', function (done) {
    agent.post('/api/scholorships')
      .send(scholorship)
      .expect(403)
      .end(function (scholorshipSaveErr, scholorshipSaveRes) {
        // Call the assertion callback
        done(scholorshipSaveErr);
      });
  });

  it('should not be able to save an Scholorship if no name is provided', function (done) {
    // Invalidate name field
    scholorship.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Scholorship
        agent.post('/api/scholorships')
          .send(scholorship)
          .expect(400)
          .end(function (scholorshipSaveErr, scholorshipSaveRes) {
            // Set message assertion
            (scholorshipSaveRes.body.message).should.match('Please fill Scholorship name');

            // Handle Scholorship save error
            done(scholorshipSaveErr);
          });
      });
  });

  it('should be able to update an Scholorship if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Scholorship
        agent.post('/api/scholorships')
          .send(scholorship)
          .expect(200)
          .end(function (scholorshipSaveErr, scholorshipSaveRes) {
            // Handle Scholorship save error
            if (scholorshipSaveErr) {
              return done(scholorshipSaveErr);
            }

            // Update Scholorship name
            scholorship.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Scholorship
            agent.put('/api/scholorships/' + scholorshipSaveRes.body._id)
              .send(scholorship)
              .expect(200)
              .end(function (scholorshipUpdateErr, scholorshipUpdateRes) {
                // Handle Scholorship update error
                if (scholorshipUpdateErr) {
                  return done(scholorshipUpdateErr);
                }

                // Set assertions
                (scholorshipUpdateRes.body._id).should.equal(scholorshipSaveRes.body._id);
                (scholorshipUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Scholorships if not signed in', function (done) {
    // Create new Scholorship model instance
    var scholorshipObj = new Scholorship(scholorship);

    // Save the scholorship
    scholorshipObj.save(function () {
      // Request Scholorships
      request(app).get('/api/scholorships')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Scholorship if not signed in', function (done) {
    // Create new Scholorship model instance
    var scholorshipObj = new Scholorship(scholorship);

    // Save the Scholorship
    scholorshipObj.save(function () {
      request(app).get('/api/scholorships/' + scholorshipObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', scholorship.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Scholorship with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/scholorships/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Scholorship is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Scholorship which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Scholorship
    request(app).get('/api/scholorships/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Scholorship with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Scholorship if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Scholorship
        agent.post('/api/scholorships')
          .send(scholorship)
          .expect(200)
          .end(function (scholorshipSaveErr, scholorshipSaveRes) {
            // Handle Scholorship save error
            if (scholorshipSaveErr) {
              return done(scholorshipSaveErr);
            }

            // Delete an existing Scholorship
            agent.delete('/api/scholorships/' + scholorshipSaveRes.body._id)
              .send(scholorship)
              .expect(200)
              .end(function (scholorshipDeleteErr, scholorshipDeleteRes) {
                // Handle scholorship error error
                if (scholorshipDeleteErr) {
                  return done(scholorshipDeleteErr);
                }

                // Set assertions
                (scholorshipDeleteRes.body._id).should.equal(scholorshipSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Scholorship if not signed in', function (done) {
    // Set Scholorship user
    scholorship.user = user;

    // Create new Scholorship model instance
    var scholorshipObj = new Scholorship(scholorship);

    // Save the Scholorship
    scholorshipObj.save(function () {
      // Try deleting Scholorship
      request(app).delete('/api/scholorships/' + scholorshipObj._id)
        .expect(403)
        .end(function (scholorshipDeleteErr, scholorshipDeleteRes) {
          // Set message assertion
          (scholorshipDeleteRes.body.message).should.match('User is not authorized');

          // Handle Scholorship error error
          done(scholorshipDeleteErr);
        });

    });
  });

  it('should be able to get a single Scholorship that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Scholorship
          agent.post('/api/scholorships')
            .send(scholorship)
            .expect(200)
            .end(function (scholorshipSaveErr, scholorshipSaveRes) {
              // Handle Scholorship save error
              if (scholorshipSaveErr) {
                return done(scholorshipSaveErr);
              }

              // Set assertions on new Scholorship
              (scholorshipSaveRes.body.name).should.equal(scholorship.name);
              should.exist(scholorshipSaveRes.body.user);
              should.equal(scholorshipSaveRes.body.user._id, orphanId);

              // force the Scholorship to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Scholorship
                    agent.get('/api/scholorships/' + scholorshipSaveRes.body._id)
                      .expect(200)
                      .end(function (scholorshipInfoErr, scholorshipInfoRes) {
                        // Handle Scholorship error
                        if (scholorshipInfoErr) {
                          return done(scholorshipInfoErr);
                        }

                        // Set assertions
                        (scholorshipInfoRes.body._id).should.equal(scholorshipSaveRes.body._id);
                        (scholorshipInfoRes.body.name).should.equal(scholorship.name);
                        should.equal(scholorshipInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Scholorship.remove().exec(done);
    });
  });
});
