'use strict';
/* global FB */
/*jshint camelcase: false */
var templates = require('./templates'),
	triggers = require('./triggers');

var vars = {
	url: {
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
	},
	info: {
		id: '1',
		time: 'time',
		host: 'host',
		title: 'title',
		place: 'place',
		src: 'http://placehold.it/100x100'
	},
	loopCounter: 0,
	allEventsArr: [],
	countResponse: 0,
	countArr: [],
	loopsArr: [],
	usersEventArr: [],
	aaa: {},
	allPlaces: {}
};
function countLoops(data) {
	vars.loopCounter = vars.loopCounter + data;
	jQuery('#fb-loop').trigger('loops:counter', ['loopCounter', vars.loopCounter]);
}
function triggerLogData(name, data) {
	jQuery('#fb-loop').trigger('log:data', [name, data]);
}
function triggerLogString(name, data) {
	jQuery('#fb-loop').trigger('log:string', [name, data]);
}
var	eventzz = {
	init: function () {
		triggers.init();
		$('#fb-root').bind('facebook:init', function () {
			eventzz.getPlaces();
		});
	},
	getPlaces: function () {
		FB.api(
			'/search?q=' + vars.url.query + '&type=' + vars.url.type + '&center=' + vars.url.center + '&distance=' + vars.url.distance + '&limit=' + vars.url.limit + '&offset=' + vars.url.offset + '&access_token=' + vars.url.token,
			function (response) {
				if (response && !response.error) {
					var data = response.data;
					var allPlacesArr = [];
					countLoops(data.length);
					for (var i = 0; i < data.length; i++) {
						vars.allPlaces[i] = {
							id: data[i].id,
							name: data[i].name,
							street: data[i].location.street,
							located: data[i].location.located_in
						};
						allPlacesArr.push({'info': vars.allPlaces[i]});
						//createPlacesDom(allPlaces[i]);
						eventzz.userEvents(data[i].id);
					}
					console.log(data);
					triggerLogString('places', allPlacesArr.length);
					templates.placesMustache(allPlacesArr);
				}
			}
		);	
	},
	userEvents: function (userId) {
		FB.api(
			'/' + userId + '/events?access_token=' + vars.url.token,
			function (response) {
				if (response && !response.error) {
					var data = response.data;
					if (data.length > 0) {
						var usersEventObj = {};
						countLoops(data.length);
						triggerLogData('events', data);
						for (var i = 0; i < data.length; i++) {

							vars.countResponse ++;

							usersEventObj.users = data.length;
							usersEventObj.id = userId;
							usersEventObj.i = i;
							usersEventObj.count = vars.countResponse;

							vars.usersEventArr.push(usersEventObj);
							
							eventzz.events(data[i].id);
						}
					}
				} 
			}
		);
	},
	events: function (eventId) {
		//get event by event ID
		FB.api(
			'/' + eventId + '?access_token=' + vars.url.token,
			function (response) {
				if (response && !response.error) {
					vars.info = {
						id: response.id,
						time: response.start_time,
						host: response.owner.name,
						title: response.name,
						place: response.place
					};
					//createDom(info);
					// get event cover by response event ID
					FB.api(
						'/' + vars.info.id + '/picture?access_token=' + vars.url.token,
						function (img) {
							if (img && !img.error) {
								vars.info.src = img.data.url;
								//createDom(info);
								vars.allEventsArr.push({'info': vars.info});	

								vars.countResponse ++;

								vars.countArr.push(vars.countResponse);
								vars.aaa.count = vars.countResponse;

								jQuery('#fb-loop').trigger('fb:loops', [vars.countArr]);
								jQuery('#fb-loop').trigger('fb:events', [vars.aaa]);	  

								jQuery('#fb-loop').trigger('log:data', ['usersEventArr', vars.usersEventArr]);    	
							}
						}
					);
				}
			}
		);
	}
};

jQuery(document).ready(function() {
	eventzz.init();
});

