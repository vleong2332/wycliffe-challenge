var bibleReader = angular.module('bibleReader', []);

bibleReader.config(function($httpProvider) {
   $httpProvider.defaults.useXDomain = true;
   delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

//--------------------------------------------------

bibleReader.run(function($rootScope, fetchData) {
   // console.log('Run is running');
   $rootScope.ready = false;
   $rootScope.data = {
      langCodes:  [],
      langNames:  [],
      versions:   [],
      books:      [],
      text:       null,
      parsedText: []
   };
   $rootScope.userLang         = "";
   $rootScope.userVersion      = "";
   $rootScope.userBook         = "";
   $rootScope.userView         = "";
   $rootScope.userLangIndex    = null;
   $rootScope.userVersionIndex = null;
   $rootScope.userBookIndex    = null;
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

         $rootScope.ready = true;
      })
      .error(function(error) {
         // console.log('fetching failed', error);
      });
   }
});

//--------------------------------------------------

bibleReader.factory('fetchText', function($rootScope, $http) {
   return function(SRC) {
      $http({
         method: 'GET',
         url: SRC
      })
      .success(function(data) {

         $rootScope.data.text = data.split('\n');
         $rootScope.data.parsedText = [];
         angular.forEach($rootScope.data.text, function(value, index) {
            $rootScope.data.parsedText.push($rootScope.parseUSFM(value));
         });

         angular.element(document.getElementById('view')).children().remove();
         $rootScope.processEntry($rootScope.data.parsedText);
      })
      .error(function(error) {
         console.log('fetching failed', error);
      });
   }
});

//--------------------------------------------------

bibleReader.factory('fetchLangNames', function($rootScope, $http) {
   return function(langCodes) {
      console.log('fetchLangNames is running');
      $http({
         method: 'GET',
         url: 'https://td.unfoldingword.org/exports/langnames.json'
      })
      .success(function(data) {
         // console.log('fetching success', data.cat[0]);
         console.log($rootScope.data);
      })
      .error(function(error) {
         console.log('fetchLangNames failed', error);
      });
   }
});

//--------------------------------------------------

bibleReader.controller('mainCtrl', function($rootScope, fetchText) {

   $rootScope.updateVersions = function() {
      $rootScope.userLang = document.getElementById('userLang').value;
      $rootScope.data.versions = [];

      angular.forEach($rootScope.bibles.langs, function(value, index) {
         if (value.lc === $rootScope.userLang) {
            $rootScope.userLangIndex = index;
            angular.forEach($rootScope.bibles.langs[index].vers, function(value, index) {
               $rootScope.data.versions.push(value.slug);
            });
         }
      });
   };

   $rootScope.updateBooks = function() {
      $rootScope.userVersion = document.getElementById('userVersion').value;
      $rootScope.data.books = [];
      var langIndex = $rootScope.userLangIndex;
      
      angular.forEach($rootScope.bibles.langs[langIndex].vers, function(value, index) {
         if (value.slug == $rootScope.userVersion) {
            $rootScope.userVersionIndex = index;
            angular.forEach(value.toc, function(value, index) {
               $rootScope.data.books.push(value.slug);
            });
         }
      });
   };

   $rootScope.updateView = function() {
      $rootScope.userBook = document.getElementById('userBook').value;
      console.log('updating view', $rootScope.userBook);
      var langIndex = $rootScope.userLangIndex;
      var versIndex = $rootScope.userVersionIndex;

      angular.forEach($rootScope.bibles.langs[langIndex].vers[versIndex].toc, function(value, index) {
         if (value.slug == $rootScope.userBook) {
            $rootScope.userBookIndex = index;
            $rootScope.userView = value.src;
         }
      });

      console.log($rootScope.userView);
      fetchText($rootScope.userView);
   };

   $rootScope.parseUSFM = function(input) { 
      var pattern = /^(\S+) *([\d|-]*) *([\s\S]*)$/; 
      var result = pattern.exec(input);
      if (result === null) {
         return {
            tag: null,
            number: null,
            text: null
         };
      }
      return {
         tag: result[1],
         number: result[2],
         text: result[3]
      };
   };

   $rootScope.processEntry = function(entry) {
      angular.forEach(entry, function(value, index) {
         if (value.tag === "\\h") {
            var element = "<h1>" + value.text + "</h1>";
         }
         if (value.tag === "\\c") {
            var element = "<h2>Chapter " + value.number + "</h2>";
         }
         if (value.tag === "\\v") {
            var element = "<p><span class=\"verse-num\">" + value.number + ".</span> " + value.text + "</h3>";
         }
         if (value.tag === "\\s5") {
            var element = "<p class=\"section\"></p>";
         }
         angular.element(document.getElementById('view')).append(element);
      });
   }

});