function call_uber(obj) {
	//uber://?action=setPickup&pickup=my_location
	var url = 'uber://?action=setPickup&pickup=my_location&'
	url += 'dropoff[latitude]='+obj.locations.latitude+'&';
	url += 'dropoff[longitude]='+obj.locations.longitude+'&';
	url += 'product_id=b5e74e96-5d27-4caf-83e9-54c030cd6ac5&';
	return url;
}