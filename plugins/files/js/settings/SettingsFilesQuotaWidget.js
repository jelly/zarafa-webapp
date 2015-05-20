Ext.namespace('Zarafa.plugins.files.settings');

/**
 * @class Zarafa.files.settings.SettingsFilesQuotaWidget
 * @extends Zarafa.settings.ui.SettingsWidget
 * @xtype Zarafa.plugins.files.settingsfilesquotawidget
 *
 * The {@link Zarafa.settings.ui.SettingsWidget widget} for configuring
 * the general files options in the {@link Zarafa.files.settings.SettingsFilesCategory files category}.
 */
Zarafa.plugins.files.settings.SettingsFilesQuotaWidget = Ext.extend(Zarafa.settings.ui.SettingsWidget, {
	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config) {
		config = config || {};
		
		Ext.applyIf(config, {
			title : dgettext('plugin_files', 'Quota information'),
			layout : 'form',
			items :[{
				xtype : 'zarafa.plugins.files.quotabar',
				width : 400,
				hidden: true,
				ref : 'quotaBar',
				storeSize : 0,
				warnQuota : 0,
				hardQuota : 0
			},{
				xtype : 'displayfield',
				width : 400,
				hideLabel : true,
				ref : 'unavailableQuotaInfo',
				hidden: true,
				value : dgettext('plugin_files', 'Quota information is not available.')
			},{
				xtype : 'displayfield',
				hideLabel : true,
				width : 400,
				ref : 'quotaInfo'
			}]
		});

		Zarafa.plugins.files.settings.SettingsFilesQuotaWidget.superclass.constructor.call(this, config);
		
		this.on('afterrender', this.updateQuotaInfo, this);
	},
	
	/**
	 * Function sets information in quota bar widget,
	 * it updates quota bar and information string aswell.
	 * @private
	 */
	updateQuotaInfo : function()
	{
		var storeSize = Zarafa.plugins.files.data.Dynamics.getCurrentStoreSize();
		var hardQuota = storeSize + Zarafa.plugins.files.data.Dynamics.getAvailableStoreSize();
		var warnQuota = hardQuota - 100 * 1024; // Warnquota is 100MB below hard Quota.;

		// Create quota-info string to display in displayfield.
		var quotaInfo = String.format(dgettext('plugin_files', '{0} of disk space is used.'), Ext.util.Format.fileSize(storeSize));
		var quotaInfoHTML = '<span class="zarafa-quota-string">' + quotaInfo + '</span>';

		if(hardQuota && hardQuota > 0) {
			// If hard quota is set then show quotabar.
			this.quotaBar.setStoreSize(storeSize);
			this.quotaBar.setHardQuota(hardQuota);
			this.quotaBar.setWarnQuota(warnQuota);
			
			this.quotaBar.setVisible(true);
			this.unavailableQuotaInfo.setVisible(false);

			// Add hard quota info in quota-info string.
			quotaInfo = this.getQuotaSuggestionString(hardQuota, storeSize);
			this.quotaInfo.setVisible(true);
			if(!Ext.isEmpty(quotaInfo)) {
				quotaInfoHTML += ' ' + quotaInfo;
			}
		} else {
			// If any of the hard quota is not set then show message.
			this.quotaBar.setVisible(false);
			this.quotaInfo.setVisible(false);
			this.unavailableQuotaInfo.setVisible(true);
		}

		this.quotaInfo.setValue(quotaInfoHTML);
	},
	
	/**
	 * Function returns info/warning message according to
	 * store's usage and quota information.
	 * @param {Int} hardQuota hard quota limit for user
	 * @param {Int} storeSize size of user's store
	 * @return {String} info/warning message.
	 * @private
	 */
	getQuotaSuggestionString : function(hardQuota, storeSize)
	{
		if(!Ext.isDefined(storeSize))
			return;

		if (hardQuota && storeSize > hardQuota) {
			return String.format(dgettext('plugin_files', 'You have exceeded quota ({0}), you can not store more files on the server.'), Ext.util.Format.fileSize(hardQuota));
		} else if (hardQuota && storeSize < hardQuota) {
			return String.format(dgettext('plugin_files', "At {0} you won't be able to store files on the server."), Ext.util.Format.fileSize(hardQuota));
		}
	}
});

Ext.reg('Zarafa.plugins.files.settingsfilesquotawidget', Zarafa.plugins.files.settings.SettingsFilesQuotaWidget);
