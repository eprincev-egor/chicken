;(function() {
	"use strict";

	require([
		"require-config"
	], function() {
		require([
			document.getElementById("main-script").getAttribute("data-boost-app")
		], function(App) {

			window.app = new App({

			});
		});
	});

})();
