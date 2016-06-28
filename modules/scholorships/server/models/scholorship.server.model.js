'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Scholorship Schema
 */
var ScholorshipSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Scholorship name',
    trim: true
  },
  funds: [{name: String, size: Number, description: String}],
  description: String,
  startDate: Date,
  endDate: Date,
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Scholorship', ScholorshipSchema);
