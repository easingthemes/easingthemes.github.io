'use strict';
/* global FB, Mustache */
/*jshint camelcase: false */
jQuery(document).ready(function($) {
  var url = {
    query: '*',
    type: 'place',
    center: '44.819997,20.460771',
    distance: '300',
    limit: 99,
    offset: 25,
    accessToken: '605157829620558',
    secret: 'd847b7bcb424768ed2ca42f3e2aee8d1',
    token: '605157829620558|d847b7bcb424768ed2ca42f3e2aee8d1',
    fb: 'https://graph.facebook.com'
  };
  var info = {
		id: '1',
		time: 'time',
		host: 'host',
		title: 'title',
		place: 'place',
		src: 'http://placehold.it/100x100'
	};
  //console.log(url);
  var allEventsArr = [];
  var countResponse = 0;
  var countArr = [];
  var loopsArr = [];
  //var users = 0;
  //var usersArr = [];
  var usersEventArr = [];
  var aaa = {};
  var userEvents = function (userId) {
  	//console.log('userEvents');
  	/*jshint camelcase: false */
		FB.api(
		    '/' + userId + '/events?access_token=' + url.token,
		    function (response) {
		      if (response && !response.error) {
		      	var data = response.data;
		      	if (data.length > 0) {
		      		
		      		//users = data.length;
		      		//usersArr.push(data.length);
		      		//console.log(users);
		      		var usersEventObj = {};
  					
		      		for (var i = 0; i < data.length; i++) {
		      			// usersEventObj = {};

		      			countResponse ++;

		      			usersEventObj.users = data.length;
		      			usersEventObj.id = userId;
		      			usersEventObj.i = i;
		      			usersEventObj.count = countResponse;

		      			usersEventArr.push(usersEventObj);
		      			
		      			events(data[i].id);
		      			
		      		}

		      	}
		      } 
		    }
		);
	};
	
	var events = function (eventId) {
		//get event by event ID
		FB.api(
		    '/' + eventId + '?access_token=' + url.token,
		    function (response) {
		      if (response && !response.error) {
		      	info = {
					id: response.id,
					time: response.start_time,
					host: response.owner.name,
					title: response.name,
					place: response.place
				};
				//createDom(info);
		      	// get event cover by response event ID
		      	FB.api(
				    '/' + info.id + '/picture?access_token=' + url.token,
				    function (img) {
				      if (img && !img.error) {
				      	info.src = img.data.url;
				      	//createDom(info);
				      	allEventsArr.push({'info': info});	

				      	countResponse ++;

				      	countArr.push(countResponse);
		      			aaa.count = countResponse;

		      			jQuery('#fb-loop').trigger('fb:loops', [countArr]);
				      	jQuery('#fb-loop').trigger('fb:events', [aaa]);	  

				      	jQuery('#fb-loop').trigger('log:data', [usersEventArr]);    	
				      }
				    }
				);
		      }
		    }
		);
		
	};

	var allPlaces = {};
	var getPlaces = function () {
	  /*jshint camelcase: false */
	  	FB.api(
		    '/search?q=' + url.query + '&type=' + url.type + '&center=' + url.center + '&distance=' + url.distance + '&limit=' + url.limit + '&offset=' + url.offset + '&access_token=' + url.token,
		    function (response) {
		      if (response && !response.error) {
		      	var data = response.data;
		      	//console.log('Places: ');
		      	//console.log(data);
		      	var allPlacesArr = [];
			    for (var i = 0; i < data.length; i++) {
			    	allPlaces[i] = {
			      		id: data[i].id,
			      		name: data[i].name,
			      		street: data[i].location.street,
			      		located: data[i].location.located_in
			      	};
			      	allPlacesArr.push({'info': allPlaces[i]});
			      	//createPlacesDom(allPlaces[i]);
			    	userEvents(data[i].id);
			    }
			    placesMustache(allPlacesArr);
		      }
		    }
		);	
	};
	var placesMustache = function (all) {
		var view = {
			'places': all
		};
		var placesTemplate = $('#placesTemplate').html();
		Mustache.parse(placesTemplate); 
		var rendered = Mustache.render(placesTemplate, view);
		$('#places').html(rendered);
	};
	var eventsMustache = function (all) {
		var view = {
			'events': all
		};
		var eventsTemplate = $('#eventsTemplate').html();
		Mustache.parse(eventsTemplate); 
		var rendered = Mustache.render(eventsTemplate, view);
		$('#events').html(rendered);
	};
	
	
	$('#fb-root').bind('facebook:init', function () {
		getPlaces();
	});
	var ende = 0;
	var tr = [];
	var logData = function (e, data) {
		tr = [];
		for (var i = 0; i < data.length; i++) {
			var dataId = data[i].id;
			for (var j = i + 1; j < data.length; j++) {
				if (dataId === data[j].id) {
					data.splice(j, 1);
				}
			}
			tr[i] = data[i];
			//sum += data[i].users;
		}
		//console.log(tr);
		jQuery('#fb-loop').trigger('fb:check', [tr]);
		
		//console.log('count: ' + data[data.length - 1].count);

		
	};
	

	var bindLoop = function (e, data) {
		//console.log(data);
		ende = data.length;
	};
	var bindEvents = function (e, data) {
		//console.log(data);
		if (data.count === ende) {
			//console.log('lasttttt');
		}
	};
	var sum = 0;
	var ggg = 0;
	var check = function (e, data) {
		sum = 0;
		ggg = 0;
		//console.log(data);
		for (var k = 0; k < data.length; k++) {
			sum += data[k].users;
		 }
		 ggg = data[data.length - 1].count;
		 console.log('sum: ' + sum);
		 console.log('ggg: ' + ggg);
	};
	$('#fb-loop').bind('fb:check', check);
	$('#fb-loop').bind('fb:events', bindEvents);
	$('#fb-loop').bind('fb:loops', bindLoop);
	$('#fb-loop').bind('log:data', logData);
	// $('#fb-root').bind('fb:loops', bindLoop);
	// $('#fb-root').unbind('fb:loops', bindLoop);
	$('#fb-root').bind('fb:last', function (e, usersArr) {
		//console.log(usersArr);
		var sum = 0;
		for (var i = 0; i < usersArr.length; i++) {
			sum += usersArr[i];
		}
	});
	if (false) {
		console.log(countArr);
		console.log(loopsArr);
		eventsMustache(allEventsArr);
	}
});

        
