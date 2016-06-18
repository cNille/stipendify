(function () {
  'use strict';

  angular
    .module('scholorships')
    .controller('ApplicationsListController', ApplicationsListController);

  ApplicationsListController.$inject = ['ApplicationsService', 'SemesterService', '$scope'];

  function ApplicationsListController(ApplicationsService, SemesterService, $scope) {
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
        return "Username 2 should be `awesome`";
      }
    };

    $scope.saveApplication = function(data, id) {
      angular.extend(data, {id: id});
      return $http.post('/saveUser', data);
    };

    // remove user
    $scope.removeUser = function(index) {
      $scope.users.splice(index, 1);
    };

    // add user
    $scope.addUser = function() {
      $scope.inserted = {
        id: $scope.users.length+1,
        name: '',
        status: null,
        group: null 
      };
      $scope.users.push($scope.inserted);
    };





  }
})();
