'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload'];

  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider',
  function ($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(["$rootScope", "$state", "Authentication", function ($rootScope, $state, Authentication) {

  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;
      toState.data.roles.forEach(function (role) {
        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
          allowed = true;
          return true;
        }
      });

      if (!allowed) {
        event.preventDefault();
        if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
          $state.go('forbidden');
        } else {
          $state.go('authentication.signin').then(function () {
            storePreviousState(toState, toParams);
          });
        }
      }
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    storePreviousState(fromState, fromParams);
  });

  // Store previous state
  function storePreviousState(state, params) {
    // only store this state if it shouldn't be ignored 
    if (!state.data || !state.data.ignoreState) {
      $state.previous = {
        state: state,
        params: params,
        href: $state.href(state, params)
      };
    }
  }
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

(function (app) {
  'use strict';

  app.registerModule('scholorships');
})(ApplicationConfiguration);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);

'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
]);

'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'modules/core/client/views/home.client.view.html'
    })
    .state('not-found', {
      url: '/not-found',
      templateUrl: 'modules/core/client/views/404.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('bad-request', {
      url: '/bad-request',
      templateUrl: 'modules/core/client/views/400.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('forbidden', {
      url: '/forbidden',
      templateUrl: 'modules/core/client/views/403.client.view.html',
      data: {
        ignoreState: true
      }
    });
  }
]);

'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus',
  function ($scope, $state, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);

'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);

'use strict';

/**
 * Edits by Ryan Hutchison
 * Credit: https://github.com/paulyoder/angular-bootstrap-show-errors */

angular.module('core')
  .directive('showErrors', ['$timeout', '$interpolate', function ($timeout, $interpolate) {
    var linkFn = function (scope, el, attrs, formCtrl) {
      var inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses,
        initCheck = false,
        showValidationMessages = false,
        blurred = false;

      options = scope.$eval(attrs.showErrors) || {};
      showSuccess = options.showSuccess || false;
      inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
      inputNgEl = angular.element(inputEl);
      inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

      if (!inputName) {
        throw 'show-errors element has no child input elements with a \'name\' attribute class';
      }

      var reset = function () {
        return $timeout(function () {
          el.removeClass('has-error');
          el.removeClass('has-success');
          showValidationMessages = false;
        }, 0, false);
      };

      scope.$watch(function () {
        return formCtrl[inputName] && formCtrl[inputName].$invalid;
      }, function (invalid) {
        return toggleClasses(invalid);
      });

      scope.$on('show-errors-check-validity', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          initCheck = true;
          showValidationMessages = true;

          return toggleClasses(formCtrl[inputName].$invalid);
        }
      });

      scope.$on('show-errors-reset', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          return reset();
        }
      });

      toggleClasses = function (invalid) {
        el.toggleClass('has-error', showValidationMessages && invalid);
        if (showSuccess) {
          return el.toggleClass('has-success', showValidationMessages && !invalid);
        }
      };
    };

    return {
      restrict: 'A',
      require: '^form',
      compile: function (elem, attrs) {
        if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
          if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
            throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
          }
        }
        return linkFn;
      }
    };
  }]);

'use strict';

