//Scholorships service used to communicate Scholorships REST endpoints
(function () {
  'use strict';

  angular
    .module('scholorships')
    .factory('ScholorshipsService', ScholorshipsService);

  ScholorshipsService.$inject = ['$resource'];

  function ScholorshipsService($resource) {
    return $resource('api/scholorships/:scholorshipId', {
      scholorshipId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
