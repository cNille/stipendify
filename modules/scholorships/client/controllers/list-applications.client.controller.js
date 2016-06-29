(function () {
  'use strict';

  angular
    .module('scholorships')
    .controller('ApplicationsListController', ApplicationsListController);

  ApplicationsListController.$inject = ['ApplicationsService', 'SemesterService', '$scope', '$http', '$stateParams', 'dateFilter'];

  function ApplicationsListController(ApplicationsService, SemesterService, $scope, $http, $stateParams, dateFilter) {
    var vm = this;

    $scope.dateFilter = dateFilter;
    $scope.title = 'Laddar...';

    vm.scholorshipId = $stateParams.scholorshipId;
    vm.semesters = SemesterService.getLastFourSemesters([]);
    $scope.applications = ApplicationsService.query({ scholorship : vm.scholorshipId }, function(data) {
      // TODO: Find better solution than to filter here.
      $scope.applications = data.filter(function(d){ return d.scholorship === vm.scholorshipId && d.complete; });
      $scope.scholorshipName = $scope.applications[0].data.scholorshipName;
      $scope.totalFunds = data.reduce(function(prev, curr){ return { data: { allowance : prev.data.allowance + curr.data.allowance } }; }).data.allowance;
      if($scope.applications.length > 0){
        $scope.title = 'Stipendiumansökningar för ' + $scope.scholorshipName;
      } else {
        $scope.title = 'Inga ansökningar har inkommit än...';
      }
    });

    $scope.propertyName = 'age';
    $scope.reverse = true;
    $scope.sortBy = function(propertyName) {
      $scope.reverse = (propertyName !== null && $scope.propertyName === propertyName) ? !$scope.reverse : false;
      $scope.propertyName = propertyName;
      //$scope.applications = orderBy(friends, $scope.propertyName, $scope.reverse);
    };

    // Remove Application
    $scope.removeApplication = function(index) {
      if(confirm('Är du säker på att du vill radera ansökningen?')){
        // Send delete request to server.
        ApplicationsService.delete({ applicationId: $scope.applications[index]._id }, function(err){
          // Remove deleted application from $scope
          $scope.applications.splice(index, 1);
        });
      }
    };
  }


})();
