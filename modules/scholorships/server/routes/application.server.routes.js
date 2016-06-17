'use strict';

/**
 * Module dependencies
 */
var applicationsPolicy = require('../policies/applications.server.policy'),
  applications = require('../controllers/applications.server.controller');

module.exports = function(app) {
  // Applications Routes
  app.route('/api/applications').all(applicationsPolicy.isAllowed)
    .get(applications.list)
    .post(applications.create);

  app.route('/api/applications/:applicationId').all(applicationsPolicy.isAllowed)
    .get(applications.read)
    .put(applications.update)
    .delete(applications.delete);

  // Finish by binding the Application middleware
  app.param('applicationId', applications.applicationByID);
};
