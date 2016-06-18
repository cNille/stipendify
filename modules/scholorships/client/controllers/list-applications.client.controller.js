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

    $scope.checkName = function(data, id) {
      if (id === 2 && data !== 'awesome') {
        return 'Username 2 should be `awesome`';
      }
    };

    $scope.saveApplication = function(data, id) {
      angular.extend(data, { id: id });
      return $http.post('/saveUser', data);
    };

    // remove user
    $scope.removeApplication = function(index) {
      //$scope.applications.splice(index, 1);
    };
  }


})();
