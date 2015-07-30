var bibleReader = angular.module('bibleReader', []);

bibleReader.config(function($httpProvider) {
   $httpProvider.defaults.useXDomain = true;
   delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

//--------------------------------------------------

bibleReader.run(function($rootScope, fetchData) {
   // console.log('Run is running');
   $rootScope.data = {
      langCodes: [],
      langNames: [],
      versions: [],
      books: []
   };
   fetchData();
});

//--------------------------------------------------

bibleReader.factory('fetchData', function($rootScope, $http, fetchLangNames) {
   return function() {
      // console.log('fetchData is running');
      $http({
         method: 'GET',
         url: 'https://api.unfoldingword.org/uw/txt/2/catalog.json'
      })
      .success(function(data) {
         // console.log('fetching success', data.cat[0]);
         $rootScope.bibles = data.cat[0];
         angular.forEach($rootScope.bibles.langs, function(value, index) {
            $rootScope.data.langCodes.push(value.lc);
         });
         fetchLangNames($rootScope.data.langCodes);
      })
      .error(function(error) {
         // console.log('fetching failed', error);
      });
   }
});

//--------------------------------------------------

bibleReader.factory('fetchLangNames', function($rootScope, $http) {
   return function(langCodes) {
      console.log('fetchLangNames is running');
      $http({
         method: 'GET',
         url: 'http://td.unfoldingword.org/exports/langnames.json'
      })
      .success(function(data) {
         // console.log('fetching success', data.cat[0]);
         console.log($rootScope.data);
      })
      .error(function(error) {
         // console.log('fetching failed', error);
      });
   }
});

//--------------------------------------------------

bibleReader.controller('mainCtrl', function($rootScope) {
   // console.log('Controller is running');
   
});