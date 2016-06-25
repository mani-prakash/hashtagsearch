//inject the twitterService into the controller
app.controller('TwitterController', function($scope,$q, twitterService, databaseService) {

    $scope.tweets=[]; //array of tweets
    $scope.timeOut = null;
    twitterService.initialize();
    $scope.hashTagData = null;
    $scope.databaseService = databaseService;
    $scope.isFirebaseLoaded = false;
    $scope.isTweetsLoaded = false;
    $scope.hashTagData = null;
    $scope.savedhashTag = "";
    $scope.searchHashTab = function() {
        clearTimeout($scope.timeOut);
        var hashTag = $scope.hashTag;
        $scope.savedhashTag = $scope.hashTag;
        databaseService.setHashTag(hashTag);
        getTwitterData();
    };


    $scope.connectButton = function() {
        twitterService.connectTwitter().then(function() {
            if (twitterService.isReady()) {
                //if the authorization is successful, hide the connect button and display the tweets
                $('#connectButton').fadeOut(function(){
                    $('#getHashButton, #signOut, #searchBox' ).fadeIn();
					          $scope.connectedTwitter = true;
                });
            } else {

			         }
        });
    };

    function getTwitterData(){
        var hashTag = $scope.savedhashTag;
        console.log('getting twitter data');
        twitterService.getHashTags(hashTag).then(function(data) {
            //$scope.tweets = $scope.tweets.concat(data['statuses']);
            databaseService.addTwitterData(data['statuses']);
            $scope.timeOut = setTimeout(getTwitterData ,3000);
        },function(){
            $scope.rateLimitError = true;
        });
    }
    $scope.signOut = function() {
        twitterService.clearCache();
        $scope.tweets.length = 0;
        $('#getHashButton, #signOut, #searchBox').fadeOut(function(){
            $('#connectButton').fadeIn();
			$scope.$apply(function(){$scope.connectedTwitter=false})
        });
        $scope.rateLimitError = false;    
    }

    if (twitterService.isReady()) {
        $('#connectButton').hide();
        //$('#getTimelineButton, #signOut').show();
        $('#getHashButton').show();
        $('#signOut').show();
        $('#searchBox').show();
     		$scope.connectedTwitter = true;
    }

});
