'use strict';

/**
 * Module dependencies
 */
var scholorshipsPolicy = require('../policies/scholorships.server.policy'),
  scholorships = require('../controllers/scholorships.server.controller');

module.exports = function(app) {
  // Scholorships Routes
  app.route('/api/scholorships').all(scholorshipsPolicy.isAllowed)
    .get(scholorships.list)
    .post(scholorships.create);

  app.route('/api/scholorships/:scholorshipId').all(scholorshipsPolicy.isAllowed)
    .get(scholorships.read)
    .put(scholorships.update)
    .delete(scholorships.delete);

  // Finish by binding the Scholorship middleware
  app.param('scholorshipId', scholorships.scholorshipByID);
};
