(function () {
  'use strict';

  angular
    .module('scholorships')
    .controller('ApplicationsListController', ApplicationsListController);

  ApplicationsListController.$inject = ['ApplicationsService', 'SemesterService', '$scope', '$http'];

  function ApplicationsListController(ApplicationsService, SemesterService, $scope, $http) {
    var vm = this;

    vm.semesters = SemesterService.getLastFourSemesters({});
    $scope.applications = ApplicationsService.query(function (data){
      $scope.applications = data;
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
