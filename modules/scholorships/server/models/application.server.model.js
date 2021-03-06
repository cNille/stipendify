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
  'complete': {
    type: Boolean,
    default: false
  },
  'ladokfile': String,
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

mongoose.model('Application', ApplicationSchema);
