(function () {
  'use strict';

  angular
    .module('scholorships')
    .controller('ScholorshipsListController', ScholorshipsListController);

  ScholorshipsListController.$inject = ['ScholorshipsService'];

  function ScholorshipsListController(ScholorshipsService) {
    var vm = this;

    vm.scholorships = ScholorshipsService.query();
  
    vm.scholorships = ScholorshipsService.query({ }, function(data) {
      // TODO: Find better solution than to filter here.
      vm.scholorships = data.filter(function(d){ return d.startDate >= Date(); });
    });
  }
})();
