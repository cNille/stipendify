'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

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
  data: {
    'allowance': { type: Number, default: 0 },
    'name': String,
    'personNumber': String,
    'telephone': String,
    'streetaddress': String,
    'zipCode': String,
    'city': String,
    'highschool': String,
    'bank': String,
    'bankaccont': String,
    'union': String,
    'semesterStudied': String,
    'semesterNation': String,
    'scholorshipName': String
  },
  created: {
    type: Date,
    default: Date.now
  }
});



mongoose.model('Application', ApplicationSchema);
