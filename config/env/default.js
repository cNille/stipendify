'use strict';


module.exports = {
  app: {
    title: 'Stipendify',
    description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
    keywords: 'mongodb, express, angularjs, node.js, mongoose, passport',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID'
  },
  port: process.env.PORT || 3000,
  templateEngine: 'swig',
  // Session Cookie settings
  sessionCookie: {
    // session expiration is set by default to 24 hours
    maxAge: 24 * (60 * 60 * 1000),
    // httpOnly flag makes sure the cookie is only accessed
    // through the HTTP protocol and not JS/browser
    httpOnly: true,
    // secure cookie should be turned to true to provide additional
    // layer of security so that the cookie is set only when working
    // in HTTPS mode.
    secure: false
  },
  // sessionSecret should be changed for security measures and concerns
  sessionSecret: process.env.SESSION_SECRET || 'stipendifyssecret',
  // sessionKey is set to the generic sessionId key used by PHP applications
  // for obsecurity reasons
  sessionKey: 'sessionId',
  sessionCollection: 'sessions',
  s3bucket: 'stipendify',
  logo: 'modules/core/client/img/brand/logo.png',
  favicon: 'modules/core/client/img/brand/favicon.ico',
  downloads: {
    profileFetch: {
      dest: './modules/users/client/img/profile/uploads/'
    },
    ladokFetch: {
      dest: './modules/users/client/img/profile/uploads/'
    }
  },
  uploads: {
    profileUpload: {
      dest: './modules/users/client/img/profile/uploads/', 
      limits: {
        fileSize: 1*1024*1024 // Max file size in bytes (1 MB)
      }
    },
    ladokUpload: {
      dest: './modules/users/client/img/profile/uploads/', 
      limits: {
        fileSize: 10*1024*1024 // Max file size in bytes (10 MB)
      }
    }
  }
};
