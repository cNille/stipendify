(function () {
  'use strict';

  // Application controller
  angular
    .module('scholorships')
    .controller('ApplicationsController', ApplicationsController);

  ApplicationsController.$inject = ['$scope', '$state', 'Authentication', 'applicationResolve', '$stateParams', 'Users'];

  function ApplicationsController ($scope, $state, Authentication, application, $stateParams, Users) {
    var vm = this;

    vm.authentication = Authentication;
    vm.application = application;
    $scope.user = vm.authentication.user;
    vm.scholorshipName = $stateParams.scholorshipName;
    vm.scholorshipId = $stateParams.scholorshipId;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Add semester in form.
    $scope.addSemester = function(semesters, addToFront){
      var arrLength = semesters.length;
      var newSemester = '';
      if(arrLength === 0){
        newSemester = getThisSemesterName();
      } else {
        var lastSemester = semesters[arrLength-1].name;
        var year = parseInt(lastSemester.substring(2));  
        var name = lastSemester.substring(0,2);  
        if(addToFront){
          newSemester = name === 'VT' ? 'HT' + year.toString() : 'VT' + (year + 1).toString();
        } else {
          newSemester = name === 'VT' ? 'HT' + (year - 1).toString() : 'VT' + year.toString();
        }
      } 
      var obj = { 'name': newSemester, 'points': 0 };
      if(addToFront){
        semesters.unshift(obj);
      } else {
        semesters.push(obj);
      }
    };
    function getThisSemesterName(){
      var today = new Date();
      var month = today.getMonth()+1; //January is 0!
      var year = today.getFullYear();
      var thisSemester = (month < 7 ? 'VT' : 'HT') + (year - 2000).toString();
      return thisSemester;
    }
    
    function fillSemesterArray(semesters){
      var thisSemester = getThisSemesterName();
      while (semesters.length < 4){
        $scope.addSemester(semesters, false);
      }
      while (semesters[0].name !== thisSemester){
        $scope.addSemester(semesters, true);
      }
    }
    //fillSemesterArray($scope.user.universitypoints.semesters);

    // Check that there is user- and scholorship ids.
    var shouldSeeList = vm.scholorshipId === undefined && vm.authentication.user._id === undefined ;
    
    // should NOT be able to send application forms.
    if(shouldSeeList) {
      $state.go('scholorships.list');
      event.preventDefault();
      return;
    }
      
    // Update a user profile
    $scope.updateUserProfile = function () {
      $scope.success = $scope.error = null;

      var user = new Users($scope.user);
      user.$update(function (response) {
        // Update success, remove error-messages.
        $scope.$broadcast('show-errors-reset', 'applicationForm');
        $scope.success = true;

        // Update view-models.
        Authentication.user = response;
        $scope.user = response;

        // Add userdata to application
        vm.application.user = vm.authentication.user._id;
        vm.application.scholorship = vm.scholorshipId;
        vm.application.data = {
          'name': $scope.user.displayName,
          'personNumber': $scope.user.personNumber,
          'telephone': $scope.user.telephone,
          'streetaddress': $scope.user.streetaddress,
          'zipCode': $scope.user.zipCode,
          'city': $scope.user.city,
          'highschool': $scope.user.highschool,
          'bank': $scope.user.bank,
          'bankaccont': $scope.user.bankaccount,
          'union': $scope.user.union,
          'scholorshipName': $scope.scholorshipName
        };
        

        // Create application
        vm.application.$save($scope.successCallback, $scope.errorCallback);
      }, function (response) {
        $scope.error = response.data.message;
      });
    };

    // Remove existing Application
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.application.$remove($state.go('scholorships.list'));
      }
    }

    // Save Application
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.applicationForm');
        return false;
      }

      // Applications arent allowed to update.
      if (!vm.application._id) {
        // Update user. When success, create application.
        $scope.updateUserProfile();
      }

      $scope.successCallback = function (res) {
        $state.go('applications.submitted', {
          applicationId: res._id
        });
        event.preventDefault();
        return;
      };

      $scope.errorCallback = function (res) {
        vm.error = res.data.message;
      };
    }
  }
})();
