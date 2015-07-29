var instagram = require('instagram-node-lib');
var keys = require('../config.js');
instagram.set('client_id', keys.INSTAGRAM_ID);
instagram.set('client_secret', keys.INSTAGRAM_SECRET);

module.exports = {

  getInstaData : function(barName, latitude, longitude, distance, callback){
    instagram.media.search({lat: latitude, lng: longitude, distance: distance, 
      complete: function(data){
        // 'data' is an array of photo-objects for a specific coordinate
        callback(barName, data);
      },error: function(errorMessage, errorObject, caller){
        console.log(errorMessage);
      }
    });
  },

  sortInstaData: function(barObjArray, coords){
        var origin = coords[0];
        var destination = coords[coords.length -1];

        // Sort photos based on longitude and direction of travel
        if (origin.lng > destination.lng){
          barObjArray.sort(function(a, b){
            return b.location.longitude - a.location.longitude;
          });
        } else {
          barObjArray.sort(function(a, b){
            return a.location.longitude - b.location.longitude;
          });
        }

        return barObjArray;
  },

  // this gets called first, with 'sendResponse' as the callback.
  // call to instagram for each coordinate set and return to client.
  // 'coords' should include the bar name.
  obtainInstaData : function(coords, callback){
    var results = [];
    var lat, lng, dist = 300; // dist unit: m, max: 5000m --- distance around lat+lng to look for photos

    // parse instagram data object
    var photoParser =  function(barName, data){
      var locationPhotoObj = { barName: barName, location: data[0].location, photos: [] };
      for(var i = 0; i < data.length; i++){
        locationPhotoObj.photos.push({
          link: data[i].link,
          url: data[i].images.low_resolution.url
        });
      }
      results.push(locationPhotoObj);

      // check if all api calls have been processed, sort, return to client
      if (results.length === coords.length){
        results = this.sortInstaData(results, coords);
        callback(results);
      }
    };

    // for each coordinate, get an array of photo objects
    for (var i = 0; i < coords.length; i++){
      barName = coords[i].barName;
      lat = coords[i].lat;
      lng = coords[i].lng;
      this.getInstaData(barName, lat, lng, dist, photoParser.bind(this));
    }

  }

};
