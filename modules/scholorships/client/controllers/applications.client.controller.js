(function () {
  'use strict';

  // Application controller
  angular
    .module('scholorships')
    .controller('ApplicationsController', ApplicationsController);

  ApplicationsController.$inject = ['$scope', '$state', 'Authentication', 'applicationResolve', '$stateParams', 'Users', 'SemesterService'];

  function ApplicationsController ($scope, $state, Authentication, application, $stateParams, Users, SemesterService) {
    var vm = this;

    vm.scholorshipName = $stateParams.scholorshipName;
    vm.scholorshipId = $stateParams.scholorshipId;
    vm.authentication = Authentication;
    vm.application = application;

    $scope.isEditing = vm.scholorshipId === undefined && vm.application._id;
    $scope.user = $scope.isEditing ? vm.application.data : vm.authentication.user;

    vm.semesterStudied = vm.application.semesterStudied; 
    vm.semesterNation = vm.application.semesterNation;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Update a user profile
    $scope.updateUserProfile = function () {
      $scope.success = $scope.error = null;

      var myUser = new Users($scope.user);
      myUser.$update(function (response) {
        // Update success, remove error-messages.
        $scope.$broadcast('show-errors-reset', 'applicationForm');
        $scope.success = true;

        // Update view-models.
        Authentication.user = response;
        $scope.user = response;

        // Add userdata to application
        vm.application.user = vm.authentication.user._id;
        vm.application.scholorship = vm.scholorshipId;
        vm.application.semesterStudied = vm.semesterStudied;
        vm.application.semesterNation = vm.semesterNation;
        vm.application.data = {
          'name': $scope.user.displayName,
          'personNumber': $scope.user.personNumber,
          'telephone': $scope.user.telephone,
          'streetaddress': $scope.user.streetaddress,
          'zipCode': $scope.user.zipCode,
          'city': $scope.user.city,
          'highschool': $scope.user.highschool,
          'bank': $scope.user.bank,
          'bankaccount': $scope.user.bankaccount,
          'union': $scope.user.union,
          'scholorshipName': vm.scholorshipName,
          'universitypoints': $scope.user.universitypoints,
        };


        // Create application
        vm.application.$save($scope.successCallback, $scope.errorCallback);
      }, function (response) {
        $scope.error = response.data.message;
      });
    };

    function fillSemesterArray(semesters){
      var thisSemester = SemesterService.getThisSemesterName();
      while (semesters.length > 0 && semesters[0].name !== thisSemester){
        SemesterService.addSemester(semesters, true);
      }
      SemesterService.getLastFourSemesters(semesters);
    }
    fillSemesterArray($scope.user.universitypoints.semesters);

    // Check that there is user- and scholorship ids.
    var shouldSeeList = vm.scholorshipId === undefined && vm.application._id === undefined ;
    
    // should NOT be able to send application forms.
    if(shouldSeeList) {
      $state.go('scholorships.list');
      event.preventDefault();
      return;
    }

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
      }
      $scope.updateUserProfile();

      $scope.successCallback = function (res) {
        var nextState = $scope.isEditing ? 'applications.list' : 'applications.submitted';
        $state.go(nextState, {
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
