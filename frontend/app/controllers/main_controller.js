var app = app || {};
(function() {
	'use strict';
	app.MainController = Wires.MVC.Controller.extend({
		essentials : {
			views : {
				'index' : 'main.html',
			},
			collections : {
		//		items : app.ItemModel
			}
		},
		initialize : function() {
			
		},
		// Index ******************************
		index : function(params, render) {
			
			render();
		}
	});
})();
