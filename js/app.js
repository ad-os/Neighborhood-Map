var markers = [];
var createMarker;
/*
 *@desc - A object containig details for fetching the data from foursquare.
 */
var apiDetails = {
	clientId: 'AQKR5W0CRVB4SPIE5C2XJDJJQH0IS2BWGWS3QJY0CUYL2F1F',
	clientSecret: 'RYVS3A2URZDDZURSDNOFVXEVQWSECAXXXFFNAB1IAJY2BV0N'
};

/*
 *@desc - A function that returns url to fetch data from foursquare.
 *@params - String cliendId, String clientSecret
 *@returns - String url
 */
var generateDataUrl = function(clientId, clientSecret) {
	var url = 'https://api.foursquare.com/v2/venues/search?client_id=' + clientId + '&client_secret=' + clientSecret + '&v=20130815&ll=28.61,77.23&query=donuts';
	return url;
};

/*
 *@desc - A function that returns url to fetch images from foursquare.
 *@params - String cliendId, String clientSecret, String venueId
 *@returns - String url
 */
var generateImageUrl = function(clientId, clientSecret, venueId) {
	var url = 'https://api.foursquare.com/v2/venues/' + venueId + '/photos?client_id=' + clientId + '&client_secret=' + clientSecret + '&v=20130815';
	return url;
};

/*
 *@desc - Create a new place object.
 *@params - String name: name of venue, Object latLng: object containing latitude and logitude, 
 *int index: this is index for image, String formattedAddress: complete address for the venue,
 *String address: address for the venue.
 */
var place = function(name, latLng, imageIndex, formattedAddress, address) {
	this.name = ko.observable(name);
	this.marker = createMarker(latLng, name, address, formattedAddress);
	this.formattedAddress = ko.observable(formattedAddress);
	this.address = ko.observable(address);
	this.imageIndex = ko.observable(imageIndex);
};

/*
 *@desc - A function for creating markers on the map.
 *@params - Object latLng
 */
var createMarker = function(latLng, name, address, formattedAddress) {
	var marker = new google.maps.Marker({
		map: map,
		position: latLng,
		animation: google.maps.Animation.DROP,
		title: name
	});
	var infowindow = new google.maps.InfoWindow({
		content: generateContent(name, address, formattedAddress),
		width: 400
	});
	var toggleBounce =function() {
		if (marker.getAnimation() !== null) {
			marker.setAnimation(null);
		} else {
			marker.setAnimation(google.maps.Animation.BOUNCE);
			//Stop bouncing markers after 2 seconds.
			setTimeout(function(){
				toggleBounce();
			}, 2000);
		}
	}
	marker.addListener('click', function() {
		infowindow.open(map, marker);
	});
	marker.addListener('click', toggleBounce);
	markers.push(marker);
	return marker;
};

/*
 *@desc - Sets all the markers on the map
 *@params - google.maps.map Object 
 */
var setMapOnAll = function(map) {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
	}
};

/*
 *@desc - generates the content for markers.
 */
var generateContent = function(name, address, formattedAddress) {
	var headerDiv = '<div class="markerHeader">' + name + '</div>',
		imageDiv = '<img class="placeHolder" src="img/placeholder.png" />',
		addressDiv = '<div class="markerText">' + address + '</div>',
		content;
	if (address !== undefined) {
		content = '<section class="markerContent">' + imageDiv + headerDiv + addressDiv;
	} else {
		addressDiv = '<div class="markerText">' + formattedAddress + '</div>',
		content = '<section class="markerContent">' + imageDiv + headerDiv + addressDiv;
	}
	return content;
}

/*
 *@desc - knockout's viewmodel function.
 */
 var viewModel = function () {
 	var self = this;
 	self.url = generateDataUrl(apiDetails.clientId, apiDetails.clientSecret);
 	self.placesArray = ko.observableArray();//Array containing Objects which contains information about venues.
 	self.imagesArray = ko.observableArray();//Array to store images of the venues.
 	self.filter = ko.observable("");//input value by which we want to filter the places array.
 	/*
 	 *@desc - Ajax request to fetch objects containing image objects from the foursquare
 	 */
 	$.getJSON(self.url, function(data) {
		var venues = data.response.venues, //Array of returned venues from foursquare.
			venue, //A single venue from array of venues.
			imageUrl,//Contains the image url depending upon the venue.
			formattedAddress,
			address,
			latLng = {};
		for (var i = 0; i < venues.length; i++) {
			venue = venues[i]; 
			imageUrl = generateImageUrl(apiDetails.clientId, apiDetails.clientSecret, venue.id);
			formattedAddress = venue.location.formattedAddress[0];
			address = venue.location.address;
			latLng.lat = venue.location.lat;//Latitude for the venue
			latLng.lng = venue.location.lng;//Logitude for the venue
			self.placesArray.push(new place(venue.name, latLng, i, formattedAddress, address));
			self.bindImage(imageUrl);//Save the image url for current venue.
		}
	});
 	/*
 	 *@desc - Binds image correspoding to each venue.
 	 *@params - String imageUrl : To make ajax request to get image.
 	 */
	self.bindImage = function(imageUrl) {
		var prefix,
			size,
			suffix,
			finalImageUrl,
			venueImages,
			venueImage,
			venueImageCount;
		$.getJSON(imageUrl, function(data) {
			venueImages = data.response.photos.items,
			venueImage = venueImages[0],
			venueImageCount = data.response.photos.count;
			if (venueImageCount) {
				prefix = venueImage.prefix;
				size = '128x128';
				suffix = venueImage.suffix;
				finalImageUrl = prefix + size + suffix;
			} else {
				finalImageUrl = 'img/X.png';
			}
			self.imagesArray.push(finalImageUrl);
		});
	};
	/*
	 *@desc - Computing the filteredArray based on value in the filter variable.
	 */
	self.filteredItems = ko.computed(function() {
		var filter = self.filter().toLowerCase();
		if (!filter) {
			setMapOnAll(map);
			return self.placesArray();
		} else {
			return ko.utils.arrayFilter(self.placesArray(), function(place) {
				var index = place.name().toLowerCase().indexOf(filter);
				if (index != -1) {
					place.marker.setMap(map);
					return 1;
				} else {
					place.marker.setMap(null);
				}
			});
		}
	}, self);
};

ko.applyBindings(new viewModel());