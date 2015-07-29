angular.module('instatrip.services', [])

.factory('Getdata', function ($http, $state) {
  var currentImages = [];
  var currentCoords = [];
  var Map;
  var markers = [];
  var currentMarker;
  var points = 15;
  var getmap = function(start,end,travelMethod){
    travelMethod = travelMethod || 'DRIVING';
    start = start || 'San Francisco';
    end = end || 'Oakland';
    var trvmthd = travelMethod;
    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
    var map;
    function initialize() {
      directionsDisplay = new google.maps.DirectionsRenderer();
      var MakerSquare = new google.maps.LatLng(37.787518, -122.399868);
      var mapOptions = {
        zoom:7,
        center: MakerSquare,
        disableDefaultUI: true,
        zoomControl: true,
           zoomControlOptions: {
             style: google.maps.ZoomControlStyle.SMALL
           }
      };
      map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
      directionsDisplay.setMap(map);
      Map = map;
    }

    function calcRoute(start, end, travelMethod, callback) {
      var waypoints = []; // these will be waypoints along the way
      var request = {
          origin: start,
          destination: end,
          travelMode: google.maps.TravelMode[travelMethod],
          unitSystem: google.maps.UnitSystem.IMPERIAL,
      };
      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
        }
      var nPts = findN(response.routes[0].overview_path, points);
      var coords = [];
      for(var i = 0; i < nPts.length; i++){
        coords.push({
          lat: nPts[i].A,
          lng: nPts[i].F
        });
      }
        currentCoords = coords;

        // callback(response.routes[0].overview_path, coords);
      });
    }

    initialize();
    var routes = calcRoute(start, end, travelMethod, ourCallback);

// take variable length array and return an array with n evenly spaced points
    var findN = function(input, n){
        var len = input.length;
        var divis;
        var output = [];
        if (len > n){
            divis = Math.floor(len / n);
        } else {
            divis = n;
        }

        for(var i = 0; i < len; i+=divis){
            output.push(input[i]);
        }
        return output;
    };


    function ourCallback(routes, coords){
      return getPhoto({
        coords: coords
      });
    }

        // TESTING
    var locMark = function(data) {
      markers = [];

      var makeMarker = function(data, id) {
        var myLatlng = new google.maps.LatLng(data.coordinates.lat, data.coordinates.lng);
        var marker = new google.maps.Marker({
          position: myLatlng,
          id: id,
          photos: data.photos
        });

        google.maps.event.addListener(marker, 'click', function() {
          currentImages = [];
          console.log(marker.id, marker.photos);
          currentImages = marker.photos;
          $state.go('display.pics');
        });

        return marker;
      };

      for(var i = 0; i < data.length; i++) {
        var newMarker = makeMarker(data[i], i);
        markers.push(newMarker);
      }

      for(i = 0; i < data.length; i++) {
        markers[i].setMap(Map);
      }
    };

    var getLocs = function(start, end) {
        var imgHolder = [];
      var linkHolder = {};
      return $http({
        method: 'POST',
        url: "/search",
        data: {
          start: start,
          end: end
        }
      }).then(function(resp){
        console.log(resp.data);
        locMark(resp.data);
      });
    };

    getLocs(start, end);

  };

  var markMap = function(num) {
    // collect all of the coords/create require objects and put them into markers array

    var curlen = markers.length;
    if (curlen > 0){
      for (var i = 0; i < curlen; i++){
          markers[i].setMap(null);
      }
    }
        markers = [];
    for (var j = 0; j < currentCoords.length; j++){
        var myLatlng = new google.maps.LatLng(currentCoords[j].lat ,currentCoords[j].lng);
        var marker = new google.maps.Marker({
            position: myLatlng
         });
        markers.push(marker);
    }
    // remove all of the markers expect the one need to be marked
    // To add or remove the marker to the map, call setMap();
    for (j = 0; j < currentCoords.length; j++){
        if (j === num) {
          if (currentMarker !== num){
            currentMarker = num;
            markers[j].setMap(Map);
          }
        } else {
          markers[j].setMap(null);
        }

    }
  };

  // Initiate Instagram request and package response into display
  var getPhoto = function(routes){
    var imgHolder = [];
    var linkHolder = {};
    return $http({
      method: 'POST',
      url: "/search",
      data: {start:"611 Mission Street, San Francisco, CA, United States", end:"25 Rausch Street, San Francisco, CA, United States"}

    }).then(function(resp){
      console.log('get photo resp: ', resp);
      var respLength = resp.data.length;
      for(var i = 0; i < respLength; i++){
        for (var j = 0; j < resp.data[i].length; j++){
          if (!(resp.data[i][j].link in linkHolder)){
            linkHolder[resp.data[i][j].link] = resp.data[i][j];
            imgHolder.push(resp.data[i][j]);
            break;
          }
        }
      }
      currentImages = imgHolder;
      $state.go('display.pics');
      return currentImages;
    });
  };

  var getImages = function(){
    return currentImages;
  };

  return {
            getmap: getmap,
            getPhoto: getPhoto,
            getImages: getImages,
            markMap: markMap

         };
});
