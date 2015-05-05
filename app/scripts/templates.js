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