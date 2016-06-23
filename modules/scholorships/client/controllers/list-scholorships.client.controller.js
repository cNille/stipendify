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
          var now = $scope.dateFilter(new Date());
          var start = $scope.dateFilter(d.startDate);
          var end = $scope.dateFilter(d.endDate);
          return start <= now && end >= now;
        });
        vm.oldScholorships = data.filter(function(d){
          var now = $scope.dateFilter(new Date());
          var start = $scope.dateFilter(d.startDate);
          var end = $scope.dateFilter(d.endDate);
          return start <= now && end < now;
        });
        vm.upcomingScholorships = data.filter(function(d){
          var now = $scope.dateFilter(new Date());
          var start = $scope.dateFilter(d.startDate);
          var end = $scope.dateFilter(d.endDate);
          return start > now;
        });
        vm.lists = [ { list: vm.activeScholorships, title: 'Aktiva stipendier' }, 
          { list: vm.upcomingScholorships, title: 'Kommande stipendier' },
          { list: vm.oldScholorships, title: 'Gamla stipendier' }, 
        ];
      }
    });
  }
})();
