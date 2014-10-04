function organize(uber_details, alternatives, input) {

	var uber_time = uber_details.estimated_time;
	var uber_distance = uber_details.distance;
	var uber_price = uber_details.price;

	var latitude = alternatives.latitude;
	var longitude = alternatives.longitude;
	var destination = input.destination;

	var bus ='';
	var bike = '';
	var walk = '';
	var car = '';

	if (alternatives.bus != null) {
		bus = {
			"eta": alternatives.bus.eta,
			"price": alternatives.bus.price,
			"distance": alternatives.bus.distance
		};
	}

	if (alternatives.bike != null) {
		bike = {
			"eta": alternatives.bike.eta,
			"price": "Free",
			"distance": alternatives.bike.distance
		};
	}

	if (alternatives.walk != null) {
		walk = {
			"eta": alternatives.walk.eta,
			"price": "Free",
			"distance": alternatives.walk.distance
		};
	}

	if (alternatives.car != null) {
		car = {
			"eta": alternatives.car.eta,
			"price": alternatives.car.price,
			"distance": alternatives.car.distance
		};
	}

	var final = {
		"uber": {
			"time": uber_time,
			"distance": uber_distance,
			"price": uber_price
		},
		"bus": bus,
		"bike": bike,
		"walk": walk,
		"car": car,
		"locations": {
			"latitude": latitude,
			"longitude": longitude,
			"destination": destination
		}
	};
	console.log(final);
	return final;
}