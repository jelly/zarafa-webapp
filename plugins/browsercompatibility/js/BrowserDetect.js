Ext.namespace('Zarafa.plugins.browsercompatibility');

/**
 * @class Zarafa.plugins.browsercompatibility.BrowserDetect
 * @singleton
 *
 * The Singleton class can be used to get user's browser name, version and OS.
 */
Zarafa.plugins.browsercompatibility.BrowserDetect = function() {
	/**
	 * The browser name by which user is currently accessing WebApp.
	 * @property
	 * @type String
	 * @private
	 */
	var currentBrowser = undefined;

	/**
	 * The browser version of the current browser by which user is currently accessing WebApp.
	 * @property
	 * @type String
	 * @private
	 */
	var currentBrowserVersion = undefined;

	/**
	 * The Operating System of user.
	 * @property
	 * @type String
	 * @private
	 */
	var currentOS = undefined;

	/**
	 * The browser rendering engine version of the current browser by which user is currently accessing WebApp.
	 * @property
	 * @type String
	 * @private
	 */
	var currentRenderingEngineVersion = undefined;

	/**
	 * The array which contains list of browsers identification information.
	 * @property
	 * @type Array
	 */
	var browsersIdentificationData = [{
			string: navigator.userAgent,
			subString: 'ZDI',
			identity: 'ZDI',
			versionSearch: 'ZDI'
		}, {
			// new version of opera > v12
			string: navigator.userAgent,
			subString : 'OPR',
			identity: 'Opera',
			versionSearch: 'OPR',
			renderingEngineVersion: 'AppleWebKit'
		}, {
			string: navigator.userAgent,
			subString: 'Chromium',
			identity: 'Chromium',
			renderingEngineVersion: 'AppleWebKit'
		}, {
			string: navigator.userAgent,
			subString: 'Chrome',
			identity: 'Chrome',
			renderingEngineVersion: 'AppleWebKit'
		}, {
			string: navigator.userAgent,
			subString: 'OmniWeb',
			versionSearch: 'OmniWeb/',
			identity: 'OmniWeb'
		}, {
			string: navigator.userAgent,
			subString: 'Apple',
			identity: 'Safari',
			versionSearch: 'Version',
			renderingEngineVersion: 'AppleWebKit'
		}, {
			// old version of opera < v12
			prop: window.opera,
			identity: 'Opera',
			versionSearch: 'Version',
			renderingEngineVersion: 'Presto'
		}, {
			string: navigator.vendor,
			subString: 'iCab',
			identity: 'iCab',
			renderingEngineVersion: 'AppleWebKit'
		}, {
			string: navigator.vendor,
			subString: 'KDE',
			identity: 'Konqueror',
			renderingEngineVersion: 'KHTML'
		}, {
			string: navigator.userAgent,
			subString: 'Firefox',
			identity: 'Firefox',
			renderingEngineVersion: 'Gecko'
		}, {
			string: navigator.vendor,
			subString: 'Camino',
			identity: 'Camino',
			renderingEngineVersion: 'Gecko'
		}, {
			// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: 'Netscape',
			identity: 'Netscape',
			renderingEngineVersion: 'Gecko'
		}, {
			string: navigator.userAgent,
			subString: 'MSIE',
			identity: 'Explorer',
			versionSearch: 'MSIE',
			renderingEngineVersion: 'Trident'
		}, {
			string: navigator.userAgent,
			subString: 'Trident',
			identity: 'Explorer',
			versionSearch: 'rv',
			renderingEngineVersion: 'Trident'
		}, {
			string: navigator.userAgent,
			subString: 'Gecko',
			identity: 'Mozilla',
			versionSearch: 'rv',
			renderingEngineVersion: 'Gecko'
		}, {
			// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: 'Mozilla',
			identity: 'Netscape',
			versionSearch: 'Mozilla',
			renderingEngineVersion: 'Gecko'
		}
	];

	/**
	 * The array which contains list of OS identification information.
	 * @property
	 * @type Array
	 */
	var osIdentificationData = [{
			string: navigator.platform,
			subString: 'Win',
			identity: 'Windows'
		}, {
			string: navigator.platform,
			subString: 'Mac',
			identity: 'Mac'
		}, {
			string: navigator.userAgent,
			subString: 'iPhone',
			identity: 'iPhone/iPod'
		}, {
			string: navigator.platform,
			subString: 'Linux',
			identity: 'Linux'
		}
	];

	/**
	 * It detects current browser name by using available identification information respect to the browser itself.
	 * Iteratively checks that {@link #browsersIdentificationData[].string}
	 * contains {@link #browsersIdentificationData[].subString} or not.
	 * @param {Array} data Contains browsers identification information.
	 */
	var detectBrowserName = function(data)
	{
		for (var i=0, len=data.length; i<len; i++) {
			var dataString = data[i].string;
			var dataProp = data[i].prop;

			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1) {
					return data[i].identity;
				}
			} else if (dataProp) {
				return data[i].identity;
			}
		}
	};

	/**
	 * It detects current browser version by using available identification information respect to the browser version itself.
	 * Iteratively checks that {@link #browsersIdentificationData[].string}
	 * contains {@link #browsersIdentificationData[].versionSearch} or not,
	 * Extracts version information and returns it back.
	 * @param {Array} data Contains browsers identification information.
	 */
	var detectBrowserVersion = function(data)
	{
		for (var i=0, len=data.length; i<len; i++) {
			var dataString = data[i].string;
			var dataProp = data[i].prop;

			var versionSearchString = data[i].versionSearch || data[i].identity;

			if (dataString) {
				var index = dataString.indexOf(versionSearchString);
				if (index != -1) {
					return parseFloat(dataString.substring(index + versionSearchString.length + 1));
				}
			}
			else if (dataProp) {
				return dataString.version();
			}
		}
	};

	/**
	 * It detects current browser Rendering Engine version by using available identification information
	 * respect to the browser Rendering Engine version itself.
	 * Iteratively checks that {@link #browsersIdentificationData[].string}
	 * contains {@link #browsersIdentificationData[].renderingEngineVersion} or not,
	 * Extracts version information and returns it back.
	 * @param {Array} data Contains browsers identification information.
	 */
	var detectRenderingEngineVersion = function(data)
	{
		for (var i=0, len=data.length; i<len; i++) {
			var dataString = data[i].string;

			var renderingEngineVersionSearchString = data[i].renderingEngineVersion;

			if (dataString) {
				var index = dataString.indexOf(renderingEngineVersionSearchString);

				if (index != -1) {
					return parseFloat(dataString.substring(index + renderingEngineVersionSearchString.length + 1));
				}
			}
		}
	};

	/**
	 * It detects current OperatingSystem by using available Operating System identification information.
	 * Iteratively checks that {@link #osIdentificationData[].string}
	 * contains {@link #browsersIdentificationData[].subString} or not.
	 * @param {Array} data Contains Operating System identification information.
	 */
	var detectBrowserOS = function(data)
	{
		for (var i=0, len=data.length; i<len; i++) {
			var dataString = data[i].string;
			var dataProp = data[i].prop;

			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1) {
					return data[i].identity;
				}
			} else if (dataProp) {
				return data[i].identity;
			}
		}
	};

	return {
		/**
		 * Returns {@link #currentBrowser} if it is defined otherwise detect browser by {@link #detectBrowserName},
		 * assign it to the {@link #currentBrowser} and returns back.
		 */
		getCurrentBrowserName : function()
		{
			return currentBrowser || (currentBrowser = detectBrowserName(browsersIdentificationData));
		},

		/**
		 * Returns {@link #currentBrowserVersion} if it is defined otherwise detect browser by {@link #detectBrowserVersion},
		 * assign it to the {@link #currentBrowserVersion} and returns back.
		 */
		getCurrentBrowserVersion : function()
		{
			return currentBrowserVersion || (currentBrowserVersion = detectBrowserVersion(browsersIdentificationData));
		},

		/**
		 * Returns {@link #currentRenderingEngineVersion} if it is defined otherwise detect browser by {@link #detectRenderingEngineVersion},
		 * assign it to the {@link #currentRenderingEngineVersion} and returns back.
		 */
		getCurrentRenderingEngineVersion : function()
		{
			return currentRenderingEngineVersion || (currentRenderingEngineVersion = detectRenderingEngineVersion(browsersIdentificationData));
		},

		/**
		 * Returns {@link #currentOS} if it is defined otherwise detect browser by {@link #detectBrowserOS},
		 * assign it to the {@link #currentOS} and returns back.
		 */
		getCurrentOS : function()
		{
			return currentOS || (currentOS = detectBrowserOS(osIdentificationData));
		}
	}
};

Zarafa.plugins.browsercompatibility.BrowserDetect = new Zarafa.plugins.browsercompatibility.BrowserDetect();