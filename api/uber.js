var keys = require('../config.js');

function Products(uber) {
  this._uber = uber;
  this.path = 'products';
};

module.exports = Products;

//get products based on location
var get_products = function (lat, lng) {
	
 "description": "The low-cost Uber",
       "price_details": {
          "distance_unit": "mile",
          "cost_per_minute": 0.26,
          "service_fees": [
             {
                "fee": 1.0,
                "name": "Safe Rides Fee"
             }
          ],
          "minimum": 5.0,
          "cost_per_distance": 1.3,
          "base": 2.2,
          "cancellation_fee": 5.0,
          "currency_code": "USD"
       },
       "image": "http://d1a3f4spazzrp4.cloudfront.net/car.jpg",
       "display_name": "uberX",
       "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d"

  };


//get price based on location
var get_price = function(start_lat, start_lng, end_lat, end_lng) {
	return request({
		'uri': "https://sandbox-api.uber.com/v1",
		"prices": {
      "product_id": "08f17084-23fd-4103-aa3e-9b660223934b",
      "currency_code": "USD",
      "display_name": "UberBLACK",
      "estimate": "$23-29",
      "low_estimate": 23,
      "high_estimate": 29,
      "surge_multiplier": 1,
      "duration": 640,
      "distance": 5.34
    }
  })
};

var get_time_estimate = function(query, callback) {
	if (!query.start_latitude && !query.start_longitude) {
    return callback(new Error('Invalid parameters'));
  }
  
  return this._uber.get({ url: this.path + '/time', params: query }, callback);
};

module.exports {
	get_products: get_products,
	get_price: get_price,
	get_time_estimate: get_time_estimate
}