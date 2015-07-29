var foursquare = require('../api/foursquare');
var instagram = require('../api/instagram');
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

    var fourSquareData = data.map(function(venues) {
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
          'foursquare_v2_id': venues[i].venue.id,
          'photos': [
            { link: 'https://instagram.com/p/5uoFVfN9xh/',
              url: 'https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-15/s320x320/e15/11809852_137180456617768_1627430799_n.jpg' },
            { link: 'https://instagram.com/p/5uoDL6kCVb/',
              url: 'https://scontent.cdninstagram.com/hphotos-xpf1/t51.2885-15/s320x320/e15/928946_398269340382704_315341502_n.jpg' },
            { link: 'https://instagram.com/p/5unnuSA1Ai/',
              url: 'https://scontent.cdninstagram.com/hphotos-xpa1/t51.2885-15/s320x320/e15/10865063_466824333478777_1230052009_n.jpg' },
            { link: 'https://instagram.com/p/5um7LlRbWr/',
              url: 'https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-15/s320x320/e15/11336101_1623174457920779_1572703034_n.jpg' },
            { link: 'https://instagram.com/p/5ul9KSoSK3/',
              url: 'https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-15/s320x320/e15/11375287_880514808684017_240670553_n.jpg' },
            { link: 'https://instagram.com/p/5ultsCH90S/',
              url: 'https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-15/s320x320/e15/11266551_512472918903633_1521820963_n.jpg' },
            { link: 'https://instagram.com/p/5ulY4-p-Cq/',
              url: 'https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-15/s320x320/e15/11373769_1664323307132756_1097971158_n.jpg' },
            { link: 'https://instagram.com/p/5ulM-kG4Oq/',
              url: 'https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-15/s320x320/e15/11282233_1452692725037592_2091276722_n.jpg' },
            { link: 'https://instagram.com/p/5ukWqQFX-5/',
              url: 'https://scontent.cdninstagram.com/hphotos-xfa1/t51.2885-15/s320x320/e15/11248280_968981319789237_145565046_n.jpg' },
            { link: 'https://instagram.com/p/5ukWFGsnkc/',
              url: 'https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-15/s320x320/e15/11312562_1674648239433201_1005720620_n.jpg' },
            { link: 'https://instagram.com/p/5ukBDFI15Q/',
              url: 'https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-15/s320x320/e15/11351520_859924130750317_665697047_n.jpg' },
            { link: 'https://instagram.com/p/5ujuwWw7iW/',
              url: 'https://scontent.cdninstagram.com/hphotos-xfp1/t51.2885-15/s320x320/e15/1742479_471389379700990_1554007366_n.jpg' },
            { link: 'https://instagram.com/p/5ujk7pxHrU/',
              url: 'https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-15/s320x320/e15/11330779_1620877878188825_577139349_n.jpg' },
            { link: 'https://instagram.com/p/5ujIcnDiEZ/',
              url: 'https://scontent.cdninstagram.com/hphotos-xfa1/t51.2885-15/s320x320/e15/11375774_1626250527643012_487921531_n.jpg' },
            { link: 'https://instagram.com/p/5uixRFSTA-/',
              url: 'https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-15/s320x320/e15/11356831_1586834384912708_437502874_n.jpg' },
            { link: 'https://instagram.com/p/5uiSNktCNE/',
              url: 'https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-15/s320x320/e15/11325169_1454392928197631_1429749195_n.jpg' },
            { link: 'https://instagram.com/p/5uiRCXhV4b/',
              url: 'https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-15/s320x320/e15/11809641_1037434206268869_1765978927_n.jpg' },
            { link: 'https://instagram.com/p/5uhUNVSox3/',
              url: 'https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-15/s320x320/e15/11424684_1608231596098441_752375171_n.jpg' },
            { link: 'https://instagram.com/p/5uhCkvwmh0/',
              url: 'https://scontent.cdninstagram.com/hphotos-xfa1/t51.2885-15/s320x320/e15/11313770_696726197127759_58612003_n.jpg' },
            { link: 'https://instagram.com/p/5ug-zfriXY/',
              url: 'https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-15/s320x320/e15/11330779_940852199306130_1050641706_n.jpg' }
          ]
        };
      }
    });
    console.log("data from 4square", fourSquareData);
    return fourSquareData;

  }).then(function(data){
    console.log('right before calling instagram with: ', data);
    // // test-data
    // data = [ { name: 'Justice Urban Tavern',
    // coordinates: { lat: 34.05124604421524, lng: -118.2423198223114 },
    // address: '120 S Los Angeles St (1st St.) Los Angeles, CA 90012 United States',
    // foursquare_v2_id: '447bf8f1f964a520ec331fe3' }];
    instagram.obtainInstaData(data).then(function(resData){
      console.log('before sending response Data: ', resData);
      res.json(resData);
    });
  });
});

module.exports = router;
