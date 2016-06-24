angular.module('twitterApp.services', []).factory('twitterService', function($q) {

    var authorizationResult = false;

    return {
        initialize: function() {
            OAuth.initialize('T47YxDcvXQcVOGQD7ZRgAjO6dAU', {cache:true});
            authorizationResult = OAuth.create('twitter');
        },
        isReady: function() {
            return (authorizationResult);
        },
        connectTwitter: function() {
            var deferred = $q.defer();
            OAuth.popup('twitter', {cache:true}, function(error, result) {
                if (!error) {
                    authorizationResult = result;
                    deferred.resolve();
                } else {
                    //do something if there's an error

                }
            });
            return deferred.promise;
        },
        clearCache: function() {
            OAuth.clearCache('twitter');
            authorizationResult = false;
        },
        getHashTags: function(hashTag){
            var deferred = $q.defer();
            var url='/1.1/search/tweets.json?q=%23'+hashTag;
            var promise = authorizationResult.get(url).done(function(data) { //https://dev.twitter.com/docs/api/1.1/get/statuses/home_timeline
                //when the data is retrieved resolve the deferred object
                deferred.resolve(data);
            }).fail(function(err) {
                //in case of any error we reject the promise with the error object
                deferred.reject(err);
            });
            //return the promise of the deferred object
            return deferred.promise;
        }
    }
});


angular.module('twitterApp.services').factory('databaseService', function($q, $firebaseArray){
    var databaseService = {};
    console.log(firebaseApp);
    var base_ref = firebaseApp.database().ref('/twitter');//new Firebase('https://testzophop.firebaseio.com/development/queue');//"https://testtwitter-776fb.firebaseio.com/works");
    databaseService.hashTagRef = null;
    databaseService.isFirebaseThere = false;
    console.log(base_ref);
    databaseService.tempTwitterData = [];
    databaseService.HashTagList = [];
    databaseService.setHashTagList = function (data) {
        data = (data === null)?{}:data;
        var keys = Object.keys(data);
        for(var i=0;i<keys.length;i++)
        {
            databaseService.HashTagList.push(data[keys[i]]);
        }
    };
    function addTwitterData(){
        var ltI = databaseService.tempTwitterData.length-1;
        var data = databaseService.tempTwitterData;
        var saveList = [];
        while(ltI>=0) {
            var isThere = false;
            for (var j = 0; j < databaseService.HashTagList.length ; j++)
            {
                if (data['id'] ===databaseService.HashTagList[j]['id']) {
                    isThere = true;
                }
            }
            if(isThere) {
                ltI--;
            }
            else{
                break;
            }
        }
        while(ltI>=0)
        {
            databaseService.HashTagList.push(data[ltI]);
            saveList.push(data[ltI]);
            ltI--;
        }
        databaseService.saveData(saveList);
        databaseService.tempTwitterData = [];
    }
    databaseService.addTwitterData = function (data) {
        databaseService.tempTwitterData = databaseService.tempTwitterData.concat(data);
        var saveList = [];
        if(!databaseService.isFirebaseThere)
        {
            return;
        }
        addTwitterData();
    };
    databaseService.setHashTag = function(hashTag)
    {
        databaseService.isFirebaseThere = false;
        databaseService.tempTwitterData = [];
        databaseService.HashTagList = [];
        databaseService.hashTagRef = base_ref.child(hashTag);
        databaseService.hashTagRef.once('value').then( function(snapshot) {
            databaseService.isFirebaseThere = true;
            databaseService.setHashTagList(snapshot.val());
        });
    };
    databaseService.saveData = function(list)
    {
        for(var i=0;i<list.length;i++)
        {
            databaseService.hashTagRef.push(list[i]);
        }
    }
    return databaseService;
});