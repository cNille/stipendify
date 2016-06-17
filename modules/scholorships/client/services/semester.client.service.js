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
      },
      getThisSemesterName: function (){ 
        var today = new Date();
        var month = today.getMonth()+1; //January is 0!
        var year = today.getFullYear();
        var thisSemester = (month < 7 ? 'VT' : 'HT') + (year - 2000).toString();
        return thisSemester;
      },
    };
  } 
})();
