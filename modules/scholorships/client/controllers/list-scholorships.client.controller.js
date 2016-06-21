(function () {
  'use strict';

  angular
    .module('scholorships')
    .controller('ScholorshipsListController', ScholorshipsListController);

  ScholorshipsListController.$inject = ['ScholorshipsService', 'dateFilter', '$scope'];

  function ScholorshipsListController(ScholorshipsService, dateFilter, $scope) {
    var vm = this;

    $scope.dateFilter = function (d) {
      return dateFilter(d, 'yyyy-MM-dd');
    };

    // To enable using ng-model date to model.  
    //$scope.startString = dateFilter(vm.scholorship.startDate, 'yyyy-MM-dd');
    //$scope.endString = dateFilter(vm.scholorship.endDate, 'yyyy-MM-dd');
    
    vm.lists = ScholorshipsService.query({}, function (data){
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
        vm.lists = [ {
          list: vm.activeScholorships,
          title: 'Aktiva stipendier',
          }, {
            list: vm.oldScholorships,
            title: 'Gamla stipendier',
          }, {
          list: vm.upcomingScholorships,
          title: 'Kommande stipendier',
        } ];
      }
    });
  }
})();
