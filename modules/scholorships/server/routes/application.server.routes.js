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
    .post(applications.update)
    .delete(applications.delete);

  app.route('/api/applications/ladok/:applicationId').all(applicationsPolicy.isAllowed)
    .post(applications.addLadokAttachment);

  // Finish by binding the Application middleware
  app.param('applicationId', applications.applicationByID);
};