angular.module('core').factory('authInterceptor', ['$q', '$injector',
  function ($q, $injector) {
    return {
      responseError: function(rejection) {
        if (!rejection.config.ignoreAuthModule) {
          switch (rejection.status) {
            case 401:
              $injector.get('$state').transitionTo('authentication.signin');
              break;
            case 403:
              $injector.get('$state').transitionTo('forbidden');
              break;
          }
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function () {
    // Define a set of default roles
    this.defaultRoles = ['user', 'admin'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function (user) {
      if (!!~this.roles.indexOf('*')) {
        return true;
      } else {
        if(!user) {
          return false;
        }
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function (menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[menuId] = {
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function (menuId, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.state, options.items[i]);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      roles: ['*']
    });
  }
]);

'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function () {
      // Connect only when authenticated
      if (Authentication.user) {
        this.socket = io();
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function (eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function (eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);

(function () {
  'use strict';

  angular
    .module('scholorships')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('applications', {
        abstract: true,
        url: '/applications',
        template: '<ui-view/>'
      })
      .state('applications.submitted', {
        url: '/tack',
        templateUrl: 'modules/scholorships/client/views/submitted-application.client.view.html'
      })
      .state('applications.scholorlist', {
        url: '/scholorship/:scholorshipId',
        templateUrl: 'modules/scholorships/client/views/list-applications.client.view.html',
        controller: 'ApplicationsListController',
        controllerAs: 'vm',
        data: {
          roles: ['stipendiumansvarig', 'admin'],
          pageTitle: 'Applications List'
        }
      })
      .state('applications.list', {
        url: '',
        templateUrl: 'modules/scholorships/client/views/list-applications.client.view.html',
        controller: 'ApplicationsListController',
        controllerAs: 'vm',
        data: {
          roles: ['stipendiumansvarig', 'admin'],
          pageTitle: 'Applications List'
        }
      })
      .state('applications.create', {
        url: '/create/:scholorshipId/:scholorshipName',
        templateUrl: 'modules/scholorships/client/views/form-application.client.view.html',
        controller: 'ApplicationsController',
        controllerAs: 'vm',
        resolve: {
          applicationResolve: newApplication,
          semestersjs:  ["$http", function($http){
            // $http returns a promise for the url data
            return $http({ method: 'GET', url: '/js/semesters.js' });
          }],
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle : 'Ansök om stipendium'
        }
      })
      .state('applications.edit', {
        url: '/:applicationId/edit',
        templateUrl: 'modules/scholorships/client/views/form-application.client.view.html',
        controller: 'ApplicationsController',
        controllerAs: 'vm',
        resolve: {
          applicationResolve: getApplication
        },
        data: {
          roles: ['stipendiumansvarig', 'admin'],
          pageTitle: 'Edit Application {{ applicationResolve.name }}'
        }
      })
      .state('applications.view', {
        url: '/:applicationId',
        templateUrl: 'modules/scholorships/client/views/view-application.client.view.html',
        controller: 'ApplicationsController',
        controllerAs: 'vm',
        resolve: {
          applicationResolve: getApplication
        },
        data:{
          roles: ['stipendiumansvarig', 'admin'],
          pageTitle: 'Application {{ articleResolve.name }}'
        }
      });
  }

  getApplication.$inject = ['$stateParams', 'ApplicationsService'];

  function getApplication($stateParams, ApplicationsService) {
    return ApplicationsService.get({
      applicationId: $stateParams.applicationId
    }).$promise;
  }

  newApplication.$inject = ['ApplicationsService'];

  function newApplication(ApplicationsService) {
    return new ApplicationsService();
  }
})();

(function () {
  'use strict';

  angular
    .module('scholorships')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Stipendium',
      state: 'scholorships',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'scholorships', {
      title: 'Utlysta stipendier',
      state: 'scholorships.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'scholorships', {
      title: 'Utlys Stipendium',
      state: 'scholorships.create',
      roles: ['stipendiumansvarig']
    });

    // Add the dropdown list applications
    Menus.addSubMenuItem('topbar', 'scholorships', {
      title: 'Se ansökningar',
      state: 'applications.list',
      roles: ['stipendiumansvarig']
    });
  }
})();

(function () {
  'use strict';

  angular
    .module('scholorships')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('scholorships', {
        abstract: true,
        url: '/scholorships',
        template: '<ui-view/>'
      })
      .state('scholorships.list', {
        url: '',
        templateUrl: 'modules/scholorships/client/views/list-scholorships.client.view.html',
        controller: 'ScholorshipsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Scholorships List'
        }
      })
      .state('scholorships.create', {
        url: '/create',
        templateUrl: 'modules/scholorships/client/views/form-scholorship.client.view.html',
        controller: 'ScholorshipsController',
        controllerAs: 'vm',
        resolve: {
          scholorshipResolve: newScholorship
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle : 'Scholorships Create'
        }
      })
      .state('scholorships.edit', {
        url: '/:scholorshipId/edit',
        templateUrl: 'modules/scholorships/client/views/form-scholorship.client.view.html',
        controller: 'ScholorshipsController',
        controllerAs: 'vm',
        resolve: {
          scholorshipResolve: getScholorship
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Scholorship {{ scholorshipResolve.name }}'
        }
      })
      .state('scholorships.view', {
        url: '/:scholorshipId',
        templateUrl: 'modules/scholorships/client/views/view-scholorship.client.view.html',
        controller: 'ScholorshipsController',
        controllerAs: 'vm',
        resolve: {
          scholorshipResolve: getScholorship
        },
        data:{
          pageTitle: 'Scholorship {{ articleResolve.name }}'
        }
      });
  }

  getScholorship.$inject = ['$stateParams', 'ScholorshipsService'];

  function getScholorship($stateParams, ScholorshipsService) {
    return ScholorshipsService.get({
      scholorshipId: $stateParams.scholorshipId
    }).$promise;
  }

  newScholorship.$inject = ['ScholorshipsService'];

  function newScholorship(ScholorshipsService) {
    return new ScholorshipsService();
  }
})();

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

    // Create question Array
    $scope.personQuestions = [ 
      { 
        name : 'personnummer', 
        question : 'Personnr', 
        placeholder : 'XXXXXXX-XXXX', 
        variable : $scope.user.personNumber 
      }, { 
        name : 'telephone', 
        question : 'Telefon', 
        placeholder : '07XX-XX XX XX', 
        variable : $scope.user.telephone 
      }, { 
        name : 'streetaddress', 
        question : 'Gatuadress', 
        variable : $scope.user.streetaddress 
      }, { 
        name : 'zipcode', 
        question : 'Post nummer', 
        variable : $scope.user.zipCode 
      }, { 
        name : 'city', 
        question : 'city', 
        variable : $scope.user.city 
      }, { 
        name : 'highshool', 
        question : 'Gymnasium och ort', 
        variable : $scope.user.highschool 
      }, { 
        name : 'bank', 
        question : 'Bank', 
        variable : $scope.user.bank 
      }, { 
        name : 'bankaccount', 
        question : 'Bankkonto', 
        variable : $scope.user.bankaccount 
      }, { 
        name : 'union', 
        question : 'Kår', 
        variable : $scope.user.union 
      },
    ];
  
    $scope.updateModels = function() {
      $scope.user.personNumber = $scope.personQuestions[0].variable;
      $scope.user.telephone = $scope.personQuestions[1].variable;
      $scope.user.streetaddress = $scope.personQuestions[2].variable;
      $scope.user.zipCode = $scope.personQuestions[3].variable;
      $scope.user.city = $scope.personQuestions[4].variable;
      $scope.user.highschool = $scope.personQuestions[5].variable;
      $scope.user.bank = $scope.personQuestions[6].variable;
      $scope.user.bankaccount = $scope.personQuestions[7].variable;
      $scope.user.union = $scope.personQuestions[8].variable;
    };

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

        $scope.updateApplication();

      }, function (response) {
        $scope.error = response.data.message;
      });
    };

    $scope.updateApplication = function() {
      // Add userdata to application
      vm.application.user = vm.authentication.user._id;
      vm.application.scholorship = vm.scholorshipId;
      vm.application.semesterStudied = vm.semesterStudied;
      vm.application.semesterNation = vm.semesterNation;
  
      $scope.user.universitypoints.semesters = $scope.user.universitypoints.semesters.filter(function (semester) {
        return semester.points !== 0;
      });

      vm.application.data = {
        'displayName': $scope.user.displayName,
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

      // Save application
      vm.application.$save($scope.successCallback, $scope.errorCallback);
    };

    $scope.addSemester = function (semesters){
      SemesterService.addSemester(semesters, false);
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
        vm.error = 'Du har missat att fylla i alla obligatoriska fält.';
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

(function () {
  'use strict';

  angular
    .module('scholorships')
    .controller('ApplicationsListController', ApplicationsListController);

  ApplicationsListController.$inject = ['ApplicationsService', 'SemesterService', '$scope', '$http', '$stateParams'];

  function ApplicationsListController(ApplicationsService, SemesterService, $scope, $http, $stateParams) {
    var vm = this;

    vm.scholorshipId = $stateParams.scholorshipId;
    vm.semesters = SemesterService.getLastFourSemesters({});
    $scope.applications = ApplicationsService.query({ scholorship : vm.scholorshipId }, function(data) {
      // TODO: Find better solution than to filter here.
      $scope.applications = data.filter(function(d){ return d.scholorship === vm.scholorshipId; });
      $scope.scholorshipName = data[0].data.scholorshipName;
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

(function () {
  'use strict';

  angular
    .module('scholorships')
    .controller('ScholorshipsListController', ScholorshipsListController);

  ScholorshipsListController.$inject = ['ScholorshipsService'];

  function ScholorshipsListController(ScholorshipsService) {
    var vm = this;

    vm.scholorships = ScholorshipsService.query();
  }
})();

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
    
    // Det Nille lagt dit, härifrån...
  
    // To enable using ng-model date to model.  
    $scope.startString = dateFilter(vm.scholorship.startDate, 'yyyy-MM-dd');
    $scope.endString = dateFilter(vm.scholorship.endDate, 'yyyy-MM-dd');

    $scope.$watch('startString', function (dateString) {
      vm.scholorship.startDate = new Date(dateString);
    });
    $scope.$watch('endString', function (dateString) {
      vm.scholorship.endDate = new Date(dateString);
    });
  

    // To show description in HTML.
    $scope.htmlDescription = $sce.trustAsHtml(vm.scholorship.description);

  
    // ... till hit

    // Remove existing Scholorship
    function remove() {
      if (confirm('Är du säker på att du vill radera?')) {
        vm.scholorship.$remove($state.go('scholorships.list'));
      }
    }

    // Save Scholorship
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.scholorshipForm');
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

// Applications service used to communicate Applications REST endpoints.
(function(){
  'use strict';

  angular
    .module('scholorships')
    .factory('ApplicationsService', ApplicationsService);
  ApplicationsService.$inject = ['$resource'];

  function ApplicationsService($resource) {
    return $resource('api/applications/:applicationId', {
      applicationId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  } 
})();

//Scholorships service used to communicate Scholorships REST endpoints
(function () {
  'use strict';

  angular
    .module('scholorships')
    .factory('ScholorshipsService', ScholorshipsService);

  ScholorshipsService.$inject = ['$resource'];

  function ScholorshipsService($resource) {
    return $resource('api/scholorships/:scholorshipId', {
      scholorshipId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();

(function(){
  'use strict';

  angular
    .module('scholorships')
    .factory('SemesterService', SemesterService);
  //SemesterService.$inject = ['$resource'];

  function SemesterService() {
    return {
      addSemester: function (semesters, addToFront){
        var arrLength = semesters.length;
        var newSemester = '';
        if(arrLength === 0){
          newSemester = this.getThisSemesterName();
        } else {
          var lastSemester = addToFront ? semesters[0].name : semesters[arrLength-1].name;
          var year = parseInt(lastSemester.substring(2));  
          var name = lastSemester.substring(0,2);  
          newSemester = name === 'VT' ? 'HT' + (year - !addToFront).toString() : 'VT' + (year + addToFront).toString();
        } 
        var obj = { 'name': newSemester, 'points': 0 };
        if(addToFront){
          semesters.unshift(obj);
        } else {
          semesters.push(obj);
        }

      },
      getThisSemesterName: function (){ 
        var today = new Date();
        var month = today.getMonth()+1; //January is 0!
        var year = today.getFullYear();
        var thisSemester = (month < 7 ? 'VT' : 'HT') + (year - 2000).toString();
        return thisSemester;
      },
      getLastFourSemesters: function(semesters){
        while(semesters.length < 4){
          this.addSemester(semesters, false);
        }
        return semesters;
      },
    };
  } 
})();

'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Hantera användare',
      state: 'admin.users'
    });
  }
]);

'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
      });
  }
]);

'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);

'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
  function ($scope, $state, Authentication, userResolve) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;

    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = $scope.user;

      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication', 'PasswordValidator',
  function ($scope, $http, Authentication, PasswordValidator) {
    $scope.user = Authentication.user;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');

        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
  function ($scope, $timeout, $window, Authentication, FileUploader) {
    $scope.user = Authentication.user;
    $scope.imageURL = $scope.user.profileImageURL;

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      // Populate user object
      $scope.user = Authentication.user = response;

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadProfilePicture = function () {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };
  }
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SocialAccountsController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);

'use strict';

angular.module('users')
  .directive('passwordValidator', ['PasswordValidator', function(PasswordValidator) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$validators.requirements = function (password) {
          var status = true;
          if (password) {
            var result = PasswordValidator.getResult(password);
            var requirementsIdx = 0;

            // Requirements Meter - visual indicator for users
            var requirementsMeter = [
              { color: 'danger', progress: '20' },
              { color: 'warning', progress: '40' },
              { color: 'info', progress: '60' },
              { color: 'primary', progress: '80' },
              { color: 'success', progress: '100' }
            ];

            if (result.errors.length < requirementsMeter.length) {
              requirementsIdx = requirementsMeter.length - result.errors.length - 1;
            }

            scope.requirementsColor = requirementsMeter[requirementsIdx].color;
            scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

            if (result.errors.length) {
              scope.popoverMsg = PasswordValidator.getPopoverMsg();
              scope.passwordErrors = result.errors;
              status = false;
            } else {
              scope.popoverMsg = '';
              scope.passwordErrors = [];
              status = true;
            }
          }
          return status;
        };
      }
    };
  }]);

'use strict';

angular.module('users')
  .directive('passwordVerify', [function() {
    return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ngModel) {
        var status = true;
        scope.$watch(function() {
          var combined;
          if (scope.passwordVerify || ngModel) {
            combined = scope.passwordVerify + '_' + ngModel;
          }
          return combined;
        }, function(value) {
          if (value) {
            ngModel.$validators.passwordVerify = function (password) {
              var origin = scope.passwordVerify;
              return (origin !== password) ? false : true;
            };
          }
        });
      }
    };
  }]);

'use strict';

// Users directive used to force lowercase input
angular.module('users').directive('lowercase', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  };
});

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);

'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Please enter a passphrase or password with greater than 10 characters, numbers, lowercase, upppercase, and special characters.';
        return popoverMsg;
      }
    };
  }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
