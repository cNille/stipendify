'use strict';

angular.module('users').controller('AttachmentsController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader', 'applicationResolve', '$state',
  function ($scope, $timeout, $window, Authentication, FileUploader, application, $state) {
    var vm = this;
    $scope.user = Authentication.user;
    vm.application = application;
    $scope.imgUrlBase = 'public/uploads/';
    $scope.pdfURL = $scope.imgUrlBase + vm.application._id + '.pdf';

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/applications/ladok/' + vm.application._id,
      alias: 'newLadokFile'
    });

    // Set file uploader pdf filter
    $scope.uploader.filters.push({
      name: 'pdfFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|pdf|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a ladok file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.pdfURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new ladokfile
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;
      // Clear upload buttons
      $scope.cancelUpload();

      
      $state.go('applications.submitted');
      event.preventDefault();
      return;
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadLadokFile = function () {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.pdfURL = $scope.imgUrlBase + vm.application._id + '.pdf';
    };
  }
]);
