// Applications service used to communicate Applications REST endpoints.
(function(){
  'use strict';

  angular
    .module('scholorships')
    .factory('ApplicationsService', ApplicationsService);
  ApplicationsService.$inject = ['$resource'];

  function ApplicationsService($resource) {
    return $resource('api/applications/:applicationId', {
      applicationId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  } 
})();
