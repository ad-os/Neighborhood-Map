var markers = []; //An array containing all the markers.

/*
 *@desc - A object containing details for fetching the data from foursquare.
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
var generateDataUrl = function(clientId, clientSecret, latLng, searchInput) {
	var url = 'https://api.foursquare.com/v2/venues/search?client_id=' + clientId + '&client_secret=' + clientSecret + '&v=20130815&ll=' + latLng.lat() + ',' + latLng.lng() + '&query=' + searchInput;
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
	this.markerInfoWindowContent = generateContent(name, address, formattedAddress);
	this.formattedAddress = ko.observable(formattedAddress);
	this.address = ko.observable(address);
	this.imageIndex = ko.observable(imageIndex);
};

/*
 *@desc - A function for creating markers on the map.
 *@params - Object latLng, String name: The name of the venue, String address: The address
 *of the venue, String formattedAddress: Formatted address of the venue.
 */
var createMarker = function(latLng, name, address, formattedAddress) {
	var marker = new google.maps.Marker({
		map: map,
		position: latLng,
		animation: google.maps.Animation.DROP,
		title: name,
		icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
	});
	marker.addListener('click', function() {
		showMarker(marker, generateContent(name, address, formattedAddress));
		animateMarker(marker);
	});
	markers.push(marker);
	return marker;
};

/*
 *@desc - A function to show the infowindow for the marker.
 *@params - Object marker: A marker object, String name: name of the place
 *String address: address of the place, String formattedAddress: formatted
 *address for the place.
 */
var showMarker = function(marker, content) {
	infowindow.setContent(content);
	infowindow.open(map, marker);
}

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
 *@desc - Animates the marker on the screen.
 *@params - Object marker.
 */
var animateMarker = function(marker) {
	if (marker.getAnimation() !== null) {
		marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
		marker.setAnimation(null);
	} else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
		//Stop bouncing markers after 2 seconds.
		setTimeout(function(){
			animateMarker(marker);
		}, 1000);
	}	
}

/*
 *@desc - generates the content for markers.
 *@params - String name: Name of the venue, String address: Address of the venue,
 *String formattedAddress: formatted address of the venue.
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
 *@desc - A ajax request to fetch data from the foursquare.
 *@params - Object self: A instance of viewmodel object, Object latLng: Contains 
 *latitude and longitude for the place, String searchInput: Contains the search text.
 */
