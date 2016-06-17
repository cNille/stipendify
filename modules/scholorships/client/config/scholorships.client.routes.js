(function () {
  'use strict';

  angular
    .module('scholorships')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('scholorships', {
        abstract: true,
        url: '/scholorships',
        template: '<ui-view/>'
      })
      .state('scholorships.list', {
        url: '',
        templateUrl: 'modules/scholorships/client/views/list-scholorships.client.view.html',
        controller: 'ScholorshipsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Scholorships List'
        }
      })
      .state('scholorships.create', {
        url: '/create',
        templateUrl: 'modules/scholorships/client/views/form-scholorship.client.view.html',
        controller: 'ScholorshipsController',
        controllerAs: 'vm',
        resolve: {
          scholorshipResolve: newScholorship
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle : 'Scholorships Create'
        }
      })
      .state('scholorships.edit', {
        url: '/:scholorshipId/edit',
        templateUrl: 'modules/scholorships/client/views/form-scholorship.client.view.html',
        controller: 'ScholorshipsController',
        controllerAs: 'vm',
        resolve: {
          scholorshipResolve: getScholorship
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Scholorship {{ scholorshipResolve.name }}'
        }
      })
      .state('scholorships.view', {
        url: '/:scholorshipId',
        templateUrl: 'modules/scholorships/client/views/view-scholorship.client.view.html',
        controller: 'ScholorshipsController',
        controllerAs: 'vm',
        resolve: {
          scholorshipResolve: getScholorship
        },
        data:{
          pageTitle: 'Scholorship {{ articleResolve.name }}'
        }
      });
  }

  getScholorship.$inject = ['$stateParams', 'ScholorshipsService'];

  function getScholorship($stateParams, ScholorshipsService) {
    return ScholorshipsService.get({
      scholorshipId: $stateParams.scholorshipId
    }).$promise;
  }

  newScholorship.$inject = ['ScholorshipsService'];

  function newScholorship(ScholorshipsService) {
    return new ScholorshipsService();
  }
})();
