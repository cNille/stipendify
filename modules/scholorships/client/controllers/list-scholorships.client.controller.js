(function () {
  'use strict';

  angular
    .module('scholorships')
    .controller('ScholorshipsListController', ScholorshipsListController);

  ScholorshipsListController.$inject = ['ScholorshipsService'];

  function ScholorshipsListController(ScholorshipsService) {
    var vm = this;

    vm.scholorships = ScholorshipsService.query({}, function (data){
      if(data){
        vm.activeScholorships = data.filter(function(d){
          var now = Date();
          return d.startDate <= now && d.endDate >= now;
        });
        vm.oldScholorships = data.filter(function(d){
          var now = Date();
          return d.startDate >= now && d.endDate > now;
        });
        vm.upcomingScholorships = data.filter(function(d){
          var now = Date();
          return d.startDate < now;
        });
      }
    });
  }
})();
