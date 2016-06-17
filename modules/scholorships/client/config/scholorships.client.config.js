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

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'scholorships', {
      title: 'Ansök om stipendium',
      state: 'applications.create',
      roles: ['user']
    });
  }
})();
