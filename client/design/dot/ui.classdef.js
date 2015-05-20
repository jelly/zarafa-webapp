Class('Container', {
	
	plugins : Property('Plugin[]', false),
	
	getPluginByName : Method('Plugin', [ Argument('name', 'String') ]),
	registerPlugin : Method('Void', [ Argument('plugin', 'Plugin') ]),
	populateInsertionPoint : Method('Void', [ Argument('insertionPoint', 'String') ])
	
});

Class('Plugin', {

	name : Property('String', false),

	getName : Method('String'),
	
	registerInsertionPoint : Method('Void', [ Argument('match', 'Mixed') , Argument('createFunction', 'Function'), Argument('scope','Object') ] )

});

Class('Context', {

	createToolBar : Method('Ext.ToolBar'),
	createContentPanel : Method('Ext.Panel')
	
}, 'Plugin');

/*
Class('ContentContext', {

	toolbar : Property('Ext.Toolbar', false),
	contentPanel : Property('Ext.Panel', false),

	createToolbar : Method('Ext.Toolbar', [] , false),
	createContentPanel : Method('Ext.Panel', [] , false),
	enable : Method('Void', [ Argument('parameters', 'Object') ]),
	disable : Method('Void'),
	bid : Method('Number', [ Argument('parameters', 'Object') ])
	
}, 'Context');

Class('PluginContext', {
}, 'Context');

Class('SugarCRMPlugin', {
}, 'PluginContext');

Class('MailContext', {
}, 'ContentContext');
*/
/*
Class('TaskContext', {
}, 'ContentContext');
*/

dump();
