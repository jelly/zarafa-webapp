Ext.namespace('Zarafa.plugins.files.settings');

/**
 * @class Zarafa.files.settings.SettingsFilesWidget
 * @extends Zarafa.settings.ui.SettingsWidget
 * @xtype Zarafa.plugins.files.settingsfileswidget
 *
 * The {@link Zarafa.settings.ui.SettingsWidget widget} for configuring
 * the general files options in the {@link Zarafa.files.settings.SettingsFilesCategory files category}.
 */
Zarafa.plugins.files.settings.SettingsFilesWidget = Ext.extend(Zarafa.settings.ui.SettingsWidget, {
	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config) {
		config = config || {};

		 // default backend selector
		var backendStore = {
			xtype : 'jsonstore',
			autoDestroy : true,
			fields : ['type', 'text'],
			data : [{
				text : _('Webdav'),
				type : 'webdav'
			}, {
				text : _('FTP'),
				type : 'ftp'
			}]
		};
		
		Ext.applyIf(config, {
			title : String.format(dgettext('plugin_files', 'General {0} settings'), container.getSettingsModel().get('zarafa/v1/plugins/files/button_name')),
			layout : 'form',
			items : [{
				xtype : 'textfield',
				name : 'zarafa/v1/contexts/files/server',
				ref : 'serverField',
				fieldLabel : dgettext('plugin_files', 'Server address'),
				emptyText : 'demo.files.org',
				anchor : '100%'
			},
			{
				xtype : 'textfield',
				name : 'zarafa/v1/contexts/files/port',
				ref : 'portField',
				fieldLabel : dgettext('plugin_files', 'Server port'),
				emptyText : '80',
				anchor : '100%'
			},
			{
				xtype : 'textfield',
				name : 'zarafa/v1/contexts/files/port_ssl',
				ref : 'portsslField',
				fieldLabel : dgettext('plugin_files', 'Server SSL port'),
				emptyText : '443',
				anchor : '100%'
			},
			{
				xtype : 'textfield',
				name : 'zarafa/v1/contexts/files/files_path',
				ref : 'pathField',
				fieldLabel : String.format(dgettext('plugin_files', 'Path to {0}'), container.getSettingsModel().get('zarafa/v1/plugins/files/button_name')),
				emptyText : '',
				anchor : '100%',
				validator: function(value) {
					if (/.*\/remote\.php\/webdav\/$|.*\/files\/webdav\.php\/$/g.test(value)) {
						return dgettext('plugin_files', 'No trailing slashes!');
					}
					
					return true;
				}
			},
			{
				xtype : 'checkbox',
				name : 'zarafa/v1/contexts/files/session_auth',
				ref : 'sessionAuth',
				fieldLabel : dgettext('plugin_files', 'Use Zarafa credentials for authentication'),
				lazyInit : false,
				listeners : {
					check : this.onCheck,
					scope : this
				}
			},
			{
				xtype : 'textfield',
				name : 'zarafa/v1/contexts/files/username',
				ref : 'usernameField',
				fieldLabel : dgettext('plugin_files', 'Username'),
				emptyText : 'test',
				anchor : '100%'
			},
			{
				xtype : 'textfield',
				name : 'zarafa/v1/contexts/files/password',
				ref : 'passwordField',
				inputType : 'password',
				fieldLabel : dgettext('plugin_files', 'Password'),
				emptyText : 'test',
				anchor : '100%'
			},
			{
				xtype : 'checkbox',
				name : 'zarafa/v1/contexts/files/use_ssl',
				ref : 'useSSL',
				fieldLabel : dgettext('plugin_files', 'Use SSL connections'),
				lazyInit : false,
				listeners : {
					check : this.onCheck,
					scope : this
				}
			},
			{
				xtype : 'combo',
				name : 'zarafa/v1/contexts/files/backend',
				ref : 'backendCombo',
				fieldLabel : dgettext('plugin_files', 'Backend to use'),
				store : backendStore,
				mode: 'local',
				triggerAction: 'all',
				displayField: 'text',
				valueField: 'type',
				lazyInit: false,
				forceSelection: true,
				editable: false,
				autoSelect: true,
				lazyInit : false
			}]
		});

		Zarafa.plugins.files.settings.SettingsFilesWidget.superclass.constructor.call(this, config);
	},

	/**
	 * Called by the {@link Zarafa.settings.ui.SettingsCategory Category} when
	 * it has been called with {@link zarafa.settings.ui.SettingsCategory#update}.
	 * This is used to load the latest version of the settings from the
	 * {@link Zarafa.settings.SettingsModel} into the UI of this category.
	 * @param {Zarafa.settings.SettingsModel} settingsModel The settings to load
	 */
	update : function(settingsModel) {
		this.model = settingsModel;
		this.serverField.setValue(settingsModel.get(this.serverField.name));
		this.portField.setValue(settingsModel.get(this.portField.name));
		this.portsslField.setValue(settingsModel.get(this.portsslField.name));
		this.pathField.setValue(settingsModel.get(this.pathField.name));
		this.sessionAuth.setValue(settingsModel.get(this.sessionAuth.name));
		this.usernameField.setValue(settingsModel.get(this.usernameField.name));
		this.passwordField.setValue(Zarafa.plugins.files.data.Helper.Base64.decode(settingsModel.get(this.passwordField.name)));
		this.useSSL.setValue(settingsModel.get(this.useSSL.name));
		this.backendCombo.setValue(settingsModel.get(this.backendCombo.name));
		
		if (settingsModel.get(this.useSSL.name) === true) {
			this.portsslField.show();
			this.portsslField.label.show();
			this.portField.hide();
			this.portField.label.hide();
		} else {
			this.portsslField.hide();
			this.portsslField.label.hide();
			this.portField.show();
			this.portField.label.show();
		}
		
		if (settingsModel.get(this.sessionAuth.name) === true) {
			this.usernameField.hide();
			this.usernameField.label.hide();
			this.passwordField.hide();
			this.passwordField.label.hide();
		} else {
			this.usernameField.show();
			this.usernameField.label.show();
			this.passwordField.show();
			this.passwordField.label.show();
		}
	},

	/**
	 * Called by the {@link Zarafa.settings.ui.SettingsCategory Category} when
	 * it has been called with {@link zarafa.settings.ui.SettingsCategory#updateSettings}.
	 * This is used to update the settings from the UI into the {@link Zarafa.settings.SettingsModel settings model}.
	 * @param {Zarafa.settings.SettingsModel} settingsModel The settings to update
	 */
	updateSettings : function(settingsModel) {
		// We must either set the requested subject, or the default subject
		var server	 = this.serverField.getValue()	 || this.serverField.emptyText;
		var port	 = this.portField.getValue()	 || this.portField.emptyText;
		var portssl	 = this.portsslField.getValue()	 || this.portsslField.emptyText;
		var path	 = this.pathField.getValue()	 || this.pathField.emptyText;
		var username = this.usernameField.getValue() || this.usernameField.emptyText;
		var password = this.passwordField.getValue() || this.passwordField.emptyText;
		var backend	 = this.backendCombo.getValue() || "webdav";
		
		settingsModel.beginEdit();
		settingsModel.set(this.serverField.name, server);
		settingsModel.set(this.portField.name, port);
		settingsModel.set(this.portsslField.name, portssl);
		settingsModel.set(this.pathField.name, path);
		settingsModel.set(this.sessionAuth.name, this.sessionAuth.getValue());
		settingsModel.set(this.usernameField.name, username);
		settingsModel.set(this.passwordField.name, Zarafa.plugins.files.data.Helper.Base64.encode(password));
		settingsModel.set(this.useSSL.name, this.useSSL.getValue());
		settingsModel.set(this.backendCombo.name, backend);
		settingsModel.endEdit();
		
		// also update the session to make sure we use the actual data
		// FIXME: this needs to be called after the store commit...
		container.getRequest().singleRequest(
			'filesmodule',
			'updatesession',
			{},
			new Zarafa.plugins.files.data.ResponseHandler({
				successCallback : this.updateSessionDone.createDelegate(this)
			})
		);
	},
	
	/**
	 * Updating session done =)
	 * @param {Object} response
	 * @private
	 */
	updateSessionDone : function(response) {
		if(response.status === true) {
			// this is needed, because the previous request is done before all data is saved -.-
			container.getRequest().singleRequest(
				'filesmodule',
				'updatesession',
				{},
				null
			);
			Zarafa.plugins.files.data.Actions.reloadNavigatorTree();
			container.getNotifier().notify('info.files', dgettext('plugin_files', 'Session updated!'), dgettext('plugin_files', 'Settings applied successfully.'));
		} else
			container.getNotifier().notify('error', dgettext('plugin_files', 'Session update failed!'), dgettext('plugin_files', 'Session update failed, please log in again.'));
	},	

	/**
	 * Event handler called when checkbox has been modified
	 *
	 * @param {Ext.form.CheckBox} checkbox Checkbox element from which the event originated
	 * @param {Boolean} checked State of the checkbox
	 * @private
	 */
	onCheck : function(checkbox, checked) {		
		if (checkbox.name === this.sessionAuth.name && checked) {
			this.usernameField.hide();
			this.usernameField.label.hide();
			this.passwordField.hide();
			this.passwordField.label.hide();
		} else if(checkbox.name === this.sessionAuth.name) {
			this.usernameField.show();
			this.usernameField.label.show();
			this.passwordField.show();
			this.passwordField.label.show();
		}
		
		if (checkbox.name === this.useSSL.name && checked) {
			this.portsslField.show();
			this.portsslField.label.show();
			this.portField.hide();
			this.portField.label.hide();
		} else if(checkbox.name === this.useSSL.name) {
			this.portsslField.hide();
			this.portsslField.label.hide();
			this.portField.show();
			this.portField.label.show();
		}
	}
});

Ext.reg('Zarafa.plugins.files.settingsfileswidget', Zarafa.plugins.files.settings.SettingsFilesWidget);
