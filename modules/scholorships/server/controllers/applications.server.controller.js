'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Application = mongoose.model('Application'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  config = require(path.resolve('./config/config')),
  multer = require('multer');

/**
 * Create a Application
 */
exports.create = function(req, res) {
  var application = new Application(req.body);
  application.user = req.user;

  application.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(application);
    }
  });
};

/**
 * Show the current Application
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var application = req.application ? req.application.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  application.isCurrentUserOwner = req.user && application.user && application.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(application);
};

/**
 * Update a Application - unDEPRICATED, now allowed to update a created application
 */
exports.update = function(req, res) {
  /*
  return res.status(400).send({
    message: 'Not allowed to update application after creation'
  });
  */

  var application = req.application ;

  application = _.extend(application , req.body);

  application.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(application);
    }
  });
};

/**
 * Delete an Application
 */
exports.delete = function(req, res) {
  var application = req.application ;

  application.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(application);
    }
  });
};

/**
 * List of Applications
 */
exports.list = function(req, res) { 
  Application.find().sort('-created').populate('user', 'displayName').exec(function(err, applications) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(applications);
    }
  });
};

/**
 * Application middleware
 */
exports.applicationByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Application is invalid'
    });
  }

  Application.findById(id).populate('user', 'displayName').exec(function (err, application) {
    if (err) {
      return next(err);
    } else if (!application) {
      return res.status(404).send({
        message: 'No Application with that identifier has been found'
      });
    }
    req.application = application;
    next();
  });
};

/**
 * Get ladok attachment
 */
exports.getLadokAttachment = function (req, res) {
  var filename = req.params.filename;
  var url = config.downloads.ladokFetch.storage.url;
  res.redirect(url + filename);
};

  
/**
 * Update attachment-pdf
 */
exports.addLadokAttachment = function (req, res) {
  var application = req.application;
  var message = null;
  var upload = multer(config.uploads.ladokUpload).single('newLadokFile');
  var ladokFileFilter = require(path.resolve('./config/lib/multer')).ladokFileFilter;
  
  // Filtering to upload only pdf's
  upload.fileFilter = ladokFileFilter;

  if (application) {
    upload(req, res, function (uploadError) {
      if(uploadError) {
        return res.status(400).send({
          message: 'Error occurred while uploading ladok-file'
        });
      } else {
        application.complete = true;
        application.ladokfile = req.file.path.split("/").reverse()[0];

        application.save(function (saveError) {
          if (saveError) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(saveError)
            });
          } else {
            res.json(application);
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'Application not sent.'
    });
  }
};
