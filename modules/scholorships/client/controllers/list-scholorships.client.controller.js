(function () {
  'use strict';

  angular
    .module('scholorships')
    .controller('ScholorshipsListController', ScholorshipsListController);

  ScholorshipsListController.$inject = ['ScholorshipsService'];

  function ScholorshipsListController(ScholorshipsService) {
    var vm = this;

    vm.scholorships = ScholorshipsService.query();
  }
})();
