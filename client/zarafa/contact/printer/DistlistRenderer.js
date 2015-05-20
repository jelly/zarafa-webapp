// -*- coding: utf-8; indent-tabs-mode: nil -*-
Ext.namespace('Zarafa.contact.printer');

/**
 * @class Zarafa.contact.printer.DistlistRenderer
 * @extends Zarafa.common.printer.renderers.RecordRenderer
 *
 * A printer for distribution lists using the same layout as for emails
 */
Zarafa.contact.printer.DistlistRenderer = Ext.extend(Zarafa.common.printer.renderers.RecordRenderer, {

	/**
	 * Generate the XTemplate HTML text for printing a single contact or distlist.
	 * @param {Zarafa.core.data.MAPIRecord} record The task item to print
	 * @return {String} The HTML for the XTemplate to print
	 */
	generateBodyTemplate: function(record) {
		var html = '';
		html += '<b>{fullname:htmlEncode}</b>\n';
		html += '<hr>\n';
		html += '<table>\n';
		html += this.optionalRow(_('Full Name'), 'display_name', '{display_name:htmlEncode}');
		html += '</table><br><p>\n';
		html += _('Members') + '\n';
		html += '<table>\n';
		html += '<tpl for="members">\n';
		html += this.addRow('', '{display_name:htmlEncodeUndef}');
		html += '</tpl>\n';
		html += '</table><br><p>\n';
		html += record.getBody(true);
		html += '</p>\n';
		return html;
	},

	/**
	 * Returns the data for the XTemplate used in generateBodyTemplate()
	 * @param {Zarafa.core.data.MAPIRecord} record The task item to print
	 * @return {Object} XTemplate data
	 */
	prepareData: function(record) {
		var data = Zarafa.contact.printer.DistlistRenderer.superclass.prepareData.apply(this, arguments);

		data.members = Ext.pluck(record.getMemberStore().getRange(), 'data');

		return data;
	}
});

