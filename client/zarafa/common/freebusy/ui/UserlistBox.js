Ext.namespace('Zarafa.common.freebusy.ui');

/**
 * @class Zarafa.common.freebusy.ui.UserlistBox
 * @extends Zarafa.common.recipientfield.ui.RecipientBox
 * @xtype zarafa.userlistbox
 *
 * Extension of the {@link Zarafa.common.recipientfield.ui.RecipientBox RecipientBox}
 * which must be used in the {@link Zarafa.common.freebusy.ui.UserlistView} where
 * the users are listed
 */
Zarafa.common.freebusy.ui.UserlistBox = Ext.extend(Zarafa.common.recipientfield.ui.RecipientBox, {

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			btnCls : 'x-freebusy-userrow-remove',
			btnHoverCls : 'x-freebusy-userrow-remove-hover'
		});

		Zarafa.common.freebusy.ui.UserlistBox.superclass.constructor.call(this, config);
	},

	/**
	 * Function which can be overriden to provide custom icon rendering for the given {@link Ext.data.Record}
	 * to the {@link #iconEl} element. The string returned here is the CSS class which will be set on the
	 * {@link #iconEl}.
	 * @param {Ext.data.Record} record The record which is going to be rendered
	 * @return {String} The CSS class which must be applied to the {@link #iconEl}.
	 * @private
	 */
	prepareIcon : function(record)
	{
		switch (record.get('recipient_type')) {
			case Zarafa.core.mapi.RecipientType.MAPI_CC:
				return 'x-freebusy-userlist-recipienttype-optional';
			case Zarafa.core.mapi.RecipientType.MAPI_BCC:
				return 'x-freebusy-userlist-recipienttype-resource';
			case Zarafa.core.mapi.RecipientType.MAPI_TO:
			default:
				if(record.isMeetingOrganizer()) {
					return 'x-freebusy-userlist-recipienttype-originator';
				}
				return 'x-freebusy-userlist-recipienttype-required';
		}
	},

	/**
	 * Function called after the {@link #render rendering} of this component.
	 * This will hide the {@link #delBtnEl} when the {@link #editable} flag is false
	 * @param {Ext.Container} ct The container in which the component is being rendered.
	 * @private.
	 */
	afterRender : function(ct)
	{
		Zarafa.common.freebusy.ui.UserlistBox.superclass.afterRender.call(this, ct);
		this.delBtnEl.setVisible(this.editable);
	},

	/**
	 * Update the {@link #textEl inner HTML} of this component using the {@link #textTpl template}.
	 * @param {Ext.data.Record} record The Ext.data.Record which data must be applied to the template
	 */
	update: function(record)
	{
		if (record.isMeetingOrganizer()) {
			this.setEditable(false);
		}

		// className is contains css classes for different type of attendee's icon element.
		var className = ['x-freebusy-userlist-recipienttype-required',
			'x-freebusy-userlist-recipienttype-optional',
			'x-freebusy-userlist-recipienttype-resource'];

		// Clear the css class of attendee's icon element which is defined attendee's type.
		this.iconEl.removeClass(className);

		Zarafa.common.freebusy.ui.UserlistBox.superclass.update.apply(this, arguments);
	}
});

Ext.reg('zarafa.userlistbox', Zarafa.common.freebusy.ui.UserlistBox);
