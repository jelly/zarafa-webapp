Ext.namespace('Zarafa.common.recipientfield.ui');

/**
 * @class Zarafa.common.recipientfield.ui.RecipientBox
 * @extends Zarafa.common.ui.Box
 * @xtype zarafa.recipientbox
 *
 * Extension to the normal {@link Zarafa.common.ui.Box} which must be used
 * together with the {@link Zarafa.common.recipientfield.ui.RecipientField RecipientField}.
 * This box offers some extra functionality concerning the displaying of recipients.
 */
Zarafa.common.recipientfield.ui.RecipientBox = Ext.extend(Zarafa.common.ui.Box, {
	/**
	 * @cfg {String} validCls The CSS class which must be applied on {@link #el}
	 * when the recipient is {@link #isValidRecord}.
	 */
	validCls : 'x-zarafa-boxfield-recipient-item-resolved',

	/**
	 * @cfg {String} ambiguousCls The CSS class which must be applied on {@link #el}
	 * when the recipient is ambiguous
	 */
	ambiguousCls : 'x-zarafa-boxfield-recipient-item-ambiguous',

	/**
	 * @cfg {String} pendingCls The CSS clas which must be applied on {@link #el}
	 * when the recipient is pending resolving.
	 */
	pendingCls: 'x-zarafa-boxfield-recipient-item-pending',

	/**
	 * @cfg {String} invalidCls The CSS class which must be applied on {@link #el}
	 * when the recipient is invalid.
	 */
	invalidCls: 'x-zarafa-boxfield-recipient-item-invalid',

	/**
	 * @constructor
	 * @param config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			cls: 'x-zarafa-boxfield-recipient-item',
			textTpl :
				'<tpl if="!Ext.isEmpty(values.display_name)">' +
					'{display_name:htmlEncodeElide(this.ellipsisStringStartLength, this.ellipsisStringEndLength)}' +
				'</tpl>'
		});

		Zarafa.common.recipientfield.ui.RecipientBox.superclass.constructor.call(this, config);
	},

	/**
	 * Function which can be overriden to provide custom formatting for the given {@link Ext.data.Record}
	 * to the {@link #update} function. The data object returned here is used by the {@link #textTpl template}
	 * to render the contents of the box.
	 * @param {Ext.data.Record} record The record which is going to be rendered
	 * @return {Object} The data object which can be passed to {@link #textTpl}.
 	 * @private
	 */
	prepareData: function(record)
	{
		var prepared = {};

		prepared.display_name = record.get('display_name');
		prepared.smtp_address = record.get('smtp_address') || record.get('email_address');
		prepared.object_type = record.get('object_type');
		prepared.entryid = record.get('entryid');

		return prepared;
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
		if (record.isResolved() || (record.attemptedToResolve() && record.isValidSMTP())) {
			return Zarafa.common.recipientfield.ui.RecipientBox.superclass.prepareIcon.apply(this, arguments);
		}
	},

	/**
	 * Check if the given {@link Ext.data.Record record} is valid. This function can be
	 * overridden by the childclasses to indicate if the given record is valid.
	 *
	 * This class will check if the given record is {@link Zarafa.core.data.IPMRecipientRecord#isResolved resolved},
	 * or if the user is a valid {@link Zarafa.core.data.IPMRecipientRecord#isValidSMTP SMTP address}.
	 *
	 * @param {Zarafa.core.data.IPMRecipientRecord} record The record to check
	 * @return {Boolean} True if the record is valid
	 * @protected
	 */
	isValidRecord : function(record)
	{
		return record.isResolved() || record.attemptedToResolve() && record.isValidSMTP();
	},

	/**
	 * Update the {@link #textEl inner HTML} of this component using the {@link #textTpl template}.
	 * @param {Ext.data.Record} record The Ext.data.Record which data must be applied to the template
	 */
	update: function(record)
	{
		Zarafa.common.recipientfield.ui.RecipientBox.superclass.update.apply(this, arguments);

		// Valid recipients are those that have been resolved, or those that could
		// not be resolved but at least have an valid SMTP address.
		if (this.isValidRecord(record)) {
			this.el.removeClass(this.invalidCls);
			this.el.removeClass(this.pendingCls);
			this.el.removeClass(this.ambiguousCls);
			this.el.addClass(this.validCls);
		} else if (record.isAmbiguous()) {
			this.el.removeClass(this.invalidCls);
			this.el.removeClass(this.pendingCls);
			this.el.addClass(this.ambiguousCls);
			this.el.removeClass(this.validCls);
		} else if (!record.isResolved() && !record.attemptedToResolve()) {
			this.el.removeClass(this.invalidCls);
			this.el.addClass(this.pendingCls);
			this.el.removeClass(this.ambiguousCls);
			this.el.removeClass(this.validCls);
		} else {
			this.el.addClass(this.invalidCls);
			this.el.removeClass(this.pendingCls);
			this.el.removeClass(this.ambiguousCls);
			this.el.removeClass(this.validCls);
		}
	}
});

Ext.reg('zarafa.recipientbox', Zarafa.common.recipientfield.ui.RecipientBox);
