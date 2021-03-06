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

/**
 * Takes an array of steps and picks points along the route
 * @param  {Array} leg      Leg from from Google Directions route
 * @param  {Integer} [num_points=4] The number of points to pick
 * @return {Array}            Array of coordinates: {lat, lng}
 */
var choose_points = function(route, num_points) {
  var steps = route.steps;
  var result = [];
  num_points = (num_points === undefined) ? 4 : num_points;

  // Determine the distance between points
  var interval;
  if (route.distance.value < 100) {
    // You're walking across the street just look around
    return [];
  /*} else if (route.distance.value <= 300) {
    num_points = 1;
    interval = 150;*/
  } else {
    interval = route.distance.value / num_points;
  }

  var done = false, i = 0,
    // The distance traveled so far
    running_distance = 0,
    // The last point chosen
    last_stop = 0,
    // The current step of the route
    step = steps[0],
    // The distance traveled along the current step
    step_running_distance = 0;

  while (!done) {
    // Meters until next point
    var distance_until_next_stop = interval - (running_distance - last_stop);

    // check if distance traveled along current step is > the distance until the next point
    if (step.distance.value - step_running_distance > distance_until_next_stop) {
      // Travel up to either the next stop or end of step
      step_running_distance += Math.min(step.distance.value, distance_until_next_stop);
      running_distance += Math.min(step.distance.value, distance_until_next_stop);
    } else {
      // Travel to end of step
      running_distance += step.distance.value - step_running_distance;
      step_running_distance = step.distance.value;
    }

    // Check if distance since last stop is > stop interval
    if (running_distance - last_stop >= interval) {
      // Push really inaccurate coordinates along step
      result.push({
        'lat': step.start_location.lat + (step.end_location.lat - step.start_location.lat) / (step.distance.value / step_running_distance),
        'lng': step.start_location.lng + (step.end_location.lng - step.start_location.lng) / (step.distance.value / step_running_distance)
      });

      last_stop = running_distance;
    }

    // Check if we've traveled along the whole step
    if (step_running_distance >= step.distance.value) {
      // Move on to the next step
      step_running_distance = 0;
      step = steps[++i];
    }

    // Check if we've traveled along the whole route
    if (running_distance >= route.distance.value) {
      done = true;
    }
  }

  return result;
};

module.exports = {
  get_map_route: get_map_route,
  choose_points: choose_points
};
