Ext.namespace('Zarafa.common.ui');

/**
 * @class Zarafa.common.ui.HtmlEditor
 * @extends Ext.ux.TinyMCE
 * @xtype zarafa.htmleditor
 * 
 * The Zarafa HtmlEditor is a simple override of the TinyMCE provided HtmlEditor.
 * It automatically enables all buttons which are needed within Zarafa, and adds
 * plugins to extend the HtmlEditor with additional features.
 * The toolbar is extended with the overflow option, which moves all buttons
 * which do not fit within the length of the toolbar to a new popup menu at
 * the right position of the toolbar.
 */
Zarafa.common.ui.HtmlEditor = Ext.extend(Ext.ux.form.TinyMCETextArea, {

	/**
	 * @cfg {String} defaultFontFamily is contains the default font family,
	 * which is apply in html editor.
	 */
	defaultFontFamily : undefined,

	/**
	 * @cfg {String} defaultFontSize is contains the default font size,
	 * which is apply in html editor.
	 */
	defaultFontSize : undefined,

	/**
	 * set true to indicate that default formatting should be applied forcefully or not,
	 * default value is false.
	 * 
	 * @property
	 * @type Boolean
	 */
	applyFormattingForcefully : false,

	/**
	 * @constructor
	 * @param config configuration object
	 * @cfg enableOverflow set {@link Ext.Toolbar.enableOverflow enableOverflow} on the toolbar.
	 */
	constructor : function(config)
	{
		config = config || {};

		// Get supported font families and sizes
		var fontSizes = Zarafa.common.ui.htmleditor.Fonts.getFonts();
		var fontFamilies = Zarafa.common.ui.htmleditor.Fonts.getFontFamilies();

		var fontSizesAsString = "";
		for(var key in fontSizes) {
			fontSizesAsString += fontSizes[key] + "pt,"
		}

		config = Ext.applyIf(config, {
			xtype: 'zarafa.tinymcetextarea',
			hideLabel: true,
			hideMode: 'offsets',
			readOnly: false,
			tinyMCEConfig :{
				delta_height: 1,
				plugins: ["advlist paste emoticons directionality lists link image charmap searchreplace textcolor"],
				toolbar1 : "fontselect fontsizeselect | bold italic underline strikethrough | subscript superscript | forecolor backcolor | alignleft aligncenter alignright | outdent indent | ltr rtl | bullist numlist | searchreplace | link unlink | undo redo | charmap emoticons image hr removeformat" ,
				extended_valid_elements : 'a[name|href|target|title|onclick],img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name],table[style|class|border=2|width|cellspacing|cellpadding|bgcolor],colgroup,col[style|width],tbody,tr[style|class],td[style|class|colspan|rowspan|width|height],hr[class|width|size|noshade],font[face|size|color|style],span[class|align|style|br]br',
				paste_data_images : true,
				valid_children : '+body[style]',
				font_formats : fontFamilies,
				theme_advanced_font_sizes: fontSizesAsString,
				font_size_style_values: fontSizesAsString,
				toolbar_items_size: 'small',
				browser_spellcheck : true,
				menubar : false,
				statusbar : false,
				/*
				 * Using capital latter because value of forced_root_block config option used to compare
				 * node name at many places in tinymce library(specially in createNewTextBlock function
				 * of 'lists' plugin). Default value is small 'p'. Given the fact that node name comparison
				 * resulted in desired manner with capital node names.
				 */
				forced_root_block: 'P',
				forced_root_block_attrs: {
					'style' : 'padding: 0; margin: 0;'
				}
			},
			defaultFontFamily : container.getSettingsModel().get('zarafa/v1/main/default_font'),
			defaultFontSize : Zarafa.common.ui.htmleditor.Fonts.getDefaultFontSize()
		});

		this.addEvents(
			/**
			 * @event valuecorrection
			 * Fires after {@link #setValue} has been called, and the given value has been
			 * formatted by the browser or tinymce. This allows the user of this component
			 * to better determine what the user-made changes were.
			 * @param {Zarafa.common.ui.HtmlEditor} this The component which fired the event
			 * @param {String} correctedValue The new (by browser corrected) value
			 * @param {String} originalValue The value as set by the caller of setValue
			 */
			'valuecorrection'
		);

		Zarafa.common.ui.HtmlEditor.superclass.constructor.call(this, config);

		this.on('initialized', this.onEditorInitialized, this);
	},

	/**
	 * Function is called when the tinymce editor is initialized.
	 * @param {Zarafa.common.ui.HtmlEditor} htmlEditor The editor which is initialized.
	 * @param {tinymce.Editor} tinymceEditor The tinymce editor instance
	 * @private
	 */
	onEditorInitialized : function(htmlEditor, tinymceEditor)
	{
		tinymceEditor.on('keydown', this.onKeyDown.createDelegate(this), this);
		tinymceEditor.on('paste', this.onPaste.createDelegate(this), this);

		var listeners = {
			'blur' : this.onBlur,
			'focus' : this.onFocus,
			scope : this
		};

		Ext.EventManager.on(this.getEditor().getWin(), listeners);

		/*
		 * _hasCaretEvents config is used to initialize or avoid the 'disableCaretContainer' function on 'mouseup' and 'keydown'.
		 * 'disableCaretContainer' function removes all elements with id as '_mce_caret'.
		 * We needs to prevent the above mentioned mechanism to keep the first node until default formatting gets applied.
		 */
		tinymceEditor._hasCaretEvents = true;

		tinymceEditor.on('focus', this.onFocus.createDelegate(this), this);
		tinymceEditor.on('blur', this.onBlur.createDelegate(this), this);

		/**
		 * @FIXME: We don't have any way to get the font family and size combo box from tinyMCE,
		 * so we have get combo box like this way.
		 */
		var toolbarGroup = tinymceEditor.theme.panel.find(".toolbar-grp")[0]; 
		var buttonGroup = toolbarGroup.items()[0]; 
		var firstGroup = buttonGroup.items(); 
		var fontFamilyCombo = firstGroup[0]; 
		var fontSizeCombo = firstGroup[1]; 

		fontFamilyCombo.on('select', this.onFontFamilyChange.createDelegate(this), this);
		fontSizeCombo.on('select', this.onFontSizeChange.createDelegate(this), this);

		/*
		 * @FIXME: The default formatting needs to be applied after the editor is completely initialized,
		 * and a record needs to be attached/loaded with editor.
		 * But there was a race condition between 'setrecord' event of Zarafa.core.plugins.RecordComponentPlugin
		 * and 'init' event of tinymce, having different behavior between
		 * 1) first instance of tinymce editor
		 * 2) other than first instance
		 * Any event/method based implementation is more reliable as compared to delay/timer based implementation.
		 */
		var defaultFormatTask = new Ext.util.DelayedTask(this.applyDefaultFormatting, this, [tinymceEditor]);
		defaultFormatTask.delay(5);
	},

	/**
	 * Event handler is called when content will be pasted in editor. 
	 * the clipboardData is a read-only property of DataTransfer object, the data 
	 * affected by the user-initialed cut, copy, or paste operation, along with its MIME type.
	 * if clipboardData and MIME type is specified then register a handler which replace the 
	 * carriage return to Br and white space to &nbsp; on {@link tinymce.pasteplugin.Clipboard BeforePastePreProcess} event.
	 * @param {object} event the event object.
	 */
	onPaste : function(event)
	{
		var editor = this.getEditor();
		var editorMgr = editor.editorManager;
		
		/** 
		 * check that current selected browser webkit supported. also check clipboardData and types are
		 * there.
		 */
		if(editorMgr.Env.webkit && event.clipboardData && event.clipboardData.types) {
			var clipboardHtmlContent = event.clipboardData.getData('text/html');
			if(Ext.isEmpty(clipboardHtmlContent)) {
				var clipboardContent = event.clipboardData.getData('text');
				if (clipboardContent && clipboardContent.length > 0) {
					editor.once('BeforePastePreProcess', function(args){
						var replaceCarriage = clipboardContent.replace(/\n/g, '<br/>');
						var replaceWithSpace = replaceCarriage.replace(/\s/g,'&nbsp;');
						args.content = replaceWithSpace;
						return args;
					});
				}
			}
		}

		/**
		 * If browser is IE then before the paste content in editor make it proper formatted content.
		 */
		if (Ext.isIE) {
			var fontName = this.defaultFontFamily; 
			var fontSize = this.defaultFontSize;
			editor.once('BeforePastePreProcess', function(args){
				var content = args.content;
				var startingTags = "<p style=\"margin: 0px; padding: 0px; data-mce-style=\"margin: 0px; padding: 0px;\">";
				startingTags += "<span style=\"font-family:"+ fontName +"; font-size:"+ fontSize +"; data-mce-style=\"font-family:"+ fontName +"; font-size:"+ fontSize +";>";
				var closingTags = "<br data-mce-bogus=\"1\"></span></p>";

				var replaceStartingTags = content.replace(/<p>|<P>/g, startingTags);
				var formattedString  = replaceStartingTags.replace(/<\/p>|<\/P>/g, closingTags);

				args.content = formattedString;

				/**
				 * After the paste operation set the cursor position at proper place.
				 */
				editor.once('NodeChange', function(arg) {
					var node = editor.selection.getNode();
					var parentNode = editor.dom.getParent(node, 'p');
					if(parentNode && parentNode.nextSibling) {
						editor.selection.setCursorLocation(parentNode.nextSibling.firstChild , 0);
					}
				});
				return args;
			});
		}
	},

	/**
	 * Event handler is called when fonct family combobox gets change the font type.
	 * @param {object} event the event object
	 */
	onFontFamilyChange : function(event)
	{
		this.defaultFontFamily = event.control.settings.value;
	},

	/**
	 * Event handler is called when fonct size combobox gets change the font size.
	 * @param {object} event the event object
	 */
	onFontSizeChange : function(event) 
	{
		this.defaultFontSize = event.control.settings.value;
	},

	/**
	 * Function to set formatting with default font family and font size.
	 * It uses {@link tinymce.Editor.execCommand execCommand} method of tinymce to dynamically
	 * select values from the fontsize and fontname {@link tinymce.ui.ComboBox comboboxes}.
	 * @param {tinymce.Editor} tinymceEditor The tinymce editor instance
	 * @private
	 */
	applyDefaultFormatting : function(tinymceEditor)
	{
		if(!this.isDisabled() && this.record && this.record.phantom || this.applyFormattingForcefully) {

			if(Ext.isDefined(this.defaultFontSize) && Ext.isDefined(this.defaultFontFamily)) {
				// To initialize the object of tinymce.dom.Selection with Range.
				// for more information about Firefox Range class: https://developer.mozilla.org/en-US/docs/Web/API/Range.Range
				tinymceEditor.fire('focusin', {});

				/*
				 * Tinymce will insert the necessary style tags while we dynamically select the default font size/family
				 * at the current cursor position. The current cursor position is handled by tinymce.dom.Selection class,
				 * so we need to first check if selection object is initialized or not.
				 */
				if(tinymceEditor.selection) {
					var firstNode = tinymceEditor.getBody().firstChild;
					var clonedNode;
					// We might have different scenarios with regards to content like with-signature, without-signature, response-content etc.
					// if first node is 'p' than we assume that there is no response-content.
					if (firstNode.nodeName == 'P') {
						// Check if no content is there in editor body.
						// no need to create an element to apply default formatting for the case
						// where no signature is there in editor at the time of initialization
						if (tinymceEditor.getContent() != ''){
							// Signature is there so clone an element before signature to apply default formatting
							clonedNode = firstNode.cloneNode();
							tinymceEditor.getBody().insertBefore(clonedNode, firstNode);
						}
					} else {
						// Response-content is there so create an element before Response-content to apply default formatting
						var bogusHtml = '<br data-mce-bogus="1" />';
						clonedNode = tinymceEditor.dom.create('p', tinymceEditor.settings.forced_root_block_attrs, bogusHtml);
						tinymceEditor.getBody().insertBefore(clonedNode, firstNode);
					}

					// The cursor must have to point to the very first element of the current content to apply the default formatting.
					tinymceEditor.selection.setCursorLocation(tinymceEditor.getBody().firstChild, 0);

					this.composeDefaultFormatting(tinymceEditor);

					// HTML styles will be applied while selecting default values from comboboxes.
					// We need to set those styles into the record to avoid change detection in record.
					this.checkValueCorrection(this, "");

					// Remove all the undo level from tinymce, so that user can't rollback the default HTML styles.
					tinymceEditor.undoManager.clear();
					this.applyFormattingForcefully = false;
				}
			}
		}
	},

	/**
	 * Function is used to execute a tinymce command to compose 
	 * default formatting as a style attribute of currently selected node.
	 * @param {tinymce.Editor} editor The tinymce editor instance
	 * @private
	 */
	composeDefaultFormatting : function(editor)
	{
		editor.execCommand('fontsize', false, this.defaultFontSize, {skip_focus : true});
		editor.execCommand('FontName', false, this.defaultFontFamily, {skip_focus : true});
		this.repositionBrTag(editor);
	},

	/**
	 * Function is used to add the BR tag to inner SPAN tag of P tag and remove BR tag from P tag.
	 * it required because BR tag is used to identify the cursor location as wall as after pressing 
	 * enter or pasting content in editor default formatting gets repeated in next line , to make cursor
	 * position ideal it required that BR tag must be in SPAN tag.
	 * @param {tinymce.Editor} editor The tinymce editor instance
	 */
	repositionBrTag : function(editor)
	{
		var node = editor.selection.getNode();
		editor.dom.add(node, 'br');
		var parentNode = editor.dom.getParent(node, 'p');
		if(parentNode.lastChild.nodeName == 'BR') {
			parentNode.removeChild(parentNode.lastChild);
		}

		/*
		 * Particularly, somehow in IE11 current selection changed to the newly created BR tag instead of SPAN.
		 * The cursor must have to point to the proper element to keep the default formatting.
		 */
		if(Ext.isIE11){
			editor.selection.setCursorLocation(node, 0);
		}
	},

	/**
	 * Function will set value in the editor and will call {@link #checkValueCorrection}
	 * to update tinymce's editor value into record. for more information check code/comments
	 * of {@link #checkValueCorrection}.
	 * @param {String} value The value which was being set on the editor
	 */
	setValue: function(value) {
		var setValue = value;

		Zarafa.common.ui.HtmlEditor.superclass.setValue.call(this, setValue);

		if (this.rendered) {
			// checkValueCorrection function will be only called when editor is created and
			//  initialized. Otherwise, it will it wait for that.
			this.withEd(function() {
				this.checkValueCorrection(this, value);
			});
		}
	},

	/**
	 * Enable this component by calling parent class {@link Ext.ux.form.TinyMCETextArea.enable enable} function.
	 * It also call the {@link #applyDefaultFormatting} function to apply default formatting while composing signature.
	 */
	enable: function() {
		if(this.disabled){
			Zarafa.common.ui.HtmlEditor.superclass.enable.apply(this, arguments);

			var editor = this.getEditor();

			// Reset the remembered selection value to its default value, because the single instance of
			// tinymce editor is being used by composing multiple signatures. it just enabled/disabled
			// with new/updated content.
			editor.selection.lastFocusBookmark = null;

			// Apply default formatting only if new signature is being composed.
			if(Ext.isEmpty(editor.getContent())) {
				this.applyDefaultFormatting(editor);
			}
		}
	},

	/**
	 * This is called after {@link #setValue} and determines if the value has been adjusted by the tinymce.
	 * Normally the value is applied to the <iframe> element where it is being rendered, tinymce will
	 * however also apply extra formatting, and change the ordering of some attributes. Because we only
	 * want to detect when the user made changes rather then the browser, we will check here what
	 * {@link #getValue} returns and check if that is different then the value which was being set.
	 * If a difference was found, the {@link #valuecorrection} event will be fired to inform the
	 * component user that he might need to implement some workaround.
	 *
	 * @param {Zarafa.common.ui.htmleditor.HtmlEditor} editor The HTML editor
	 * @param {String} value The value which was being set on the <iframe>
	 * @private
	 */
	checkValueCorrection : function(editor, value)
	{
		var correctedValue = editor.getRawValue();

		if (value !== correctedValue) {
			editor.fireEvent('valuecorrection', editor, correctedValue, value);
		}
	},

	/**
	 * Function is called when any key is pressed in the editor.
	 * @param {Object} option containing options for setting content, it has content and format
	 */
	onKeyDown : function(event)
	{
		var editor = this.getEditor();
		/*
		 * HACK: for IE and webkit browsers backspace/delete removes default formatting, so we have to
		 * add it again, so we will set empty content and rest will be handled by BeforeSetContent
		 * event. Here we need defer because this keydown handler is called first before other
		 * handlers which clears the content of editor.
		 */
		if (event.keyCode === Ext.EventObject.BACKSPACE || event.keyCode === Ext.EventObject.DELETE) {
			(function(){
				var content = editor.getContent();
				if(Ext.isEmpty(content)) {
					/*
					 * removing caret container if there is any,
					 * as we are trying to remove all the dummy elements
					 */
					var node = editor.dom.get('_mce_caret');
					if(node) {
						editor.dom.remove(node);
					}
					this.applyFormattingForcefully = true;
					this.applyDefaultFormatting(editor);
				} else {
					var node = editor.selection.getNode();
					if(node.hasChildNodes()) {
						/*
						 * We have to handle the case where tinymce line structure gets 
						 * compromised while removing single or multiple line(s)
						 * with DELETE or BACKSPACE key
						 */
						this.validateStyleStructure(node);
					}
				}
			}.createDelegate(this)).defer(1);
		}

		/*
		 * After press enter if newly created P tag was empty then apply the default formatting.
		 */
		if(event.keyCode === Ext.EventObject.ENTER) {
			(function(){
				var node = editor.selection.getNode();
				if(node.nodeName == 'P') {
					if(!node.hasChildNodes() || node.firstChild.nodeName == 'BR') {
						this.composeDefaultFormatting(editor);
					}
				}
			}.createDelegate(this)).defer(1);
		}

		/*
		 * HACK: Prevent the tab event to stop moving focus out of the editor.
		 * Instead of that, Insert four spaces while user presses TAB key.
		 */
		if (event.keyCode === Ext.EventObject.TAB) {
			var listElement = editor.dom.getParent(editor.selection.getStart(), 'LI,DT,DD');

			// check if cursor is not pointing to any list element to allow increase/decrease
			// indent of UL/OL instead of adding four white spaces.
			if(!listElement) {
				editor.dom.events.cancel(event);
				/*
				 * Need to insert four spaces one by one to update the range offset accordingly.
				 * Inserting four space at once will throw error while changing font type
				 * if there is no content in editor body.
				 */
				for (var i = 0; i <= 3; i++) {
					editor.execCommand('mceInsertContent', false, "&nbsp;");
				}
			}
			return;
		}

		this.fireEvent("keypress", this, Ext.EventObject);
	},

	/**
	 * Function is used to make necessary decision to insert node, which is
	 * absent at its desired place as per the need to honor formatting in
	 * current selected node.
	 * @param {Object} node the current selected node in editor.
	 * @private
	 */
	insertNode : function(node)
	{
		switch(node.nodeName) {
			case 'SPAN':
				this.addTextNodeInSpan(node);
				break;
			case 'BODY':
				this.addPTagInBody(node);
				break;
			case 'P':
				this.addTextNodeInP(node);
				break;
		}
	},

	/**
	 * Function checks that the structure of current selected node is valid enough
	 * to process further formatting. If requires, it also validate the structure
	 * by inserting necessary nodes.
	 * @param {Object} node the current selected node in editor.
	 * @private
	 */
	validateStyleStructure : function(node)
	{
		var firstChild = node.firstChild;
		/* 
		 * Insert text node with necessary tags and formatting 
		 * if selected node is empty or body of editor. Also it will 
		 * check that text node has proper style same as data-mce-style 
		 * if not then apply data-mce-style to style attribute.
		 */
		if(firstChild.nodeName == 'BR' || node.nodeName == 'BODY') {
			this.insertNode(node);
		} else if(firstChild.nodeName == '#text' && node.getAttribute('style') === null) {
			node.setAttribute('style', node.getAttribute('data-mce-style'));
		}
	},

	/**
	 * Function creates a text node and insert it before the BR tag in span.
	 * @param {Object} node the current selected node in editor.
	 * @private
	 */
	addTextNodeInSpan : function(node)
	{
		var textNode = this.getEditorDocument().createTextNode('');
		node.insertBefore(textNode, node.firstChild);
	},

	/**
	 * Function finds BR tag, which has parent tag as P or BODY tag from editor's body element,
	 * and replace it with P tag.
	 * 
	 * @param {Object} node the current selected node in editor.
	 * @private
	 */
	addPTagInBody : function(node)
	{
		var editor = this.getEditor();
		var brTags = editor.dom.select('br');
		Ext.each(brTags, function(brTag) {
			var parentNode = brTag.parentNode;
			if (parentNode.nodeName == 'BODY') {
				brTag.remove();
				this.composeDefaultFormatting(editor);
			} else if(parentNode.nodeName == 'P' && parentNode.firstChild.nodeName == 'BR') {
				this.composeDefaultFormatting(editor);
			}
		}, this);
	},

	/**
	 * Function is used to apply the default formatting if P tag is empty.
	 * @param {Object} node the current selected node in editor.
	 * @private
	 */
	addTextNodeInP : function(node)
	{
		var editor = this.getEditor();
		/*
		 * After the deletion of selected lines, we need to re-apply the default 
		 * formatting to the empty P tag specially in chrome. And we have to mark 
		 * that modified P tag as dirty to identify that particular node at the time 
		 * when user tries to remove that line and it can be removed easily.
		 */
		if(node.id === '') {
			this.composeDefaultFormatting(editor);
			node.id = 'dirtyP';
		} else {
			if(node.previousSibling !== null) {
				this.getEditorDocument().execCommand('Delete', false, null);
				/*
				 * It will check that previous node has proper formatting, 
				 * if not then apply default formatting.
				 */
				var currentNode = editor.selection.getNode();
				if(currentNode.firstChild.nodeName === 'BR') {
					this.composeDefaultFormatting(editor);
					currentNode.id = 'dirtyP';
				}
			} else {
				node.remove();
			}
		}
	},

	/**
	 * Event handler which is raised when the component looses the focus
	 * of the user. This will determine if the typed in value has changed
	 * since the moment it gained focus, and will raise the 'change' event
	 * in that case.
	 * @private
	 */
	onBlur : function()
	{
		// if container of HtmlEditor, i.e. dialog, is closed then component is
		// also destroyed and we won't be able to get value/content.
		if(this.isDestroyed === true) {
			return;
		}

		// This event can be triggered multiple times, so we don't need to check
		// for changed when we blur without being focused. However, we do want to
		// invoke the 'blur' event since that will produce a consistent behavior
		// with other UI components from ExtJs.
		if (this.hasFocus === true) {
			var v = this.getRawValue();
			if (v.length != this.originalValue.length || v !== this.originalValue) {
				this.fireEvent('change', this, v, this.originalValue);
			}
		}
		this.hasFocus = false;
		this.fireEvent('blur', this);
	},

	/**
	 * Event handler which is raised when the component gains the focus
	 * of the user. This will update the originalValue field so later,
	 * when the component looses focus, it can be determined if the
	 * value has been changed.
	 * @private
	 */
	onFocus : function()
	{
		// This event can be triggered multiple times,
		// even when it looses focus the onFocus will
		// be raised twice before the onBlur is called.
		if (this.hasFocus === true) {
			return;
		}

		this.originalValue = this.getRawValue();
		this.hasFocus = true;
		this.fireEvent('focus', this);
	},

	/**
	 * Function is used to set the cursor within editor while mail replay/forward. 
	 * It fires the 'focusin' event of editor.
	 */
	setCursorLocation : function()
	{
		var editor = this.getEditor();

		// check If editor instance is available or not
		if (!editor){
			/*
			 * if editor instance is not available yet to do auto focus than we have to reschedule the
			 * auto focus mechanism un till editor instance will be available, simply register on
			 * {@link #initialized} event.
			 */
			this.on('initialized', function() {
				var focusCmp = this.ownerCt;
				focusCmp.focus.defer(1, focusCmp);
				focusCmp.fireEvent('setAutoFocusCursor', focusCmp.getEditor());
			}, this);
		} else {
			this.withEd(function() {
				/*
				 * Here we need to fire the focusin event of editor because 
				 * in default formatting we have two span tags, so somehow 
				 * when mail is reply/forward cursor set in first outer span which is not contains any 
				 * formatting so default formatting gets lost. to overcome this problem 
				 * we need to fire the focusin event of editor.
				 */
				editor.fire('focusin', {});
			});
		}
	},

	/**
	 * Function will get the editor and fetch document element of the editor.
	 * @return {HTMLDocument} it will return document element of the editor iframe
	 */
	getEditorDocument: function() {
		return this.getEditor().getDoc();
	},

	/**
	 * Function will get the editor and fetch body element of the editor.
	 * @return {HTMLBodyElement} it will return body element of the editor iframe
	 */
	getEditorBody: function() {
		return this.getEditor().getBody();
	},

	/**
	 * bind an {@link Zarafa.core.data.IPMRecord} to this component
	 * record is necessary to properly convert img tags, for which store and entryid are needed
	 * @param {Zarafa.core.data.IPMRecord} record
	 */
	bindRecord : function(record)
	{
		this.record = record;
	}
});

Ext.reg('zarafa.htmleditor', Zarafa.common.ui.HtmlEditor);