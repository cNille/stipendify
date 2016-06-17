'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Scholorship = mongoose.model('Scholorship'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Scholorship
 */
exports.create = function(req, res) {
  var scholorship = new Scholorship(req.body);
  scholorship.user = req.user;

  scholorship.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(scholorship);
    }
  });
};

/**
 * Show the current Scholorship
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var scholorship = req.scholorship ? req.scholorship.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  scholorship.isCurrentUserOwner = req.user && scholorship.user && scholorship.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(scholorship);
};

/**
 * Update a Scholorship
 */
exports.update = function(req, res) {
  var scholorship = req.scholorship ;

  scholorship = _.extend(scholorship , req.body);

  scholorship.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(scholorship);
    }
  });
};

/**
 * Delete an Scholorship
 */
exports.delete = function(req, res) {
  var scholorship = req.scholorship ;

  scholorship.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(scholorship);
    }
  });
};

/**
 * List of Scholorships
 */
exports.list = function(req, res) { 
  Scholorship.find().sort('-created').populate('user', 'displayName').exec(function(err, scholorships) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(scholorships);
    }
  });
};

/**
 * Scholorship middleware
 */
exports.scholorshipByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Scholorship is invalid'
    });
  }

  Scholorship.findById(id).populate('user', 'displayName').exec(function (err, scholorship) {
    if (err) {
      return next(err);
    } else if (!scholorship) {
      return res.status(404).send({
        message: 'No Scholorship with that identifier has been found'
      });
    }
    req.scholorship = scholorship;
    next();
  });
};
