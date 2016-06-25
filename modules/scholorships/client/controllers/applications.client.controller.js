(function () {
  'use strict';

  // Application controller
  angular
    .module('scholorships')
    .controller('ApplicationsController', ApplicationsController);

  ApplicationsController.$inject = ['$scope', '$state', 'Authentication', 'applicationResolve', '$stateParams', 'Users', 'SemesterService'];

  function ApplicationsController ($scope, $state, Authentication, application, $stateParams, Users, SemesterService) {
    var vm = this;

    vm.scholorshipId = $stateParams.scholorshipId;
    vm.authentication = Authentication;
    vm.application = application;

    $scope.isEditing = vm.scholorshipId === undefined && vm.application._id;
    vm.scholorshipName = $scope.isEditing ? vm.application.data.scholorshipName : $stateParams.scholorshipName;
    $scope.user = $scope.isEditing ? vm.application.data : vm.authentication.user;

    vm.semesterStudied = vm.application.semesterStudied; 
    vm.semesterNation = vm.application.semesterNation;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;


    // Save a user to db
    $scope.updateUserProfile = function () {
      $scope.success = $scope.error = null;

      // Remove attributes that arent needed in db
      $scope.user.assignments.forEach(function(v){ delete v.edit;});
      $scope.user.earlierScholorships.forEach(function(v){ delete v.edit; });
      $scope.user.interruption.forEach(function(v){ delete v.edit; });
      var myUser = new Users($scope.user);

      // When debugging
      console.log(myUser);
      myUser.$update(function (response) {
        // Update success, remove error-messages.
        $scope.$broadcast('show-errors-reset', 'applicationForm');
        $scope.success = true;

        // Update view-models.
        Authentication.user = response;
        $scope.user = response;

        $scope.updateApplication();

      }, function (response) {
        $scope.error = response.data.message;
      });
    };

    // Save application to db
    $scope.updateApplication = function() {
      // Add userdata to application
      vm.application.user = vm.authentication.user._id;
      vm.application.scholorship = vm.scholorshipId;
      vm.application.semesterStudied = vm.semesterStudied;
      vm.application.semesterNation = vm.semesterNation;

  
      $scope.user.universitypoints.semesters = $scope.user.universitypoints.semesters.filter(function (semester) {
        return semester.points !== 0;
      });
  
      // Remove attributes that arent needed in db
      $scope.user.assignments.forEach(function(v){ delete v.edit; });
      $scope.user.earlierScholorships.forEach(function(v){ delete v.edit; });
      $scope.user.interruption.forEach(function(v){ delete v.edit; });

      vm.application.data = {
        'displayName': $scope.user.displayName,
        'personNumber': $scope.user.personNumber,
        'telephone': $scope.user.telephone,
        'street': $scope.user.street,
        'zipCode': $scope.user.zipCode,
        'city': $scope.user.city,
        'highschool': $scope.user.highschool,
        'bank': $scope.user.bank,
        'bankaccount': $scope.user.bankaccount,
        'union': $scope.user.union,
        'scholorshipName': vm.scholorshipName,
        'universitypoints': $scope.user.universitypoints,
        'assignments': $scope.user.assignments,
        'earlierScholorships': $scope.user.earlierScholorships,
        'interruption': $scope.user.interruption,
      };

      // Save application
      vm.application.$save($scope.successCallback, $scope.errorCallback);
    };


    // Add assignment
    $scope.addAssignment = function (assignments){
      assignments.push({ 'assignmenttype' : '', 'name' : '', 'semester' : '', 'edit' : true });
    };
    // Add earlierScholorship
    $scope.addEarlierScholorship = function (earlierScholorships){
      earlierScholorships.push({ 'name' : '', 'semester' : '', 'money' : 0, 'edit' : true });
    };
    // Add Interruption
    $scope.addInterruption = function (interruptions){
      interruptions.push({ 'when' : '', 'why' : '', 'edit' : true });
    };

    // Save assignment
    $scope.saveAssignment = function (index, valid) {
      if(valid){ 
        $scope.user.assignments[index].edit = false;
        $scope.assignmenterror = '';
      } else {
        $scope.assignmenterror = 'Vänligen fyll i alla kolumner.';
      }
    };
    // Save earlierScholorship
    $scope.saveEarly = function (index, valid) {
      if(valid){ 
        $scope.user.earlierScholorships[index].edit = false;
        $scope.earlyScholorshiperror = '';
      } else {
        $scope.earlyScholorshiperror = 'Vänligen fyll i alla kolumner.';
      }
    };
    // Save interruption
    $scope.saveInterruption = function (index, valid) {
      if(valid){ 
        $scope.user.interruption[index].edit = false;
        $scope.interruptionerror = '';
      } else {
        $scope.interruptionerror = 'Vänligen fyll i alla kolumner.';
      }
    };
    // Delete assignment
    $scope.deleteAssignment = function($index){
      $scope.user.assignments.splice($index,1);
    };
    // Delete earlierScholorship
    $scope.deleteEarly = function($index){
      $scope.user.earlierScholorships.splice($index,1);
    };
    // Delete interruption
    $scope.deleteInterruption = function($index){
      $scope.user.interruption.splice($index,1);
    };

    // Add semester
    $scope.addSemester = function (semesters){
      SemesterService.addSemester(semesters, false);
    };
    // Fill semesters array
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
        vm.error = 'Du skall fylla i alla fält.';
        $scope.$broadcast('show-errors-check-validity', 'applicationForm');
        return false;
      }

      $scope.updateModels();

      if ($scope.isEditing) {
        $scope.updateApplication();
      } else {
        $scope.updateUserProfile();
      }

      $scope.successCallback = function (res) {
        if($scope.isEditing){
          $state.go('applications.scholorlist', {
            scholorshipId: res.scholorship
          });
        } else {
          $state.go('applications.attachments', {
            applicationId: res._id
          });
        }
        event.preventDefault();
        return;
      };

      $scope.errorCallback = function (res) {
        vm.error = res.data.message;
      };
    }


    // Create question Array
    $scope.personQuestions = [ 
      { name : 'personnummer', 
        question : 'Personnr', 
        placeholder : 'XXXXXXX-XXXX', 
        variable : $scope.user.personNumber 
      }, { name : 'telephone', 
        question : 'Telefon', 
        placeholder : '07XX-XX XX XX', 
        variable : $scope.user.telephone 
      }, { name : 'street', 
        question : 'Gatuadress', 
        variable : $scope.user.street 
      }, { name : 'zipcode', 
        question : 'Post nummer', 
        variable : $scope.user.zipCode 
      }, { name : 'city', 
        question : 'city', 
        variable : $scope.user.city 
      }, { name : 'highshool', 
        question : 'Gymnasium och ort', 
        variable : $scope.user.highschool 
      }, { name : 'bank', 
        question : 'Bank', 
        variable : $scope.user.bank 
      }, { name : 'bankaccount', 
        question : 'Bankkonto', 
        variable : $scope.user.bankaccount 
      }, { name : 'union', 
        question : 'Kår', 
        variable : $scope.user.union 
      },
    ];
  
    $scope.updateModels = function() {
      $scope.user.personNumber = $scope.personQuestions[0].variable;
      $scope.user.telephone = $scope.personQuestions[1].variable;
      $scope.user.street = $scope.personQuestions[2].variable;
      $scope.user.zipCode = $scope.personQuestions[3].variable;
      $scope.user.city = $scope.personQuestions[4].variable;
      $scope.user.highschool = $scope.personQuestions[5].variable;
      $scope.user.bank = $scope.personQuestions[6].variable;
      $scope.user.bankaccount = $scope.personQuestions[7].variable;
      $scope.user.union = $scope.personQuestions[8].variable;
    };

  }
})();
