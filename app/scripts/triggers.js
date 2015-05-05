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