(function () {
  'use strict';

  angular
    .module('scholorships')
    .controller('ApplicationsListController', ApplicationsListController);

  ApplicationsListController.$inject = ['ApplicationsService'];

  function ApplicationsListController(ApplicationsService) {
    var vm = this;

    vm.applications = ApplicationsService.query();
  }
})();
