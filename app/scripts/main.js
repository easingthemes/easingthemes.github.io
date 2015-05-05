(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/limafil/projects2/githubpage/app/scripts/app.js":[function(require,module,exports){
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


},{"./templates":"/home/limafil/projects2/githubpage/app/scripts/templates.js","./triggers":"/home/limafil/projects2/githubpage/app/scripts/triggers.js"}],"/home/limafil/projects2/githubpage/app/scripts/templates.js":[function(require,module,exports){
'use strict';
/* global Mustache */
/*jshint camelcase: false */

var	templates = {
	placesMustache: function (all) {
		var view = {
			'places': all
		};
		var placesTemplate = $('#placesTemplate').html();
		Mustache.parse(placesTemplate); 
		var rendered = Mustache.render(placesTemplate, view);
		$('#places').html(rendered);
	},
	eventsMustache: function (all) {
		var view = {
			'events': all
		};
		var eventsTemplate = $('#eventsTemplate').html();
		Mustache.parse(eventsTemplate); 
		var rendered = Mustache.render(eventsTemplate, view);
		$('#events').html(rendered);
	}
};
module.exports = templates;
},{}],"/home/limafil/projects2/githubpage/app/scripts/triggers.js":[function(require,module,exports){
'use strict';
/*jshint camelcase: false */

var vars = {
	ende: 0,
	tr: [],
	sum: 0,
	ggg: 0
};
// function logData2(e, data) {
// 	vars.tr = [];
// 	for (var i = 0; i < data.length; i++) {
// 		var dataId = data[i].id;
// 		for (var j = i + 1; j < data.length; j++) {
// 			if (dataId === data[j].id) {
// 				data.splice(j, 1);
// 			}
// 		}
// 		vars.tr[i] = data[i];
// 		//sum += data[i].users;
// 	}
// 	jQuery('#fb-loop').trigger('fb:check', [vars.tr]);
// }
function logData (e, name, data) {
	console.log(name + ' start: ---------');
	console.log(data);
	console.log(name + ' end: -----------');
}
function logString (e, name, data) {
	console.log(name + ' : ' + data);
}
// function bindLoop (e, data) {
// 	//ende = data.length;
// 	console.log(data);
// }
// function bindEvents (e, data) {
// 	// if (data.count === ende) {
// 		console.log(data);
// 	// }
// }
function check (e, data) {
	vars.sum = 0;
	vars.ggg = 0;
	for (var k = 0; k < data.length; k++) {
		vars.sum += data[k].users;
	}
	vars.ggg = data[data.length - 1].count;
	// console.log('sum: ' + 'vars.sum');
	// console.log('ggg: ' + 'vars.ggg');
}

var triggers = {
	init: function () {
		this.bind();
	},
	bind: function () {
		$('#fb-loop').bind('fb:check', check);
		//$('#fb-loop').bind('fb:events', bindEvents);
		//$('#fb-loop').bind('fb:loops', bindLoop);
		$('#fb-loop').bind('log:data', logData);
		$('#fb-loop').bind('log:string', logString);
		$('#fb-loop').bind('loops:counter', logString);

		$('#fb-root').bind('fb:last', function (e, usersArr) {
			var sum = 0;
			for (var i = 0; i < usersArr.length; i++) {
				sum += usersArr[i];
			}
		});
	}
};   
module.exports = triggers;
},{}]},{},["/home/limafil/projects2/githubpage/app/scripts/app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9hcHAuanMiLCJhcHAvc2NyaXB0cy90ZW1wbGF0ZXMuanMiLCJhcHAvc2NyaXB0cy90cmlnZ2Vycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgRkIgKi9cbi8qanNoaW50IGNhbWVsY2FzZTogZmFsc2UgKi9cbnZhciB0ZW1wbGF0ZXMgPSByZXF1aXJlKCcuL3RlbXBsYXRlcycpLFxuXHR0cmlnZ2VycyA9IHJlcXVpcmUoJy4vdHJpZ2dlcnMnKTtcblxudmFyIHZhcnMgPSB7XG5cdHVybDoge1xuXHRcdHF1ZXJ5OiAnKicsXG5cdFx0dHlwZTogJ3BsYWNlJyxcblx0XHRjZW50ZXI6ICc0NC44MTk5OTcsMjAuNDYwNzcxJyxcblx0XHRkaXN0YW5jZTogJzMwMCcsXG5cdFx0bGltaXQ6IDk5LFxuXHRcdG9mZnNldDogMjUsXG5cdFx0YWNjZXNzVG9rZW46ICc2MDUxNTc4Mjk2MjA1NTgnLFxuXHRcdHNlY3JldDogJ2Q4NDdiN2JjYjQyNDc2OGVkMmNhNDJmM2UyYWVlOGQxJyxcblx0XHR0b2tlbjogJzYwNTE1NzgyOTYyMDU1OHxkODQ3YjdiY2I0MjQ3NjhlZDJjYTQyZjNlMmFlZThkMScsXG5cdFx0ZmI6ICdodHRwczovL2dyYXBoLmZhY2Vib29rLmNvbSdcblx0fSxcblx0aW5mbzoge1xuXHRcdGlkOiAnMScsXG5cdFx0dGltZTogJ3RpbWUnLFxuXHRcdGhvc3Q6ICdob3N0Jyxcblx0XHR0aXRsZTogJ3RpdGxlJyxcblx0XHRwbGFjZTogJ3BsYWNlJyxcblx0XHRzcmM6ICdodHRwOi8vcGxhY2Vob2xkLml0LzEwMHgxMDAnXG5cdH0sXG5cdGxvb3BDb3VudGVyOiAwLFxuXHRhbGxFdmVudHNBcnI6IFtdLFxuXHRjb3VudFJlc3BvbnNlOiAwLFxuXHRjb3VudEFycjogW10sXG5cdGxvb3BzQXJyOiBbXSxcblx0dXNlcnNFdmVudEFycjogW10sXG5cdGFhYToge30sXG5cdGFsbFBsYWNlczoge31cbn07XG5mdW5jdGlvbiBjb3VudExvb3BzKGRhdGEpIHtcblx0dmFycy5sb29wQ291bnRlciA9IHZhcnMubG9vcENvdW50ZXIgKyBkYXRhO1xuXHRqUXVlcnkoJyNmYi1sb29wJykudHJpZ2dlcignbG9vcHM6Y291bnRlcicsIFsnbG9vcENvdW50ZXInLCB2YXJzLmxvb3BDb3VudGVyXSk7XG59XG5mdW5jdGlvbiB0cmlnZ2VyTG9nRGF0YShuYW1lLCBkYXRhKSB7XG5cdGpRdWVyeSgnI2ZiLWxvb3AnKS50cmlnZ2VyKCdsb2c6ZGF0YScsIFtuYW1lLCBkYXRhXSk7XG59XG5mdW5jdGlvbiB0cmlnZ2VyTG9nU3RyaW5nKG5hbWUsIGRhdGEpIHtcblx0alF1ZXJ5KCcjZmItbG9vcCcpLnRyaWdnZXIoJ2xvZzpzdHJpbmcnLCBbbmFtZSwgZGF0YV0pO1xufVxudmFyXHRldmVudHp6ID0ge1xuXHRpbml0OiBmdW5jdGlvbiAoKSB7XG5cdFx0dHJpZ2dlcnMuaW5pdCgpO1xuXHRcdCQoJyNmYi1yb290JykuYmluZCgnZmFjZWJvb2s6aW5pdCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdGV2ZW50enouZ2V0UGxhY2VzKCk7XG5cdFx0fSk7XG5cdH0sXG5cdGdldFBsYWNlczogZnVuY3Rpb24gKCkge1xuXHRcdEZCLmFwaShcblx0XHRcdCcvc2VhcmNoP3E9JyArIHZhcnMudXJsLnF1ZXJ5ICsgJyZ0eXBlPScgKyB2YXJzLnVybC50eXBlICsgJyZjZW50ZXI9JyArIHZhcnMudXJsLmNlbnRlciArICcmZGlzdGFuY2U9JyArIHZhcnMudXJsLmRpc3RhbmNlICsgJyZsaW1pdD0nICsgdmFycy51cmwubGltaXQgKyAnJm9mZnNldD0nICsgdmFycy51cmwub2Zmc2V0ICsgJyZhY2Nlc3NfdG9rZW49JyArIHZhcnMudXJsLnRva2VuLFxuXHRcdFx0ZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGlmIChyZXNwb25zZSAmJiAhcmVzcG9uc2UuZXJyb3IpIHtcblx0XHRcdFx0XHR2YXIgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRcdFx0dmFyIGFsbFBsYWNlc0FyciA9IFtdO1xuXHRcdFx0XHRcdGNvdW50TG9vcHMoZGF0YS5sZW5ndGgpO1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0dmFycy5hbGxQbGFjZXNbaV0gPSB7XG5cdFx0XHRcdFx0XHRcdGlkOiBkYXRhW2ldLmlkLFxuXHRcdFx0XHRcdFx0XHRuYW1lOiBkYXRhW2ldLm5hbWUsXG5cdFx0XHRcdFx0XHRcdHN0cmVldDogZGF0YVtpXS5sb2NhdGlvbi5zdHJlZXQsXG5cdFx0XHRcdFx0XHRcdGxvY2F0ZWQ6IGRhdGFbaV0ubG9jYXRpb24ubG9jYXRlZF9pblxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGFsbFBsYWNlc0Fyci5wdXNoKHsnaW5mbyc6IHZhcnMuYWxsUGxhY2VzW2ldfSk7XG5cdFx0XHRcdFx0XHQvL2NyZWF0ZVBsYWNlc0RvbShhbGxQbGFjZXNbaV0pO1xuXHRcdFx0XHRcdFx0ZXZlbnR6ei51c2VyRXZlbnRzKGRhdGFbaV0uaWQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRcdFx0XHR0cmlnZ2VyTG9nU3RyaW5nKCdwbGFjZXMnLCBhbGxQbGFjZXNBcnIubGVuZ3RoKTtcblx0XHRcdFx0XHR0ZW1wbGF0ZXMucGxhY2VzTXVzdGFjaGUoYWxsUGxhY2VzQXJyKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdCk7XHRcblx0fSxcblx0dXNlckV2ZW50czogZnVuY3Rpb24gKHVzZXJJZCkge1xuXHRcdEZCLmFwaShcblx0XHRcdCcvJyArIHVzZXJJZCArICcvZXZlbnRzP2FjY2Vzc190b2tlbj0nICsgdmFycy51cmwudG9rZW4sXG5cdFx0XHRmdW5jdGlvbiAocmVzcG9uc2UpIHtcblx0XHRcdFx0aWYgKHJlc3BvbnNlICYmICFyZXNwb25zZS5lcnJvcikge1xuXHRcdFx0XHRcdHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcblx0XHRcdFx0XHRpZiAoZGF0YS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHR2YXIgdXNlcnNFdmVudE9iaiA9IHt9O1xuXHRcdFx0XHRcdFx0Y291bnRMb29wcyhkYXRhLmxlbmd0aCk7XG5cdFx0XHRcdFx0XHR0cmlnZ2VyTG9nRGF0YSgnZXZlbnRzJywgZGF0YSk7XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcblxuXHRcdFx0XHRcdFx0XHR2YXJzLmNvdW50UmVzcG9uc2UgKys7XG5cblx0XHRcdFx0XHRcdFx0dXNlcnNFdmVudE9iai51c2VycyA9IGRhdGEubGVuZ3RoO1xuXHRcdFx0XHRcdFx0XHR1c2Vyc0V2ZW50T2JqLmlkID0gdXNlcklkO1xuXHRcdFx0XHRcdFx0XHR1c2Vyc0V2ZW50T2JqLmkgPSBpO1xuXHRcdFx0XHRcdFx0XHR1c2Vyc0V2ZW50T2JqLmNvdW50ID0gdmFycy5jb3VudFJlc3BvbnNlO1xuXG5cdFx0XHRcdFx0XHRcdHZhcnMudXNlcnNFdmVudEFyci5wdXNoKHVzZXJzRXZlbnRPYmopO1xuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0ZXZlbnR6ei5ldmVudHMoZGF0YVtpXS5pZCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IFxuXHRcdFx0fVxuXHRcdCk7XG5cdH0sXG5cdGV2ZW50czogZnVuY3Rpb24gKGV2ZW50SWQpIHtcblx0XHQvL2dldCBldmVudCBieSBldmVudCBJRFxuXHRcdEZCLmFwaShcblx0XHRcdCcvJyArIGV2ZW50SWQgKyAnP2FjY2Vzc190b2tlbj0nICsgdmFycy51cmwudG9rZW4sXG5cdFx0XHRmdW5jdGlvbiAocmVzcG9uc2UpIHtcblx0XHRcdFx0aWYgKHJlc3BvbnNlICYmICFyZXNwb25zZS5lcnJvcikge1xuXHRcdFx0XHRcdHZhcnMuaW5mbyA9IHtcblx0XHRcdFx0XHRcdGlkOiByZXNwb25zZS5pZCxcblx0XHRcdFx0XHRcdHRpbWU6IHJlc3BvbnNlLnN0YXJ0X3RpbWUsXG5cdFx0XHRcdFx0XHRob3N0OiByZXNwb25zZS5vd25lci5uYW1lLFxuXHRcdFx0XHRcdFx0dGl0bGU6IHJlc3BvbnNlLm5hbWUsXG5cdFx0XHRcdFx0XHRwbGFjZTogcmVzcG9uc2UucGxhY2Vcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdC8vY3JlYXRlRG9tKGluZm8pO1xuXHRcdFx0XHRcdC8vIGdldCBldmVudCBjb3ZlciBieSByZXNwb25zZSBldmVudCBJRFxuXHRcdFx0XHRcdEZCLmFwaShcblx0XHRcdFx0XHRcdCcvJyArIHZhcnMuaW5mby5pZCArICcvcGljdHVyZT9hY2Nlc3NfdG9rZW49JyArIHZhcnMudXJsLnRva2VuLFxuXHRcdFx0XHRcdFx0ZnVuY3Rpb24gKGltZykge1xuXHRcdFx0XHRcdFx0XHRpZiAoaW1nICYmICFpbWcuZXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0XHR2YXJzLmluZm8uc3JjID0gaW1nLmRhdGEudXJsO1xuXHRcdFx0XHRcdFx0XHRcdC8vY3JlYXRlRG9tKGluZm8pO1xuXHRcdFx0XHRcdFx0XHRcdHZhcnMuYWxsRXZlbnRzQXJyLnB1c2goeydpbmZvJzogdmFycy5pbmZvfSk7XHRcblxuXHRcdFx0XHRcdFx0XHRcdHZhcnMuY291bnRSZXNwb25zZSArKztcblxuXHRcdFx0XHRcdFx0XHRcdHZhcnMuY291bnRBcnIucHVzaCh2YXJzLmNvdW50UmVzcG9uc2UpO1xuXHRcdFx0XHRcdFx0XHRcdHZhcnMuYWFhLmNvdW50ID0gdmFycy5jb3VudFJlc3BvbnNlO1xuXG5cdFx0XHRcdFx0XHRcdFx0alF1ZXJ5KCcjZmItbG9vcCcpLnRyaWdnZXIoJ2ZiOmxvb3BzJywgW3ZhcnMuY291bnRBcnJdKTtcblx0XHRcdFx0XHRcdFx0XHRqUXVlcnkoJyNmYi1sb29wJykudHJpZ2dlcignZmI6ZXZlbnRzJywgW3ZhcnMuYWFhXSk7XHQgIFxuXG5cdFx0XHRcdFx0XHRcdFx0alF1ZXJ5KCcjZmItbG9vcCcpLnRyaWdnZXIoJ2xvZzpkYXRhJywgWyd1c2Vyc0V2ZW50QXJyJywgdmFycy51c2Vyc0V2ZW50QXJyXSk7ICAgIFx0XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0KTtcblx0fVxufTtcblxualF1ZXJ5KGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblx0ZXZlbnR6ei5pbml0KCk7XG59KTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIE11c3RhY2hlICovXG4vKmpzaGludCBjYW1lbGNhc2U6IGZhbHNlICovXG5cbnZhclx0dGVtcGxhdGVzID0ge1xuXHRwbGFjZXNNdXN0YWNoZTogZnVuY3Rpb24gKGFsbCkge1xuXHRcdHZhciB2aWV3ID0ge1xuXHRcdFx0J3BsYWNlcyc6IGFsbFxuXHRcdH07XG5cdFx0dmFyIHBsYWNlc1RlbXBsYXRlID0gJCgnI3BsYWNlc1RlbXBsYXRlJykuaHRtbCgpO1xuXHRcdE11c3RhY2hlLnBhcnNlKHBsYWNlc1RlbXBsYXRlKTsgXG5cdFx0dmFyIHJlbmRlcmVkID0gTXVzdGFjaGUucmVuZGVyKHBsYWNlc1RlbXBsYXRlLCB2aWV3KTtcblx0XHQkKCcjcGxhY2VzJykuaHRtbChyZW5kZXJlZCk7XG5cdH0sXG5cdGV2ZW50c011c3RhY2hlOiBmdW5jdGlvbiAoYWxsKSB7XG5cdFx0dmFyIHZpZXcgPSB7XG5cdFx0XHQnZXZlbnRzJzogYWxsXG5cdFx0fTtcblx0XHR2YXIgZXZlbnRzVGVtcGxhdGUgPSAkKCcjZXZlbnRzVGVtcGxhdGUnKS5odG1sKCk7XG5cdFx0TXVzdGFjaGUucGFyc2UoZXZlbnRzVGVtcGxhdGUpOyBcblx0XHR2YXIgcmVuZGVyZWQgPSBNdXN0YWNoZS5yZW5kZXIoZXZlbnRzVGVtcGxhdGUsIHZpZXcpO1xuXHRcdCQoJyNldmVudHMnKS5odG1sKHJlbmRlcmVkKTtcblx0fVxufTtcbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGVzOyIsIid1c2Ugc3RyaWN0Jztcbi8qanNoaW50IGNhbWVsY2FzZTogZmFsc2UgKi9cblxudmFyIHZhcnMgPSB7XG5cdGVuZGU6IDAsXG5cdHRyOiBbXSxcblx0c3VtOiAwLFxuXHRnZ2c6IDBcbn07XG4vLyBmdW5jdGlvbiBsb2dEYXRhMihlLCBkYXRhKSB7XG4vLyBcdHZhcnMudHIgPSBbXTtcbi8vIFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4vLyBcdFx0dmFyIGRhdGFJZCA9IGRhdGFbaV0uaWQ7XG4vLyBcdFx0Zm9yICh2YXIgaiA9IGkgKyAxOyBqIDwgZGF0YS5sZW5ndGg7IGorKykge1xuLy8gXHRcdFx0aWYgKGRhdGFJZCA9PT0gZGF0YVtqXS5pZCkge1xuLy8gXHRcdFx0XHRkYXRhLnNwbGljZShqLCAxKTtcbi8vIFx0XHRcdH1cbi8vIFx0XHR9XG4vLyBcdFx0dmFycy50cltpXSA9IGRhdGFbaV07XG4vLyBcdFx0Ly9zdW0gKz0gZGF0YVtpXS51c2Vycztcbi8vIFx0fVxuLy8gXHRqUXVlcnkoJyNmYi1sb29wJykudHJpZ2dlcignZmI6Y2hlY2snLCBbdmFycy50cl0pO1xuLy8gfVxuZnVuY3Rpb24gbG9nRGF0YSAoZSwgbmFtZSwgZGF0YSkge1xuXHRjb25zb2xlLmxvZyhuYW1lICsgJyBzdGFydDogLS0tLS0tLS0tJyk7XG5cdGNvbnNvbGUubG9nKGRhdGEpO1xuXHRjb25zb2xlLmxvZyhuYW1lICsgJyBlbmQ6IC0tLS0tLS0tLS0tJyk7XG59XG5mdW5jdGlvbiBsb2dTdHJpbmcgKGUsIG5hbWUsIGRhdGEpIHtcblx0Y29uc29sZS5sb2cobmFtZSArICcgOiAnICsgZGF0YSk7XG59XG4vLyBmdW5jdGlvbiBiaW5kTG9vcCAoZSwgZGF0YSkge1xuLy8gXHQvL2VuZGUgPSBkYXRhLmxlbmd0aDtcbi8vIFx0Y29uc29sZS5sb2coZGF0YSk7XG4vLyB9XG4vLyBmdW5jdGlvbiBiaW5kRXZlbnRzIChlLCBkYXRhKSB7XG4vLyBcdC8vIGlmIChkYXRhLmNvdW50ID09PSBlbmRlKSB7XG4vLyBcdFx0Y29uc29sZS5sb2coZGF0YSk7XG4vLyBcdC8vIH1cbi8vIH1cbmZ1bmN0aW9uIGNoZWNrIChlLCBkYXRhKSB7XG5cdHZhcnMuc3VtID0gMDtcblx0dmFycy5nZ2cgPSAwO1xuXHRmb3IgKHZhciBrID0gMDsgayA8IGRhdGEubGVuZ3RoOyBrKyspIHtcblx0XHR2YXJzLnN1bSArPSBkYXRhW2tdLnVzZXJzO1xuXHR9XG5cdHZhcnMuZ2dnID0gZGF0YVtkYXRhLmxlbmd0aCAtIDFdLmNvdW50O1xuXHQvLyBjb25zb2xlLmxvZygnc3VtOiAnICsgJ3ZhcnMuc3VtJyk7XG5cdC8vIGNvbnNvbGUubG9nKCdnZ2c6ICcgKyAndmFycy5nZ2cnKTtcbn1cblxudmFyIHRyaWdnZXJzID0ge1xuXHRpbml0OiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5iaW5kKCk7XG5cdH0sXG5cdGJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0XHQkKCcjZmItbG9vcCcpLmJpbmQoJ2ZiOmNoZWNrJywgY2hlY2spO1xuXHRcdC8vJCgnI2ZiLWxvb3AnKS5iaW5kKCdmYjpldmVudHMnLCBiaW5kRXZlbnRzKTtcblx0XHQvLyQoJyNmYi1sb29wJykuYmluZCgnZmI6bG9vcHMnLCBiaW5kTG9vcCk7XG5cdFx0JCgnI2ZiLWxvb3AnKS5iaW5kKCdsb2c6ZGF0YScsIGxvZ0RhdGEpO1xuXHRcdCQoJyNmYi1sb29wJykuYmluZCgnbG9nOnN0cmluZycsIGxvZ1N0cmluZyk7XG5cdFx0JCgnI2ZiLWxvb3AnKS5iaW5kKCdsb29wczpjb3VudGVyJywgbG9nU3RyaW5nKTtcblxuXHRcdCQoJyNmYi1yb290JykuYmluZCgnZmI6bGFzdCcsIGZ1bmN0aW9uIChlLCB1c2Vyc0Fycikge1xuXHRcdFx0dmFyIHN1bSA9IDA7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHVzZXJzQXJyLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHN1bSArPSB1c2Vyc0FycltpXTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufTsgICBcbm1vZHVsZS5leHBvcnRzID0gdHJpZ2dlcnM7Il19
