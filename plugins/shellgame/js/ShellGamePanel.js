Ext.namespace('Zarafa.widgets.shellgame');

/**
 * @class Zarafa.widgets.shellgame.ShellGamePanel
 * @extends Ext.Container
 * 
 * This component holds shows the playfield and implements the controls and instruction label for 
 * the Shell Game.
 */
Zarafa.widgets.shellgame.ShellGamePanel = Ext.extend(Ext.Container, {
	/**
	 * The reference to the instruction label.
	 * @property
	 * @type Ext.Label
	 */
	instructionLabel: undefined,
	/**
	 * The reference to the playfield of the game.
	 * @property
	 * @type Zarafa.widget.shellgame.ShellGamePlayFieldPanel
	 */
	playfield: undefined,
	/**
	 * The reference to the sliderfield that allows to modify the number of moves.
	 * @property
	 * @type Ext.form.SliderField
	 */
	movesSliderfield: undefined,
	/**
	 * The reference to the button that allows to remove a cup.
	 * @property
	 * @type Ext.Button
	 */
	removeCupBtn: undefined,
	/**
	 * The reference to the button that allows to add a cup.
	 * @property
	 * @type Ext.button
	 */
	addCupBtn: undefined,

	/**
	 * @constructor
	 * @param config Configuration structure
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, { 
			items: [{
				height: 40,
				items: [{
					xtype: 'label',
					text: _('Click shuffle to start the game!'),
					ref: '../instructionLabel',
					style: 'text-align: center; width: 100%;',
					handler: function()
					{
						this.ownerCt.playfield.startGame();
					}
				}]
			},{
				xtype: 'zarafa.widget.shellgame.playfieldpanel',
				ref: 'playfield'
			},{
				xtype: 'button',
				text: _('Shuffle!'),
				handler: function()
				{
					this.ownerCt.playfield.startGame();
				}
			},{
				xtype: 'zarafa.compositefield',
				hideLabel: true,
				items: [{
					xtype: 'label',
					width: 50,
					text: _('Speed:')
				},{
					xtype: 'sliderfield',
					width: 100,
					onChange: this.onChangeSpeed.createDelegate(this),
					listeners: {
						afterrender: this.onAfterRenderSpeed,
						scope: this
					}
				}]
			},{
				xtype: 'zarafa.compositefield',
				hideLabel: true,
				items: [{
					xtype: 'label',
					width: 50,
					text: _('Moves:')
				},{
					xtype: 'sliderfield',
					width: 150,
					ref: '../movesSliderfield',
					onChange: this.onChangeMoves.createDelegate(this),
					listeners: {
						afterrender: this.onAfterRenderMoves,
						scope: this
					}
				}]
			},{
				xtype: 'container',
				layout: 'hbox',
				align: 'stretch',
				items: [{
					xtype: 'button',
					text: _('Remove a cup'),
					ref: '../removeCupBtn',
					handler: this.onRemoveCup,
					scope: this
				},{
					xtype: 'spacer',
					height: 1,
					width: 10
				},{
					xtype: 'button',
					text: _('Add a cup'),
					ref: '../addCupBtn',
					handler: this.onAddCup,
					scope: this
				}]
			}]
		});

		Zarafa.widgets.shellgame.ShellGamePanel.superclass.constructor.call(this, config);

		this.on('afterlayout', this.onAfterRender, this);
	},

	/**
	 * Called after the speed sliderfield is rendered to setup the minimum and maximum values. It 
	 * will also get the current value of the playfield speed setting and converts it to a value 
	 * that you can see on a scale from 1 to 10.
	 * @param {Ext.form.SliderField} fld The sliderfield used to change the speed
	 * @private
	 */
	onAfterRenderSpeed: function(fld)
	{
		fld.setMinValue(1);
		fld.setMaxValue(10);
		fld.setValue((this.playfield.moveDuration - 0.05) / 0.05);
	},
	/**
	 * Called after the moves sliderfield is rendered to setup the minimum and maximum values. It 
	 * will also get the current value of the playfield move setting and set that as value in the 
	 * sliderfield.
	 * @param {Ext.form.SliderField} fld The sliderfield used to change the number of moves
	 * @private
	 */
	onAfterRenderMoves: function(fld)
	{
		fld.setMinValue(1);
		fld.setMaxValue(100);
		fld.setValue(this.playfield.moves);
	},
	/**
	 * Called when the users changes the speed by moving the slider. It will convert the value of 
	 * the sliderfield to a time in seconds.
	 * @param {Ext.form.SliderField} fld The sliderfield used to change the speed
	 * @private
	 */
	onChangeSpeed: function(fld, newVal, oldVal)
	{
		// 1 will become 0.1 and 11 will become 0.55, with 0.05 increments
		this.playfield.moveDuration = 0.05*(11-newVal)+0.05;
	},
	/**
	 * Called when the user changes the number of moves by moving the slider. It will change the 
	 * number of moves in the playfield.
	 * @param {Ext.form.SliderField} fld The sliderfield used to change the number of moves
	 * @private
	 */
	onChangeMoves: function(fld, newVal, oldVal)
	{
		this.playfield.moves = newVal;
	},
	/**
	 * Called when the user wants to remove a cup. It will change the number of cups in the 
	 * playfield and then redraw the game.
	 * @param {Ext.Button} btn The button to remove a cup
	 * @private
	 */
	onRemoveCup: function(btn)
	{
		if(this.playfield.numCups > 3){
			this.playfield.numCups--;
			this.playfield.drawGame();
		}
		this.checkStatusButtons();
	},
	/**
	 * Called when the user wants to add a cup. It will change the number of cups in the playfield 
	 * and then redraw the game.
	 * @param {Ext.Button} btn The button to add a cup
	 * @private
	 */
	onAddCup: function(btn)
	{
		if(this.playfield.numCups < 6){
			this.playfield.numCups++;
			this.playfield.drawGame();
		}
		this.checkStatusButtons();
	},
	/**
	 * Called to check whether the buttons to add or remove a cup and the sliderfield to change the
	 * number of moves should be enabled or not. If the game is not in idle mode then the buttons 
	 * should be disabled. Also when the number of cups is on the minimum (3) and maximum (6) values
	 * the add or remove button should be disabled accordingly.
	 * @private
	 */
	checkStatusButtons: function()
	{
		if(this.playfield.state == Zarafa.widgets.shellgame.ShellGameStates.IDLE && this.playfield.numCups > 3){
			this.removeCupBtn.enable();
		}else{
			this.removeCupBtn.disable();
		}
		if(this.playfield.state == Zarafa.widgets.shellgame.ShellGameStates.IDLE && this.playfield.numCups < 6){
			this.addCupBtn.enable();
		}else{
			this.addCupBtn.disable();
		}
		if(this.playfield.state == Zarafa.widgets.shellgame.ShellGameStates.IDLE){
			this.movesSliderfield.enable();
		}else{
			this.movesSliderfield.disable();
		}
	},
	/**
	 * Called after the component is rendered to check what buttons should be enabled. It will also 
	 * register to the {@link Zarafa.widgets.shellgame.ShellGamePlayFieldPanel#statechange statechange}
	 * event.
	 * @private
	 */
	onAfterRender: function()
	{
		this.checkStatusButtons();

		this.mon(this.playfield, 'statechange', this.onPlayfieldStateChange, this);
	},
	/**
	 * Called when the playfield triggers a {@link Zarafa.widgets.shellgame.ShellGamePlayFieldPanel#statechange statechange}
	 * event. It will check whether the buttons should be enabled or disabled.
	 * @private
	 */
	onPlayfieldStateChange: function()
	{
		this.checkStatusButtons();
	}
});
Ext.reg('zarafa.widget.shellgamepanel', Zarafa.widgets.shellgame.ShellGamePanel);