var requestAjaxCall = function(self, latLng, searchInput) {
	var url = generateDataUrl(apiDetails.clientId, apiDetails.clientSecret, latLng, searchInput);
	/*
	 *@desc - Ajax request to fetch objects containing image objects from the foursquare
	 */
	$.ajax({
		url: url,
		dataType: 'json',
		timeout: 3000	
	}).done(function(data) {
		var venues = data.response.venues, //Array of returned venues from foursquare.
			venue, //A single venue from array of venues.
			imageUrl,//Contains the image url depending upon the venue.
			formattedAddress,
			address,
			latLng = {},
			latLngObject;
			bounds = new google.maps.LatLngBounds();//This represents a rectangle in geographical coordinates.
		for (var i = 0; i < venues.length; i++) {
			venue = venues[i]; 
			imageUrl = generateImageUrl(apiDetails.clientId, apiDetails.clientSecret, venue.id);
			formattedAddress = venue.location.formattedAddress[0];
			address = venue.location.address;
			latLng.lat = venue.location.lat;//Latitude for the venue
			latLng.lng = venue.location.lng;//Longitude for the venue
			latLngObject = new google.maps.LatLng(latLng.lat, latLng.lng);//It is a point in geographical coordinates.
			bounds.extend(latLngObject);//Extend this area to contain a new latitude and longitude.
			self.placesArray.push(new place(venue.name, latLng, i, formattedAddress, address));
			self.bindImage(imageUrl);//Save the image url for current venue.
		}
		map.fitBounds(bounds);//set the viewport to contain the given points.
	}).fail(function() {
		self.showAndHideErrorDiv(true);
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
		$.ajax({
			url: imageUrl,
			dataType: 'json',
			timeout: 3000			
		}).done(function(data) {
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
		}).fail(function() {
			//If error occurs in requesting the image then use the default image.
			self.imagesArray.push('img/X.png');
		});
	};
}

/*
 *@desc - A function to create a custom icon for map markers.
 */
var createCustomPin = function() {
	var pinColor = '#5233b7';
	var pinImage = new google.maps.MarkerImage("https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
		new google.maps.Size(21, 34),
		new google.maps.Point(0,0),
		new google.maps.Point(10, 34));
	return pinImage;
}

/*
 *@desc - knockout's viewmodel function.
 */
var viewModel = function () {
	var self = this;
	self.placesArray = ko.observableArray();//Array containing Objects which contains information about venues.
	self.imagesArray = ko.observableArray();//Array to store images of the venues.
	self.filter = ko.observable("");//input value by which we want to filter the places array.
	self.showAndHideList = ko.observable(true); //Observable to detect if list is visible of not (Specific to mobile UI) 
	self.buttonText = ko.observable('Hide List ! Show Map !');//Text on the button (Specific to mobile UI)
	self.showAndHideModal = ko.observable(false); //Observable to detect if modal is visible or not.
	self.cityInput = ko.observable(''); //Entered city by the user.
	self.searchInput = ko.observable(''); //Entered search input by the user.
	self.showAndHideErrorDiv = ko.observable(false);//A onservable to check if there is a error.If there is error then show.
	self.flag = ko.observable(1); 
	//The observable is used because a particular set of css classes 
	//is used when the page is first served and after that another css 
	//classes for the map div and the list div.
	
	/*
	 *@desc - A function to get latitude and longitude depending upon search inputs.
	 */
	self.getLatLng = function() {
		if (typeof geocoder !== 'undefined') {
			var address = self.cityInput();
			//If else condition to check whether city was made input or not.
			if (address != '') {
				//If else condition to check whether search item was made input or not.
				if (self.searchInput() != '') {
				//Storing the search input in the browser's memory.
				localStorage.setItem('searchInput', self.searchInput());
				geocoder.geocode( { 'address': address}, function(results, status) {
						var latLng;
						if (status == google.maps.GeocoderStatus.OK) {
							latLng = results[0].geometry.location;
							map.setCenter(latLng);
							self.getQuery(latLng, self.searchInput());
							//Storing the location name in the browser's memory.
							localStorage.setItem('Location', address);
							self.toggleModal();
							self.flag(0);
						} else {
							alert("Geocode was not successful for the following reason: " + status);
						}
					});
				} else {
					alert("Please enter a search item!");
				}
			} else {
				alert("Please enter a city name!");
			}	
		} else {
			self.showAndHideErrorDiv(true);
		}
	};

	/*
	 *@desc - A function to request ajax calls depending upon the latitude and logitude.
	 *@params - Object latLng, String searchInput.
	 */
	self.getQuery = function(latLng, searchInput) {
		self.placesArray().length = 0;//On a new request making the places array as empty.
		self.imagesArray().length = 0;//On a new request making the images array as empty.
		setMapOnAll(null);//removing the all markers from the map.
		markers.length = 0;//On a new request making the markers array as empty.
		requestAjaxCall(self, latLng, searchInput);
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

	/*
	 *@desc - A binding function to show infowindow on mousehover.
	 *@params - Object place: Current place.
	 */
	self.enableMarkerHover = function(venue) {
		showMarker(venue.marker, venue.markerInfoWindowContent);
	};

	self.enableMarkerClick = function(venue) {
		showMarker(venue.marker, venue.markerInfoWindowContent);
		animateMarker(venue.marker);
	};

	/*
	 *@desc - To close the infowindow on mouseout.
	 *@params - Object place: Current place.
	 */
	self.disableMarker = function() {
		infowindow.close();
	};

	/*
	 *@desc - To toggle the display of the list and text of the button 
	 *(Specific to mobile UI).
	 */
	self.toggleListDisplay = function() {
		if (self.showAndHideList()) {
			self.showAndHideList(false);
			self.buttonText('Show list of places !');
		} else {
			self.showAndHideList(true);
			self.buttonText('Hide List ! Show Map !');
		}
	};

	/*
	 *@desc - To toggle the display the inputs.
	 */	
	self.toggleModal = function() {
		if (self.showAndHideModal()) {
			self.showAndHideModal(false);
		} else {
			self.showAndHideModal(true);
		}
	};

	/*
	 *@desc - Load the css for the list of items.
	 */
	self.listCss = ko.pureComputed(function() {
		return self.flag() == 1 ? "listOnFirstAppearance" : "list";		
	})

	/*
	 *@desc - Load the css for the map.
	 */
	self.mapCss = ko.pureComputed(function() {
		return self.flag() == 1 ? "mapOnFirstAppearance" : "mapDiv";		
	})
		
	/*
	 *@desc - Load the function when all the dom, css and scripts have been loaded.
	 */
	window.onload = function() {
		var location = localStorage.getItem('Location'),
			searchInput = localStorage.getItem('searchInput');
		if(typeof geocoder !== 'undefined') { 
			if (location && searchInput) {
				var address = location;
				self.flag(0);
				geocoder.geocode( { 'address': address}, function(results, status) {
						var latLng;
						if (status == google.maps.GeocoderStatus.OK) {
							latLng = results[0].geometry.location;
							map.setCenter(latLng);
							self.getQuery(latLng, searchInput);
						} else {
							alert("Geocode was not successful for the following reason: " + status);
						}
					});
			} else {
				//If no location and search input is found on localstorage then show the model to
				//get input from the user.
				self.toggleModal();
			}
		} else {
			self.showAndHideErrorDiv(true);
		}
	};
};

var vm = new viewModel();
ko.applyBindings(vm);
