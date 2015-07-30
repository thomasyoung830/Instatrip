/**
 * @module foursquare
 */

var Promise = require('bluebird');
var request = require('request-promise');

var keys = require('../config.js');


/**
 * Finds bars within 300m of a coordinate
 * @param  {Array} coords
 * @param {Float} coords.0 Latitude
 * @param {Float} coords.1 Longitude
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
      'categoryId': '4bf58dd8d48988d116941735',
      // 'query': 'bar',
      'section': 'drinks',
      'limit': 15,
      'openNow': 0
    },
    'json': true
  }).then(function(res) {
    var data = res.response.groups[0].items;

    data = data.filter(function(obj) {
      return !(obj.venue.categories[0].id in {
        '4bf58dd8d48988d1d5941735': 'Hotel Bars',
        '4bf58dd8d48988d119941735': 'Hookah Bar'
      });
    });

    var with_ratings = data.filter(function(obj) {
      return obj.venue.rating !== undefined;
    });

    if (with_ratings.length) {
      data = with_ratings.sort(function(a, b) {
        if (a.venue.rating > b.venue.rating) {
          return -1;
        } else if (a.venue.rating < b.venue.rating) {
          return 1;
        } else {
          return 0;
        }
      });
    } else {
      data = data.sort(function(a, b) {
        if (a.venue.stats.checkinscount > b.venue.stats.checkinscount) {
          return 1;
        } else if (a.venue.stats.checkinscount < b.venue.stats.checkinscount) {
          return -1;
        } else {
          return 0;
        }
      });
    }

    return data;
  });
};

/**
 * Takes an array of coordinates and fetches nearby bars from for
 * @param  {Object[]} points
 * @param {Float} points[].lat Latitude
 * @param {Float} points[].lng Longitude
 * @return {Promise.<Array>} Array of {@link module:foursquare~get_foursquare_data_for_coord}
 */
var get_foursquare_data_for_array_of_points = function(points) {
  var calls = [];

  points.forEach(function(point) {
    calls.push(get_foursquare_data_for_coord([point.lat, point.lng]));
  });

  return Promise.all(calls);
};

module.exports = {
  get_foursquare_data_for_coord: get_foursquare_data_for_coord,
  get_foursquare_data_for_array_of_points: get_foursquare_data_for_array_of_points
};
