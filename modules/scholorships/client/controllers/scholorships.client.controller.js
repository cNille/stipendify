(function () {
  'use strict';

  // Scholorships controller
  angular
    .module('scholorships')
    .controller('ScholorshipsController', ScholorshipsController);

  ScholorshipsController.$inject = ['$scope', '$sce', '$state', 'Authentication', 'scholorshipResolve', 'dateFilter'];

  function ScholorshipsController ($scope, $sce, $state, Authentication, scholorship, dateFilter) {
    var vm = this;

    vm.authentication = Authentication;
    vm.scholorship = scholorship;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    
    vm.isAdmin = vm.authentication.user.roles && vm.authentication.user.roles.indexOf('admin') >= 0;
  
    // To enable using ng-model date to model.  
    $scope.startString = dateFilter(vm.scholorship.startDate, 'yyyy-MM-dd');
    $scope.endString = dateFilter(vm.scholorship.endDate, 'yyyy-MM-dd');
    
    var s = dateFilter(vm.scholorship.startDate, 'yyyy-MM-dd');
    var e = dateFilter(vm.scholorship.endDate, 'yyyy-MM-dd');
    var now = dateFilter(new Date(), 'yyyy-MM-dd');
    $scope.isActive = s <= now && e >= now;
    $scope.isOld = s <= now && e <= now;
    $scope.isUpcoming = s > now;

    $scope.$watch('startString', function (dateString) {
      vm.scholorship.startDate = new Date(dateString);
    });
    $scope.$watch('endString', function (dateString) {
      vm.scholorship.endDate = new Date(dateString);
    });
  
    // To show description in HTML.
    $scope.htmlDescription = $sce.trustAsHtml(vm.scholorship.description);


    $scope.addFund = function() {
      if(!vm.scholorship.funds) {
        vm.scholorship.funds = [];
      }
      vm.scholorship.funds.push({ name: '', size: 0, description: '', edit: true });
    };

    $scope.saveFund = function (pos, valid) {
      if(valid){
        vm.scholorship.funds[pos].edit = false;
      }
    };
  

    // Remove existing Scholorship
    function remove() {
      if (confirm('Är du säker på att du vill radera?')) {
        vm.scholorship.$remove($state.go('scholorships.list'));
      }
    }

    // Save Scholorship
    function save(isValid) {
      if (!(isValid && dateFilter(vm.scholorship.startDate, 'yyyy-MM-dd') < dateFilter(vm.scholorship.endDate, 'yyyy-MM-dd'))) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.scholorshipForm');
        vm.error = 'Ej giltig input. P.S tänk på att startdatum inte får ske samma dag eller senare än slutdatumet.';
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.scholorship._id) {
        vm.scholorship.$update(successCallback, errorCallback);
      } else {
        vm.scholorship.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('scholorships.view', {
          scholorshipId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
