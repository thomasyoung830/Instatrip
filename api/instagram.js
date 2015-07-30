var instagram = require('instagram-node-lib');
var keys = require('../config.js');
var Promise = require('bluebird');
instagram.set('client_id', keys.INSTAGRAM_ID);
instagram.set('client_secret', keys.INSTAGRAM_SECRET);



// var getInstaDataByCoords = function(barName, coords, latitude, longitude, distance){
//   return new Promise(function(resolve, reject){
//     instagram.media.search({lat: latitude, lng: longitude, distance: distance, 
//       complete: function(data){
//         // 'data' is an array of photo-objects for a specific coordinate
//         // 
//         resolve({barName:barName, coords: coords, data: data});
//         // callback(barName, coords, data);
//       },error: function(errorMessage, errorObject, caller){
//         reject(errorMessage);
//         // console.log(errorMessage);
//       }
//     });
//   });
// };

var getInstaDataById = function(locationId, barName, coords, lat, lng ){
  return new Promise(function(resolve, reject){
    instagram.locations.recent({ location_id: locationId, 
    complete: function(data){
        // 'data' is an array of photo-objects for a specific location
        resolve({barName:barName, lat: lat, lng: lng, data: data});
        // callback(barName, coords, data);
      },error: function(errorMessage, errorObject, caller){
        reject(errorMessage);
        // console.log(errorMessage);
      }
    });
  });
};



var getInstaLocation = function(foursquareId, barName, coords, lat, lng, dist){
  return new Promise(function(resolve, reject){
    instagram.locations.search({ foursquare_v2_id: foursquareId, 
      complete: function(data){
        console.log('instagram location info request data: ', data);
        resolve({
          instagramLocationId: data[0].id,
          barName: barName, 
          coords: coords, 
          lat: lat,
          lng: lng
        });
      },error: function(errorMessage, errorObject, caller){
        reject(errorMessage);
        console.log(errorMessage);
        // console.log(errorMessage);
      } 
    });
  });
};



var sortInstaData = function(barObjArray, coords){
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
};



// parse instagram data object
var photoParser = function(barName, lat, lng, photoObjArr){
  var results = [];
  var locationPhotoObj = { barName: barName, location: {latitude: lat, longitude: lng}, photos: [] };
  for(var i = 0; i < photoObjArr.length; i++){
    locationPhotoObj.photos.push({
      link: photoObjArr[i].link,
      url: photoObjArr[i].images.low_resolution.url
    });
  }
  // results.push(locationPhotoObj);
  return locationPhotoObj;


  // // check if all api calls have been processed, sort, return to client
  // if (results.length === coords.length){
  //   results = sortInstaData(results, coords);
  //   console.log('first result Obj ', results[0]);
  //   callback(results);
  // }
};

// this gets called first, with 'sendResponse' as the callback.
// call to instagram for each coordinate set and return to client.
var obtainInstaData = function(instaData){
  return new Promise(function(resolve, reject){
  
    var lat, lng, dist, barName, foursquare_v2_id = 300; // dist unit: m, max: 5000m --- distance around lat+lng to look for photos

    var instaLocationPromiseArr = [];
    // 447bf8f1f964a520ec331fe3
    // promiseResultsArr.push(getInstaLocation('447bf8f1f964a520ec331fe3'));

    // get the instagram id of each location based on the foursquare id
    for (var i = 0; i < instaData.length; i++){
      foursquare_v2_id = instaData[i].foursquare_v2_id;
      barName = instaData[i].name;
      lat = instaData[i].coordinates.lat;
      lng = instaData[i].coordinates.lng;
      // save each promise in an array
      instaLocationPromiseArr.push( getInstaLocation( foursquare_v2_id, barName, instaData, lat, lng, dist ) );
    }

    // once all promises are resolved, look up photos tagged with each location
    Promise.all( instaLocationPromiseArr ).then(function(resultsArr){
      var instaDataPromiseArr = [];

      for (var i = 0; i < resultsArr.length; i++){
        var instagramLocationId = resultsArr[i].instagramLocationId;
        var barName = resultsArr[i].barName;
        var  coords = resultsArr[i].coords;
        var  lat = resultsArr[i].lat;
        var  lng = resultsArr[i].lng;

        instaDataPromiseArr.push( getInstaDataById( instagramLocationId, barName, coords, lat, lng ) );
      }

      return Promise.all( instaDataPromiseArr );

    }).then(function(resultsArr){
      var parsedResultsArr = [];

      // format each location's data to send back to client
      for(var i = 0; i < resultsArr.length; i++){
        var barName = resultsArr[i].barName;
        var lat = resultsArr[i].lat;
        var lng = resultsArr[i].lng;
        var photoObjArr = resultsArr[i].data;

        parsedResultsArr.push( photoParser(barName, lat, lng, photoObjArr) );
      }

      resolve(parsedResultsArr);

    });


    // var promiseResultsArr = [];

    // // for each coordinate, get an array of photo objects
    // for (var i = 0; i < coords.length; i++){
    //   foursquare_v2_id = coords[i].foursquare_v2_id;
    //   barName = coords[i].name;
    //   lat = coords[i].coordinates.lat;
    //   lng = coords[i].coordinates.lng;

    //   promiseResultsArr.push( getInstaDataByCoords(barName, coords, lat, lng, dist) );
    // }

    // // waits for all promises in 'promiseResultsArr' to finish before calling 'then'
    // Promise.all(promiseResultsArr).then(function(resultsArr){
    //   var parsedResultsArr = [];

    //   for(var i = 0; i < resultsArr.length; i++){
    //     var barName = resultsArr[i].barName;
    //     var coords = resultsArr[i].coords;
    //     var data = resultsArr[i].data;
    //     parsedResultsArr.push( photoParser(barName, coords, data) );
    //   }
    //   console.log('parsedResultsArr is: ', JSON.stringify(parsedResultsArr));
    //   resolve(parsedResultsArr);

    // });


  });
};


module.exports = {
  obtainInstaData: obtainInstaData
};
