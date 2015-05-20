Ext.namespace('Zarafa.plugins.files.data');

/**
 * @class Zarafa.plugins.files.data.Helper
 * Some static helper functions 
 * @singleton
 */
Zarafa.plugins.files.data.Helper = {

	/** 
	 * Base64 tools
	 */
	Base64 : {
		// private property
		_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

		/**
		 * Encode the given string to base64.
		 * @param {String} input
		 * @return {String}
		 */
		encode : function (input) {
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;

			input = this._utf8_encode(input);

			while (i < input.length) {

				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);

				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;

				if (isNaN(chr2))
					enc3 = enc4 = 64;
				else if (isNaN(chr3))
					enc4 = 64;

				output = output +
				this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
				this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

			}

			return output;
		},
		
		/**
		 * Decode the given base64 encoded string.
		 * @param {String} input
		 * @return {String}
		 */
		decode : function (input) {
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;

			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

			while (i < input.length) {

				enc1 = this._keyStr.indexOf(input.charAt(i++));
				enc2 = this._keyStr.indexOf(input.charAt(i++));
				enc3 = this._keyStr.indexOf(input.charAt(i++));
				enc4 = this._keyStr.indexOf(input.charAt(i++));

				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;

				output = output + String.fromCharCode(chr1);

				if (enc3 != 64)
					output = output + String.fromCharCode(chr2);
				if (enc4 != 64)
					output = output + String.fromCharCode(chr3);

			}

			output = this._utf8_decode(output);

			return output;

		},
		
		/**
		 * Decodes the given base64 encoded utf-8 string.
		 * @param {String} input
		 * @return {String}
		 * @private
		 */
		_utf8_decode : function (utftext) {
			var string = "";
			var i = 0;
			var c = 0
			var c1 = 0;
			var c2 = 0;
			var c3 = 0;

			while ( i < utftext.length ) {

				c = utftext.charCodeAt(i);

				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				}
				else if((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i+1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				}
				else {
					c2 = utftext.charCodeAt(i+1);
					c3 = utftext.charCodeAt(i+2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}

			}

			return string;
		},

		/**
		 * Encode the given string to base64 in utf-8.
		 * @param {String} input
		 * @return {String}
		 * @private
		 */
		_utf8_encode : function (string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";

			for (var n = 0; n < string.length; n++) {

				var c = string.charCodeAt(n);

				if (c < 128)
					utftext += String.fromCharCode(c);
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}

			}

			return utftext;
		}
	},
	
	/** 
	 * Rendering functions
	 */
	Renderer : {
		
		/**
		 * Typerenderer for folders or files
		 * @param {Object} value The data value for the cell.
		 * @param {Object} p An object with metadata
		 * @param {Ext.data.record} record The {Ext.data.Record} from which the data was extracted.
		 * @return {String} The formatted string
		 */
		typeRenderer : function(value, p, record) {
			switch (value) {
				case Zarafa.plugins.files.data.FileTypes.FOLDER: p.css = "zarafa-files-listview-icon " + Zarafa.plugins.files.data.Helper.File.getIconClass("folder", "16"); break;
				case Zarafa.plugins.files.data.FileTypes.FILE: p.css = "zarafa-files-listview-icon " + Zarafa.plugins.files.data.Helper.File.getIconClass(record.get('filename'), "16"); break;
				default : break;
			}

			// add extra css class for empty cell
			p.css += ' zarafa-grid-empty-cell';

			return '';
		},
	
		/**
		 * Renders timestamps
		 * @param {Object} value The data value for the cell.
		 * @param {Object} p An object with metadata
		 * @param {Ext.data.record} record The {Ext.data.Record} from which the data was extracted.
		 * @return {String} The formatted string
		 */
		datetimeRenderer : function(value, p, record) {
			p.css = 'mail_date';

			// # TRANSLATORS: See http://docs.sencha.com/ext-js/3-4/#!/api/Date for the meaning of these formatting instructions
			value = new Date(value);
			return Ext.isDate(value) ? value.format(dgettext('plugin_files', 'l d/m/Y G:i')) : dgettext('plugin_files', 'Never');
		}
	},
	
	/** 
	 * Formatting functions
	 */
	Format : {
		/**
         * Simple format for a file size (xxx bytes, xxx KB, xxx MB, xxx GB)
         * @param {Number/String} size The numeric value to format
         * @return {String} The formatted file size
         */
        fileSize : function(size) {
		    if(size === -1 || size === "none") {
				return "";
			} else {
				if (size < 1024) {
					return size + " bytes";
				} else if (size < 1048576) {
					return (Math.round(((size*10) / 1024))/10) + " KB";
				} else if(size < 1073741824) {
					return (Math.round(((size*10) / 1048576))/10) + " MB";
				} else { // < 1 TB
					return (Math.round(((size*10) / 1073741824))/10) + " GB";
				} 
			}
        },
		
		/**
         * Simple format for a file size (xxx KB, xxx MB, xxx GB, xxx TB)
         * @param {Number/String} size The numeric value to format
         * @return {String} The formatted file size
         */
        fileSizeList : function(size) {
		    if(size === -1 || size === "none") {
				return "";
			} else {
				if (size < 1024) { // < 1 KB
					if(size <= 100 && size != 0) {
						return "0.1 &nbsp;KB";
					} else {
						return (Math.round(((size*10) / 1024))/10) + " &nbsp;KB";
					}
				} else if (size < 1048576) { // < 1 MB
					return (Math.round(((size*10) / 1024))/10) + " &nbsp;KB";
				} else if(size < 1073741824) { // < 1 GB
					return (Math.round(((size*10) / 1048576))/10) + " &nbsp;MB";
				} else if(size < 1099511627776) { // < 1 TB
					return (Math.round(((size*10) / 1073741824))/10) + " &nbsp;GB";
				} else { // > 1 TB
					return (Math.round(((size*10) / 1099511627776))/10) + " &nbsp;TB";
				}
			}
        }
	},
	
	File : {
		/**
		 * Get the extension from the filename
		 *
		 * @param {String} filename
		 * @return {String} Extension string without dot
		 */
		getExtension : function(filename) {
			var i = filename.lastIndexOf('.');
			return (i < 0) ? '' : filename.substr(i+1); // also remove dot
		},
		
		/**
		 * Get the icon class for the filetype
		 * @param {String} filename
		 * @param {String} size Iconsize without px
		 * @return {String} Icon class
		 */
		getIconClass : function (filename, size) {
			if(!Ext.isDefined(size)) {
				size = "48";
			}
			var existingIcons = ["aac", "ai", "aiff", "avi", "bmp", "c", "cpp", "css", "dat", "dmg",
				"doc", "docx", "dotx", "dwg", "dxf", "eps", "exe", "flv", "gif", "gz", "h", "hpp", "html", "ics",
				"iso", "java", "jpg", "js", "key", "less", "mid", "mp3", "mp4", "mpg", "odf", "ods",
				"odt", "otp", "ots", "ott", "pdf", "php", "png", "ppt", "psd", "py", "qt", "rar",
				"rb", "rtf", "sass", "sql", "tga", "tgz", "tiff", "txt", "wav", "xls", "xlsx", "xml",
				"yml", "zip"];
				
			if(filename === "folder") {
				return "files" + size + "icon_folder";
			}
			
			var extension = this.getExtension(filename).toLowerCase();
			var exists = existingIcons.indexOf(extension);
			
			if(Ext.isEmpty(extension) || exists === -1) {
				return "files" + size + "icon_blank";
			}
			
			return "files" + size + "icon_" + extension;
		},
		
		/**
		 * Check if the filename (or foldername) includes unwanted characters
		 * @param {String} filename
		 * @return {Boolean} true if filename is valid
		 */
		isValidFilename : function (filename) {
			
			// empty filenames are not allowed
			if(Ext.isEmpty(filename))
				return false;
			
			// filename must not contain a slash
			if(filename.indexOf("/") !== -1)
				return false;
			
			// this symbols are not allowed in owncloud
			if( filename.indexOf("\\") !== -1 
				|| filename.indexOf("<") !== -1 
				|| filename.indexOf(">") !== -1
				|| filename.indexOf(":") !== -1
				|| filename.indexOf("'") !== -1
				|| filename.indexOf("|") !== -1
				|| filename.indexOf("?") !== -1
				|| filename.indexOf("*") !== -1
			)
				return false;
			
			return true;
		}
	}
}
