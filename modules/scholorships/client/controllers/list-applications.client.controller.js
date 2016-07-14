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
      $scope.dataList = $scope.convertToExcelFormat($scope.applications);
    });

    $scope.dataList = [];
    $scope.datafields = {
      'data.displayName' : 'Namn',
      'semesterStudied' : 'Termin Studerat',
      'semesterNation' : 'Termin Nation',
      'data.personNumber' : 'Personnr',
      'data.telephone' : 'Telefon',
      'data.streetaddress' : 'Adress',
      'data.zipCode' : 'Postnr',
      'data.city' : 'Stad',
      'data.highschool' : 'Gymnasium',
      'data.bank' : 'Bank',
      'data.bankaccount' : 'Bankkonto',
      'data.union' : 'Kår',
      'data.universitypoints.total' : 'HP totalt',
      'data.interruption' : 'Avbrott',
    };

    $scope.convertToExcelFormat = function(applications){
      var dataList = [];
      var unipoints = new Set();
      var assignments = new Set();
      var earlierScholorships = new Set();

      function search(key, nameKey, myArray){
        for (var i=0; i < myArray.length; i++) {
          if (myArray[i][key] === nameKey) {
            return myArray[i];
          }
        }
        return {};
      }
      // Loop through applications to get all unique semesters.
      applications.forEach(function (a){
        a.data.universitypoints.semesters.forEach(function (s){
          unipoints.add(s.name);
        });
        a.data.assignments.forEach(function (s){
          var str = s.semester.split('-');
          str.forEach(function (x){
            assignments.add(x);
          });
        });
        a.data.earlierScholorships.forEach(function (s){
          earlierScholorships.add(s.semester);
        });
      });
      applications.forEach(function (a){
        unipoints.forEach(function(u){
          $scope.datafields['data.universitypoints.' + u] = 'Poäng ' + u;
          a.data.universitypoints[u] = search('name', u, a.data.universitypoints.semesters).points;
        });

        assignments.forEach(function(u){
          u.split("-").forEach(function (x){
            $scope.datafields['data.assignments.' + u] = 'Uppdrag ' + u;
            a.data.assignments[u] = search('semester', x, a.data.assignments).name;
          });
        });
        earlierScholorships.forEach(function(u){
          $scope.datafields['data.earlierScholorships.' + u] = 'Tidigare stip.' + u;
          var earl = search('semester', u, a.data.earlierScholorships);
          a.data.earlierScholorships[u] = earl.name + ": " + earl.money + "kr";
        });

        var inter;
        if(a.data.interruption.length > 1){
          inter = a.data.interruption.reduce(function(pre, curr) {
            return pre + ', ' + curr.when + ': ' + curr.why ;
          });
        } else if(a.data.interruption.length === 1) {
          inter = a.data.interruption[0].when + ": " + a.data.interruption[0].why;
        }
        a.data.interruption = inter;   
        dataList.push(a);
      });
      return dataList;
    };


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
