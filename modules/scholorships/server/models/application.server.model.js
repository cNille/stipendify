'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var filePluginLib = require('mongoose-file');
var filePlugin = filePluginLib.filePlugin;
var make_upload_to_model = filePluginLib.make_upload_to_model;

var path = require('path');
var uploads_base = path.join(__dirname, 'public/uploads');
var uploads = path.join(uploads_base, 'u');

/**
 * Application Schema
 */
var ApplicationSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  scholorship: {
    type: Schema.ObjectId,
    ref: 'Scholorship'
  },
  'complete': {
    type: Boolean,
    default: false
  },
  'semesterStudied': String,
  'semesterNation': String,
  data: {
    'allowance': { type: Number, default: 0 },
    'displayName': String,
    'personNumber': String,
    'telephone': String,
    'streetaddress': String,
    'zipCode': String,
    'city': String,
    'highschool': String,
    'bank': String,
    'bankaccount': String,
    'union': String,
    'scholorshipName': String,
    'universitypoints': { 'total' : Number, 'semesters' : [ { 'name': String, 'points' : Number } ] },
    'assignments': [ { 'name' : String, 'semester' : String } ],
    'earlierScholorships': [ { 'name' : String, 'semester' : String, 'money' : Number } ],
    'interruption': [ { 'when' : String, 'why' : String } ]
  },
  created: {
    type: Date,
    default: Date.now
  }
});


ApplicationSchema.plugin(filePlugin, {
  name: 'ladok',
  upload_to: make_upload_to_model(uploads, 'photos'),
  relative_to: uploads_base
});


mongoose.model('Application', ApplicationSchema);
