Ext.namespace('Zarafa.plugins.xmpp.ui');

/**
 * @class Zarafa.plugins.xmpp.ui.XmppRosterPanel
 * @extends Ext.DataView
 */
Zarafa.plugins.xmpp.ui.XmppRosterPanel = Ext.extend(Ext.grid.GridPanel, {
	
	constructor : function(config)
	{
		
		// Custom renderer for the icon column
		function iconRenderer(show, p, record)
		{
			var icon = {
				'online' : 'icon_xmpp_online',
				'offline' : 'icon_xmpp_offline',
				'away' : 'icon_xmpp_away',
				'xa' : 'icon_xmpp_away',
				'chat' : 'icon_xmpp_online',
				'dnd' : 'icon_xmpp_busy'
			}[show];
			
			p.css = icon;
			
			return '';
		}

		// Custom renderer for the name column
		function nameRenderer(value, p, record)
		{
			var status = record.data.status;
			var text = value;
			if (status) text += ' (' + status + ')';
			
			return text;
		}
		
		var view = new Ext.grid.GroupingView({
	        forceFit: true,
	        groupTextTpl: '{group}'
	    });		
		
		config = Ext.applyIf(config || {}, {
			
			layout : 'fit',
			
			tbar : {
				xtype : 'toolbar',
				layout : 'border',
				height : 24,
				items : [{
					xtype : 'trigger',
					region : 'center',
					ref : '../searchField',
					triggerClass : 'x-form-search-trigger',
					onTriggerClick : this.onSearchFieldTriggerClick.createDelegate(this),
					enableKeyEvents : true, 
					listeners :	{
						change : this.onSearchFieldChange,
			    		specialkey : this.onSearchFieldSpecialKey,
						scope : this
					}
				},{
		    		xtype : 'tbbutton',
					region : 'east',
					text: _('Show'),
					ref : '../statusToolbarItem',
					menu : this.statusMenu = new Ext.menu.Menu({
						items : [{
							text : 'Show offline',
							iconCls : 'icon_xmpp_offline',
							handler : function() { this.showOffline(true); },
							scope : this
						},{
							text : 'Show online',
							iconCls : 'icon_xmpp_online',
							handler : function() { this.showOffline(false); },
							scope : this
						}
						]
					})
				}]
			},
			
			// Column model
			cm: new Ext.grid.ColumnModel([
				{id:'JID', hidden: true, dataIndex: 'jid'},
				{
					header : '<p class="icon_xmpp_online">&nbsp;</p>',
					width : 24,
					fixed : true,
					dataIndex: 'show',
					renderer : iconRenderer
				},{
					header: "Group",
					dataIndex: 'group',
					hidden : true
				},{
					header: "Name",
					dataIndex: 'displayname',
					renderer : nameRenderer
				}]),				
				
			view : view,
			
			store : this.store = new Zarafa.plugins.xmpp.data.XmppRosterStore()
		});
		
		this.xmppPlugin = container.getPluginByName('xmpp');
		
		if (!this.xmppPlugin)
			throw 'XMPP plugin not found';

		// Call parent constructor
		Zarafa.plugins.xmpp.ui.XmppRosterPanel.superclass.constructor.call(this, config);
	},	
	
	/*
	 * Handles the search field 'change' event. 
	 */
	onSearchFieldChange : function(field)
	{
		this.store.setSearchString(field.getValue());
	},
	
	/*
	 * Handles the search field 'specialkey' event. Checks if the special key pressed is the
	 * enter key, and blurs the field if this is the case. The blur in turn will cause the 
	 * 'change' event to fire, which is handled by onSearchFieldChange.
	 */
	onSearchFieldSpecialKey : function(field, event)
	{
		if (event.getKey() == event.ENTER)
		{
			field.blur();
			this.store.setSearchString(field.getValue());
		}
	},
	
	/*
	 * Handles the search field trigger click event. 
	 */
	onSearchFieldTriggerClick : function(event)
	{
		this.store.setSearchString(this.searchField.getValue());
	},
	
	showOffline : function(show)
	{
		this.store.setShowOffline(show);
	}
	
});
