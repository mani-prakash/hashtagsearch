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
                deferred.resolve(data);
            }).fail(function(err) {
                deferred.reject(err);
            });
            return deferred.promise;
        }
    }

});


angular.module('twitterApp.services').factory('databaseService', function($q, $firebaseArray){
    var databaseService = {};
    var base_ref = firebaseApp.database().ref('/twitter');
    databaseService.hashTagRef = null;
    databaseService.isFirebaseThere = false;
    databaseService.tempTwitterData = [];
    databaseService.HashTagList = [];
    function sortTweets(x , y)
    {
        var xDate = new Date(x['created_at']);
        var yDate = new Date(y['created_at']);
        return (xDate.getTime()-yDate.getTime()) * -1;
    }
    function setHashTagList(data) {
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
                if (data[ltI]['id']===databaseService.HashTagList[j]['id']) {
                    console.log('isThere');
                    isThere = true;
                }
            }
            if(!isThere) {
                databaseService.HashTagList.push(data[ltI]);
                saveList.push(data[ltI]);
            }
            ltI--;
        }
        saveData(saveList);
        databaseService.HashTagList.sort(sortTweets);
        databaseService.tempTwitterData = [];
    }
    function saveData(list)
    {
        for(var i=0;i<list.length;i++)
        {
            databaseService.hashTagRef.push(list[i]);
        }
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
            setHashTagList(snapshot.val());
        });
    };
    databaseService.clearCache = function(){
        databaseService.tempTwitterData = [];
        databaseService.HashTagList = [];
        databaseService.isFirebaseThere = false;
    }
    return databaseService;
});