var keys = require('../config.js');

// Uber API Constants
var uberClientId = keys.UBER_CLINET_ID
  , uberServerToken = keys.UBER_SERVER_TOKEN;

// Create variables to store latitude and longitude
var userLatitude
  , userLongitude
  , endLatitude = 40.7283405
  , endLongitude = -73.994567;

// Create variable to store timer
var timer;

navigator.geolocation.watchPosition(function(position) {
  // Update latitude and longitude
  userLatitude = position.coords.latitude;
  userLongitude = position.coords.longitude;

  // Create timer 
  // Once initialized, it will fire every 60 seconds as recommended by the Uber API
  // We only create the timer after we've gotten the user's location for the first time 
  if (typeof timer === typeof undefined) {
    timer = setInterval(function() {
        getEstimatesForUserLocation(userLatitude, userLongitude);
    }, 60000);

    // Query Uber API if needed
    getEstimatesForUserLocation(userLatitude, userLongitude);
  }
});

function getEstimatesForUserLocation(latitude,longitude) {
  https({
    url: "https://api.uber.com/v1/estimates/price",
    headers: {
      Authorization: "Token " + uberServerToken
    },
    data: { 
      start_latitude: latitude,
      start_longitude: longitude,
      end_latitude: endLatitude,
      end_longitude: endLongitude
    }
    .then.function(res) {
      console.log(JSON.stringify(res));

      // 'res' is an object with a key containing an Array
      var data = res["prices"]; 
      if (typeof data != typeof undefined) {
        // Sort Uber products by time to the user's location 
        data.sort(function(t0, t1) {
          return t0.duration - t1.duration;
        });

        // Update the Uber button with the shortest time
        var shortest = data[0];
        if (typeof shortest != typeof undefined) {
          console.log("Updating time estimate...");
          $("#time").html("IN " + Math.ceil(shortest.duration / 60.0) + " MIN");
        }
      }
    }
  });
}