var foursquare = require('../api/foursquare');
var maps = require('../api/maps');
var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
  var start = req.body.start;
  var end = req.body.end;

  if (!start || !end) {
    res.status(400).send();
  }

  maps.get_map_route(start, end).then(function(route) {
    var leg = route.routes[0].legs[0];
    var points = maps.choose_points(leg);

    return foursquare.get_foursquare_data_for_array_of_points(points);
  }).then(function(data) {
    var venue_ids = {};

    var results = data.map(function(venues) {
      for(var i = 0; i < venues.length; i++) {
        if (venue_ids[venues[i].venue.id]) {
          continue;
        }

        venue_ids[venues[i].venue.id] = true;

        return {
          'name': venues[i].venue.name,
          'coordinates': {
            'lat': venues[i].venue.location.lat,
            'lng': venues[i].venue.location.lng
          },
          'address': venues[i].venue.location.formattedAddress.join(' '),
          'foursquare_v2_id': venues[i].venue.id
        };
      }
    });

    res.json(results);
  });
});

module.exports = router;
