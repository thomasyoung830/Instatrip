/**
 * @module maps
 */

var request = require('request-promise');

var keys = require('../config.js');

/**
 * Returns a walking route between two points
 * @param  {String} start Address or latitude,longitude
 * @param  {String} end   Address or latitude,longitude
 * @return {Promise.<Object>}
 */
var get_map_route = function(start, end) {
  return request({
    'uri': 'https://maps.googleapis.com/maps/api/directions/json',
    'qs': {
      'key': keys.MAPS_KEY,
      'origin': start,
      'destination': end,
      'mode': 'walking',
      'units': 'metric'
    },
    'json': true
  });
};

var choose_points = function(steps, num_points) {
  var result = [];
  num_points = (num_points === undefined) ? 4 : num_points;

  var interval = Math.floor(steps.length / num_points);

  for(var i = 0; i < steps.length; i += interval) {
    result.push(steps[i]);
  }

  return result;
};

module.exports = {
  get_map_route: get_map_route,
  choose_points: choose_points
};
