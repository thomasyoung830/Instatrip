/**
 * @module foursquare
 */

var Promise = require('bluebird');
var request = require('request-promise');

var keys = require('../config.js');


/**
 * Finds bars within 250m of a coordinate
 * @param  {Array} coords [latitude, longitude]
 * @return {Promise.<Array>}        Array of bars sorted by rating
 */
var get_foursquare_data_for_coord = function(coords) {
  return request({
    'uri': 'https://api.foursquare.com/v2/venues/explore',
    'qs': {
      'v': 20150728,
      'm': 'foursquare',
      'client_id': keys.FOURSQUARE_ID,
      'client_secret': keys.FOURSQUARE_SECRET,
      'll': coords.join(','),
      'radius': 300,
      // 'query': 'bar',
      'section': 'drinks',
      'limit': 15,
      'openNow': 1
    },
    'json': true
  }).then(function(res) {
    return res.response.groups[0].items.sort(function(a, b) {
      if (a.venue.rating > b.venue.rating) {
        return -1;
      } else if (a.venue.rating < b.venue.rating) {
        return 1;
      } else {
        return 0;
      }
    });
  });
};

/**
 * Takes an array of coordinates and fetches nearby bars from for
 * @param  {Array} points [[latitude, longitude],...]
 * @return {Promise.<Array>} Array of {@link module:foursquare~get_foursquare_data_for_coord}
 */
var get_foursquare_data_for_array_of_points = function(points) {
  var calls = [];

  points.forEach(function(point) {
    calls.push(get_foursquare_data_for_coord([point[0], point[1]]));
  });

  return Promise.all(calls);
};

module.exports = {
  get_foursquare_data_for_coord: get_foursquare_data_for_coord,
  get_foursquare_data_for_array_of_points: get_foursquare_data_for_array_of_points
};
