/*globals saveAs */
(function () {
  'use strict';

  angular.module('scholorships')
    .directive('ngJsonExcel', function () {
      return {
        restrict: 'AE',
        scope: true,
        controller: function ($scope, $element) {
          $scope.filename = 'ansokningar';
          var fields = [];
          var header = [];
          var separator = $scope.separator || ';';

          $scope.myOnclickFunction = function (myfields, applications) {
            angular.forEach(myfields, function(field, key) {
              if(!field || !key) {
                throw new Error('error json report fields');
              }
              fields.push(key);
              header.push(field);
            });
            var bodyData = _bodyData(applications);
            var strData = _convertToExcel(bodyData);
            var blob = new Blob([strData], { type: 'text/plain;charset=utf-8' });
            return saveAs(blob, [$scope.filename + '.csv']);
          };

          function _bodyData(applications) {
            var data = applications;
            var body = "";
            angular.forEach(data, function(dataItem) {
              var rowItems = [];
              angular.forEach(fields, function(field) {
                if(field.indexOf('.')) {
                  field = field.split(".");
                  var curItem = dataItem;
                  // deep access to obect property
                  angular.forEach(field, function(prop){
                    if (curItem !== null && curItem !== undefined) {
                      curItem = curItem[prop];
                    }
                  });
                  data = curItem;
                } else {
                  data = dataItem[field];
                }

                var fieldValue = data !== null ? data : ' ';

                if (fieldValue !== undefined && angular.isObject(fieldValue)) {
                  fieldValue = _objectToString(fieldValue);
                }

                if(typeof fieldValue === 'string') {
                  rowItems.push('"' + fieldValue.replace(/"/g, '""') + '"');
                } else {
                  rowItems.push(fieldValue);
                }
              });
              body += rowItems.join(separator) + '\n';
            });
            return body;
          }

          function _convertToExcel(body) {
            return header.join(separator) + '\n' + body;
          }

          function _objectToString(object) {
            var output = '';
            angular.forEach(object, function(value, key) {
              output += key + ':' + value + ' ';
            });
            return '"' + output + '"';
          }
        }
      };
    }
  );
})();
