Ext.namespace('Zarafa.common.rules.dialogs');

/**
 * @class Zarafa.common.rules.dialogs.ImportanceLink
 * @extends Ext.Container
 * @xtype zarafa.importancelink
 *
 * Condition component for the {@link Zarafa.common.rules.data.ConditionFlags#IMPORTANCE IMPORTANCE}
 * condition. This will allow the user to select the preferred importance and can generate a proper
 * condition for it.
 */
Zarafa.common.rules.dialogs.ImportanceLink = Ext.extend(Ext.Container, {

	/**
	 * The Condition type which is handled by this view
	 * This is set during {@link #setCondition}.
	 * @property
	 * @type Zarafa.common.rules.data.ConditionFlags
	 */
	conditionFlag : undefined,

	/**
	 * The condition property which was configured during
	 * {@link #setCondition}.
	 * @property
	 * @type Object
	 */
	condition : undefined,

	/**
	 * True if the condition was modified by the user, if this is false,
	 * then {@link #getCondition} will return {@link #condition} instead
	 * of returning a new object.
	 * @property
	 * @type Boolean
	 */
	isModified : false,

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			items : [{
				xtype : 'combo',
				ref : 'importanceCombo',
				width : 100,
				store : {
					xtype : 'jsonstore',
					fields : [ 'name', 'value' ],
					data : Zarafa.common.data.ImportanceFlags.flags
				},
				mode : 'local',
				triggerAction : 'all',
				displayField : 'name',
				valueField : 'value',
				lazyInit : false,
				forceSelection : true,
				editable : false,
				listeners : {
					select : function() { this.isModified = true; },
					scope : this
				}
			}]
		});

		Zarafa.common.rules.dialogs.ImportanceLink.superclass.constructor.call(this, config);
	},

	/**
	 * Apply an action onto the DataView, this will parse the condition and show
	 * the contents in a user-friendly way to the user.
	 * @param {Zarafa.common.rules.data.ConditionFlags} conditionFlag The condition type
	 * which identifies the exact type of the condition.
	 * @param {Object} condition The condition to apply
	 */
	setCondition : function(conditionFlag, condition)
	{
		var importance = Zarafa.core.mapi.Importance['NORMAL'];

		if (condition) {
			importance = condition[1][Zarafa.core.mapi.Restrictions.VALUE]['PR_IMPORTANCE'];
		}

		this.conditionFlag = conditionFlag;
		this.condition = condition;
		this.isModified = !Ext.isDefined(condition);

		this.importanceCombo.setValue(importance);
	},

	/**
	 * Obtain the condition as configured by the user
	 * @return {Object} The condition
	 */
	getCondition : function()
	{
		if (this.isModified !== true) {
			return this.condition;
		}

		var RestrictionFactory = Zarafa.core.data.RestrictionFactory;
		var Restrictions = Zarafa.core.mapi.Restrictions;
		var value = this.importanceCombo.getValue();

		return RestrictionFactory.dataResProperty('PR_IMPORTANCE', Restrictions.RELOP_EQ, value);
	}
});

Ext.reg('zarafa.importancelink', Zarafa.common.rules.dialogs.ImportanceLink);
