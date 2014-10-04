function make_json(data) {

	var final = {};
	for (var i = 0; i < data.length; i++) {
		if (data[i] != null) final[data[i].type] = data[i];
	}
	return final;
}