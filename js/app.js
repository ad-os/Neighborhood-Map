/*
 *@desc - An IIFE to fetch data from the foursquare's api.
 */
(function loadData() {
	var clientId = 'AQKR5W0CRVB4SPIE5C2XJDJJQH0IS2BWGWS3QJY0CUYL2F1F';
	var clientSecret = 'RYVS3A2URZDDZURSDNOFVXEVQWSECAXXXFFNAB1IAJY2BV0N';
	var url = 'https://api.foursquare.com/v2/venues/search?client_id=' + clientId + '&client_secret=' + clientSecret + '&v=20130815&ll=28.61,77.23&query=donuts'
	$.getJSON(url, function(data) {
		var venues = data.response.venues;
		for (var i = 0; i < venues.length; i++) {
			var venue = venues[i];
			var latLng = {};
			latLng.lat = venue.location.lat;
			latLng.lng = venue.location.lng;
			createMarker(latLng);
		}
	}).error(function(e) {
		alert(e);
	});

}());

/*
 *@desc - A function for creating markers on the map.
 *@params - Object latLng
 */
var createMarker = function(latLng) {
	var marker = new google.maps.Marker({
		map: map,
		position: latLng,
		title: 'Hello World!'
	});
};