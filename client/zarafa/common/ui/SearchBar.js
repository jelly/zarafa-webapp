Ext.namespace('Zarafa.common.ui');

/**
 * @class Zarafa.common.ui.SearchBar
 * @extends Ext.Panel
 * @xtype zarafa.searchbar
 *
 * This class can be used to add a search bar in every view of any context. it supports server side
 * searching with error handling.
 */
Zarafa.common.ui.SearchBar = Ext.extend(Ext.Panel, {
	/**
	 * @cfg {Array} searchFields array of search fields with {name, value} objects, name will be used
	 * to display category in combobox and value will be a string with space seperated property tags
	 * that should be used when creating restrictions for search.
	 */
	searchFields : undefined,

	/**
	 * @cfg {Boolean} subfolders true if subfolder option should be checked or false,
	 * display of this option depends on {@link Zarafa.core.MAPIStore MAPIStore} supports
	 * search folders or not.
	 */
	subfolders : false,

	/**
	 * @cfg {Zarafa.core.Context} context The context to which this panel belongs
	 */
	context : undefined,

	/**
	 * The {@link Zarafa.core.ContextModel ContextModel} which is obtained from {@link #context},
	 * and used to get {@link Zarafa.core.data.IPMStore IPMStore} binded to {@link Zarafa.core.Context Context}.
	 * @property
	 * @type Zarafa.core.ContextModel
	 */
	model : undefined,

	/**
	 * @cfg {String} errorMsgEmpty The error text to display if the search query is empty.
	 */
	errorMsgEmpty : _('Please enter text to start search.'),

	/**
	 * @cfg {String} errorMsgCombo error string that will be displayed when no option is selected in
	 * search options combobox.
	 */
	errorMsgCombo : _('Please select search option from combobox.'),

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		if (!Ext.isDefined(config.model) && Ext.isDefined(config.context)) {
			config.model = config.context.getModel();
		}

		if (!Ext.isDefined(config.store) && Ext.isDefined(config.model)) {
			config.store = config.model.getStore();
		}

		Ext.applyIf(config, {
			xtype : 'zarafa.searchbar',
			cls: 'zarafa-searchbar',
			header: true,
			hidden : false,
			border : false,
			hideBorders : true,
			collapsible: true,
			collapsed : true,
			autoHeight: true,
			layout : 'fit',
			items : [{
				xtype: 'container',
				layout: 'form',
				autoHeight: true,
				style: 'padding: 5px; ',
				items: [{
					xtype : 'combo',
					fieldLabel : _('Search in'),
					triggerAction : 'all',
					mode : 'local',
					store : {
						xtype : 'jsonstore',
						fields : ['name', 'value'],
						data : config.searchFields
					},
					anchor: '-5',
					boxMaxWidth: 250,
					lazyInit: false,
					forceSelection: true,
					autoSelect : true,
					editable : false,
					valueField : 'value',
					displayField : 'name',
					value: config.searchFields[0].value,
					ref : '../searchFieldsCombo'
				},{
					xtype : 'checkbox',
					boxLabel : _('subfolders'),
					checked : config.subfolders,
					ref : '../subfolderCheckbox',
					listeners : {
						scope : this,
						check : this.subfolderOnCheck
					}
				}]
			}]
		});

		this.addEvents(
			/**
			 * @event beforesearchstart
			 * Event can be used to indicate that search trigger has been clicked and search is
			 * going to start, this event will always be called even if validation fails on search fields
			 * and because of that search execution is aborted.
			 * @param {Zarafa.common.ui.SearchBar} SearchField object of search bar component.
			 * @return {Boolean} false the prevent the search from starting
			 */
			'beforesearchstart',
			/**
			 * @event searchstart
			 * Event can be used to indicate that search has been started on server.
			 * @param {Zarafa.common.ui.SearchBar} SearchField object of search bar component.
			 */
			'searchstart',
			/**
			 * @event searchupdate
			 * Event can be used when to get update of the search status and update data according to it.
			 * @param {Zarafa.core.data.ListModuleStore} store store that initiated the search process.
			 * @param {Object} searchResponse Object will contain search folder's entryid and its status of search.
			 */
			'searchupdate',
			/**
			 * @event searchstop
			 * Event can be used to indicate that search has been stopped on server and we can do
			 * post processing of search process.
			 * @param {Zarafa.core.data.ListModuleStore} store store that initiated the search process.
			 */
			'searchstop',
			/**
			 * @event searchfinish
			 * Event can be used to indicate that search has been completed on server and has populated
			 * all its results.
			 * @param {Zarafa.core.data.ListModuleStore} store store that initiated the search process.
			 */
			'searchfinish'
		);

		Zarafa.common.ui.SearchBar.superclass.constructor.call(this, config);
	},

	/**
	 * initializes the events.
	 * @private
	 */
	initEvents : function()
	{
		Zarafa.common.ui.SearchBar.superclass.initEvents.apply(this, arguments);

		this.mon(this.model, {
			'folderchange' : this.onModelFolderChange,
			'searchstart' : this.onModelSearchStart,
			'searchstop' : this.onModelSearchStop,
			'searchfinished' : this.onModelSearchFinished,
			'searchexception' :  this.onModelSearchException,
			scope : this
		});

		this.on('collapse', this.onSearchBarCollapse, this);

		// Invoke the event handlers for the first time, to get the initial state
		this.onModelFolderChange(this.model, this.model.getFolders())
	},

	/**
	 * Event handler which is fired when the {@link #collapse} event have been fired.
	 * This will reset the {@link #searchFieldsCombo}.
	 * @param {Ext.Panel} panel the Panel that has been collapsed.
	 * @private
	 */
	onSearchBarCollapse : function(panel)
	{
		this.searchFieldsCombo.reset();
	},

	/**
	 * Called by extjs when this component is being rendered. This will add the
	 * {@link Zarafa.common.ui.SearchField} into the {@link #header}.
	 * @param {Ext.Container} ct The container into which this component is rendered
	 * @param {Number} position The position in the container where this component is rendered
	 * @private
	 */
	onRender : function(ct, position)
	{
		Zarafa.common.ui.SearchBar.superclass.onRender.apply(this, arguments);

		if (this.header) {
			// Make the header selectable, otherwise we can't type in our
			// search query...
			this.header.selectable();

			// ... but the collapse button should not be selectable
			this.tools.toggle.unselectable();

			this.searchTextfield = Ext.create({
				xtype : 'zarafa.searchfield',
				renderTo: this.header,
				style: 'float: left;',
				boxMinWidth: 100,
				boxMaxWidth: 400,
				emptyText : this.getEmptySearchText(this.model.getDefaultFolder()),
				listeners : {
					scope : this,
					beforestart : this.onBeforeStartSearch,
					start : this.onStartSearch,
					stop : this.onStopSearch
				}
			});
		}
	},

	/**
	 * Called when the SearchBox is being resized. This will calculate the new width for the internal
	 * {@link #searchTextField}.
	 * @param {Number} adjWidth The box-adjusted width that was set
	 * @param {Number} adjHeight The box-adjusted height that was set
	 * @param {Number} rawWidth The width that was originally specified
	 * @param {Number} rawHeight The height that was originally specified
	 * @private
	 */
	onResize : function(adjWidth, adjHeight, rawWidth, rawHeight)
	{
		Zarafa.common.ui.SearchBar.superclass.onResize.apply(this, arguments);

		// Only resize the searchTextField when the width
		// of this component has been changed.
		if (Ext.isDefined(adjWidth)) {
			var toggleWidth = (this.tools && this.tools.toggle) ? (this.tools.toggle.getWidth() + this.tools.toggle.getFrameWidth('rl')) : 0;
			var padding = this.searchTextfield.getEl().getFrameWidth('lr') + 2; // Apply extra padding to add a space between the toggle button and the searchbar.

			this.searchTextfield.setWidth(adjWidth - toggleWidth - padding);
		}
	},

	/**
	 * Obtain the {@link Zarafa.common.ui.SearchField#emptyText emptyText} string
	 * which must be applied to {@link #this.searchTextfield}.
	 * @param {Zarafa.core.data.MAPIFolder} folder The folder which will be searched through.
	 * @return {String} The emptyText string to be applied
	 * @private
	 */
	getEmptySearchText : function(folder)
	{
		if (!Ext.isDefined(folder)) {
			return _('Search in folder');
		} else {
			/* # TRANSLATORS: This will indicate in which folder the user will be searching, e.g. Search in 'Inbox' */
			return String.format(_('Search in \'{0}\''), folder.get('display_name'));
		}
	},

	/**
	 * Event handler will be called when user checks/unchecks subfolders checkbox,
	 * function will set config variable based on checkbox value.
	 * @param {Ext.form.Checkbox} checkbox subfolders check box.
	 * @param {Boolean} checked state of the checkbox.
	 * @private
	 */
	subfolderOnCheck : function(checkbox, checked)
	{
		if(checked) {
			this.subfolders = true;
		} else {
			this.subfolders = false;
		}
	},

	/**
	 * Function will be used to do pre-processing of the search process, it will validate
	 * search fields and if it's not validated then it will return false which will stop
	 * further execution of search process.
	 * @return {Boolean} true if validation succeeded else false.
	 * @private
	 */
	onBeforeStartSearch : function()
	{
		if (this.fireEvent('beforesearchstart', this) === false) {
			return false;
		}

		if(Ext.isEmpty(this.searchTextfield.getValue())) {
			container.getNotifier().notify('error.search', _('Error'), this.errorMsgEmpty);
			return false;
		}

		if(Ext.isEmpty(this.searchFieldsCombo.getValue())) {
			container.getNotifier().notify('error.search', _('Error'), this.errorMsgCombo);
			return false;
		}

		return true;
	},

	/**
	 * Function will be used to start actual search on {@link Zarafa.core.data.ListModuleStore ListModuleStore},
	 * and also it will register event on {@link Zarafa.core.data.ListModuleStore ListModuleStore} to get
	 * updated status of search.
	 * @private
	 */
	onStartSearch : function()
	{
		var restriction = this.createRestriction(this.searchTextfield.getValue(), this.searchFieldsCombo.getValue());
		this.model.startSearch(restriction, this.subfolders);

		// only enable search indicator when we are using search folder
		var useSearchFolder = this.model.supportsSearchFolder();
	},

	/**
	 * Function will be used to create search restriction based on value entered in
	 * search textfield and search combobox. The textFieldValue and comboboxValue are
	 * split into their constituent parts and a restriction will be created with the following
	 * form:
	 *
	 * AND ( OR (field1 = term1, field2 = term1, fieldN = term1), OR(field1 = term2, field2 = term2, fieldN = term2) .. )
	 *
	 * In words: all terms must occur at least once, but it doesn't matter in which of the fields they occur.
	 *
	 * @param {String} textFieldValue value of search text field.
	 * @param {String} comboboxValue value of search combo box field.
	 * @return {Object} Object that will be passed as restriction to server.
	 * @private
	 */
	createRestriction : function(textFieldValue, comboboxValue)
	{
		if (Ext.isEmpty(textFieldValue) || Ext.isEmpty(comboboxValue)) {
			return [];
		}

		var finalRes = [];
		var andRes = [];
		var propTags = comboboxValue.split(' ');
		var terms = textFieldValue.split(/[\.\/\~\,\ \@]+/);

		if(!Ext.isEmpty(propTags) && !Ext.isEmpty(terms)) {
			Ext.each(terms, function(term, index, terms) {
				var orRes = [];
				Ext.each(propTags, function(propTag, index, propTags) {
					orRes.push(
						Zarafa.core.data.RestrictionFactory.dataResContent(
							propTag,
							Zarafa.core.mapi.Restrictions.FL_SUBSTRING | Zarafa.core.mapi.Restrictions.FL_IGNORECASE,
							term
						)
					);
				}, this);

				andRes.push(Zarafa.core.data.RestrictionFactory.createResOr(orRes));
			}, this);
		}

		if(!Ext.isEmpty(andRes)) {
			finalRes = Zarafa.core.data.RestrictionFactory.createResAnd(andRes);
		}

		return finalRes;
	},

	/**
	 * Function will be used to execute stop search request on {@link Zarafa.core.data.ListModuleStore ListModuleStore},
	 * it will also unregister event on store to for getting updates of search status.
	 * @private
	 */
	onStopSearch : function()
	{
		this.model.stopSearch();
		this.searchTextfield.focus();
	},

	/**
	 * Function will be used to toggle disability of components based on toggleState,
	 * these state values are custom and doesn't signify anything.
	 *
	 * @param {Boolean} toggleState True to enable all components.
	 * @private
	 */
	toggleComponents : function(toggleState)
	{
		// Enable/Disable the desired components
		this.searchFieldsCombo.setDisabled(!toggleState);
		this.subfolderCheckbox.setDisabled(!toggleState);
	},

	/**
	 * Event handler which will be called when the {@link #model} fires the
	 * {@link Zarafa.core.ContextModel#folderchange} event. This will determine
	 * if the selected folders support 'search folders' and update the UI accordingly.
	 * @param {Zarafa.core.ContextModel} model this context model.
	 * @param {Array} folders selected folders as an array of {Zarafa.hierarchy.data.MAPIFolderRecord Folder} objects.
	 * @private
	 */
	onModelFolderChange : function(model, folders)
	{
		var useSearchFolder = this.model.supportsSearchFolder();

		this.searchTextfield.updateEmptyText(this.getEmptySearchText(folders[0]));
		this.toggleComponents(useSearchFolder);
		this.subfolderCheckbox.setValue(useSearchFolder ? this.subfolders : false);
	},

	/**
	 * Event handler which will be called when the {@link #model} fires the
	 * {@link Zarafa.core.ContextModel#searchstart} event. This will update
	 * the UI to indicate that the search is active.
	 *
	 * @param {Zarafa.core.ContextModel} model The model which fired the event
	 * @param {Object} restriction The search restriction which is being applied
	 * @param {Boolean} subfolders True if subfolders will also be searched through
	 * @private
	 */
	onModelSearchStart : function(model, restriction, subfolders)
	{
		this.toggleComponents(false);
	},

	/**
	 * Event handler which will be called when the {@link #model} fires the
	 * {@link Zarafa.core.ContextModel#searchstop} event. This will update
	 * the UI to indicate that the search is not active and enable the
	 * components that a new search might be created.
	 *
	 * @param {Zarafa.core.ContextModel} model The model which fired the event
	 * @private
	 */
	onModelSearchStop : function(model)
	{
		var useSearchFolder = this.model.supportsSearchFolder();

		this.searchTextfield.reset();
		this.searchTextfield.doStop(false);
		this.toggleComponents(useSearchFolder);
	},

	/**
	 * Event handler which will be called when the {@link #model} fires the
	 * {@link Zarafa.core.ContextModel#searchfinished} event. This will update
	 * the UI to indicate that the search is no longer running and enable the
	 * components that a new search might be created.
	 *
	 * @param {Zarafa.core.ContextModel} model The model which fired the event
	 * @private
	 */
	onModelSearchFinished : function(model)
	{
		var useSearchFolder = this.model.supportsSearchFolder();

		this.searchTextfield.doStop(true);
		this.toggleComponents(useSearchFolder);
	},

	/**
	 * Event handler which will be called when the {@link #model} fires the
	 * {@link Zarafa.core.ContextModel#searchexception} event. This will
	 * show an error message indicating that the search has failed.
	 *
	 * @param {Zarafa.core.ContextModel} model The model which fired the event
	 * @param {Zarafa.core.data.IPMProxy} proxy object that received the error
	 * and which fired exception event.
	 * @param {String} type 'request' if an invalid response from server recieved,
	 * 'remote' if valid response received from server but with succuessProperty === false.
	 * @param {String} action Name of the action {@link Ext.data.Api.actions}.
	 * @param {Object} options The options for the action that were specified in the request.
	 * @param {Object} response response received from server depends on type.
	 * @param {Mixed} args
	 * @private
	 */
	onModelSearchException : function(model, proxy, type, action, options, response, args)
	{
		var useSearchFolder = this.model.supportsSearchFolder();

		this.searchTextfield.doStop(false);
		this.searchTextfield.focus();
		this.toggleComponents(useSearchFolder);
	}
});

Ext.reg('zarafa.searchbar', Zarafa.common.ui.SearchBar);
