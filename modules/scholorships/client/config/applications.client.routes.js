(function () {
  'use strict';

  angular
    .module('scholorships')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('applications', {
        abstract: true,
        url: '/applications',
        template: '<ui-view/>'
      })
      .state('applications.submitted', {
        url: '/tack',
        templateUrl: 'modules/scholorships/client/views/submitted-application.client.view.html'
      })
      .state('applications.list', {
        url: '',
        templateUrl: 'modules/scholorships/client/views/list-applications.client.view.html',
        controller: 'ApplicationsListController',
        controllerAs: 'vm',
        data: {
          roles: ['stipendiumansvarig', 'admin'],
          pageTitle: 'Applications List'
        }
      })
      .state('applications.create', {
        url: '/create/:scholorshipId/:scholorshipName',
        templateUrl: 'modules/scholorships/client/views/form-application.client.view.html',
        controller: 'ApplicationsController',
        controllerAs: 'vm',
        params: {
          scholorshipId: String,
          scholorshipName: String,
        },
        resolve: {
          applicationResolve: newApplication,
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle : 'Ansök om stipendium'
        }
      })
      .state('applications.edit', {
        url: '/:applicationId/edit',
        templateUrl: 'modules/scholorships/client/views/form-application.client.view.html',
        controller: 'ApplicationsController',
        controllerAs: 'vm',
        resolve: {
          applicationResolve: getApplication
        },
        data: {
          roles: ['stipendiumansvarig', 'admin'],
          pageTitle: 'Edit Application {{ applicationResolve.name }}'
        }
      })
      .state('applications.view', {
        url: '/:applicationId',
        templateUrl: 'modules/scholorships/client/views/view-application.client.view.html',
        controller: 'ApplicationsController',
        controllerAs: 'vm',
        resolve: {
          applicationResolve: getApplication
        },
        data:{
          roles: ['stipendiumansvarig', 'admin'],
          pageTitle: 'Application {{ articleResolve.name }}'
        }
      });
  }

  getApplication.$inject = ['$stateParams', 'ApplicationsService'];

  function getApplication($stateParams, ApplicationsService) {
    return ApplicationsService.get({
      applicationId: $stateParams.applicationId
    }).$promise;
  }

  newApplication.$inject = ['ApplicationsService'];

  function newApplication(ApplicationsService) {
    return new ApplicationsService();
  }
})();
