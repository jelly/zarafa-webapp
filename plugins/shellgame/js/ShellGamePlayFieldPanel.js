Ext.namespace('Zarafa.widgets.shellgame');

/**
 * @class Zarafa.widgets.shellgame.ShellGamePlayFieldPanel
 * @extends Ext.Container
 * 
 * This component supplies a the playfield and the in-game logic needed to play the Shell Game. 
 */
Zarafa.widgets.shellgame.ShellGamePlayFieldPanel = Ext.extend(Ext.Container, {
	/**
	 * @cfg {Number} moves Number of moves the cups make. (Defaults to 20)
	 */
	moves : 20,
	/**
	 * @cfg {Number} moveDuration The time in seconds it takes to move the cup to another position. 
	 * This is excluding the time it takes to move the cup forward or backward. That can be set in 
	 * {@link #moveCupToFrontDuration}. (Defaults to 0.3)
	 */
	moveDuration: .3,
	/**
	 * @cfg {Number} moveCupToFrontDuration The time in seconds it takes to move the cup forward or 
	 * backward before it can be moved to another position. After that it takes this number of 
	 * seconds to move the cup back in line. The time to move it to another position can be set in 
	 * {@link #moveDuration}. (Defaults to 0.05)
	 */
	moveCupToFrontDuration: .05,
	/**
	 * @cfg {Number} numCups Number of cups in the game. (Defaults to 3)
	 */
	numCups: 3,

	/**
	 * The index of the cup in the {@link #cups} list that contains the ball.
	 * @property
	 * @type Number
	 */
	cupContainingBallIndex: 1,
	/**
	 * List of X and Y coordinates from the top left position of the container. Each position is an 
	 * item in this array and consists of an array where the first item is the X coordinate and the 
	 * second item is the Y coordinate.
	 * @property
	 * @type Array
	 */
	positions: [],
	/**
	 * List of the {@link Ext.Element Ext.Elements} that are placed in the game
	 * @property
	 * @type Array
	 */
	cups: null,
	/**
	 * The {@link Ext.Element} of the ball.
	 * @property
	 * @type Ext.Element
	 */
	ball: null,
	/**
	 * @cfg {Number} liftCupDuration The time in seconds it takes to lift up the cup. It will take 
	 * the same amount of time to put the cup down again. (Defaults to 0.75)
	 */
	liftCupDuration: .75,

	/**
	 * @cfg {Number} leftOffset The left offset of the first cup. (Defaults to 25)
	 */
	leftOffset: 25,
	/**
	 * @cfg {Number} topOffset The top offset of all the cups. (Defaults to 50)
	 */
	topOffset: 50,
	/**
	 * @cfg {Number} cupWidth The width of a cup. (Defaults to 50)
	 */
	cupWidth: 50,
	/**
	 * @cfg {Number} cupMargin The margin between two cups. (Defaults to 25)
	 */
	cupMargin: 25,
	/**
	 * @cfg {Number} shuffleMoveOffset The offset the cup will move up or down when it moves forward
	 * or backward. (Defaults to 10)
	 */
	shuffleMoveOffset: 10,
	/**
	 * @cfg {Number} state The state of the game can be any value of the enum 
	 * {@link Zarafa.widgets.shellgame.ShellGameStates}.
	 */
	state: null,
	/**
	 * The list with switches that need to be made. Each item in this array consists of an array 
	 * that holds two different indexes of cups in the {@link #cups cups} list.
	 * @property
	 * @type Array
	 */
	switches: [],

	/**
	 * The X and Y coordintas of the container. These are necessary for the animations. The first 
	 * item contains the X coordinate and the second item the Y coordinate.
	 * @property
	 * @type Array
	 */
	topLeftContainerOffset: null,

	/**
	 * A list of sentences that are displayed when the player has won a round.
	 * @property
	 * @type Array
	 */
	winSentences: [],
	/**
	 * A list of sentences that are displayed when the player has lost a round.
	 * @property
	 * @type Array
	 */
	loseSentences: [],
	/**
	 * The sentence displayed to instruct the user to pick a cup.
	 * @property
	 * @type String
	 */
	pickYourCupSentence: _('Select the cup with the ball...'),
	/**
	 * The sentence displayed to instruct the user to watch the cups.
	 * @property
	 * @type String
	 */
	shufflingSentence: _('Watch the cups...'),
	
	/**
	 * The z-index used for the cups.
	 * @property
	 * @type Number
	 */
	cupZIndex: 3,
	/**
	 * The z-index used for the cup that is moved backwards when switching cups.
	 * @property
	 * @type Number
	 */
	cupShuffleZIndexBack: 2,
	/**
	 * The z-index used for the cup that is moved forward when switching cups.
	 * @property
	 * @type Number
	 */
	cupShuffleZIndexFront: 4,

	/**
	 * @constructor
	 * @param config Configuration structure
	 */
	constructor : function(config)
	{
		config = config || {};
		Ext.applyIf(config, {
			height: 175,
			autoEl : {
				tag: 'div',
				cls : 'x-widget-shellgame-playfield'
			}
		});

		this.addEvents(
			/**
			 * @event statechange
			 * Fires when the state of the game is changed.
			 * @param {Zarafa.widgets.shellgame.ShellGamePlayFieldPanel} playfield The panel of the playfield
			 * @param {Number} state The new State
			 */
			'statechange'
		);
		Zarafa.widgets.shellgame.ShellGamePlayFieldPanel.superclass.constructor.call(this, config);
	},

	/**
	 * Sets the cup template and the winning and losing sentences.
	 * @private
	 * @override
	 */
	initComponent: function(){
		this.cupTemplate = '<div class="x-widget-shellgame-cup"><div class="x-widget-shellgame-cup-logo"></div></div>';

		this.winSentences = [
			_('Winner, winner, chicken dinner!'),
			_('You are awesome!'),
			_('You are a fantastic human specimen!'),
			_('Another unbelievable win!'),
			_('Are you cheating?'),
			_('I just let you win this one.'),
			_('Well done!'),
			_('Are you going for a record?'),
			_('Have you played this game often?'),
			_('I think you need to get out more.'),
			_('There is something like too much practice.'),
			_('This just in: WOW!'),
			_('Amazing!'),
			_('What evil witchcraft is this?'),
			_('Maybe we should go faster.'),
			_('That took strength, perseverence and a whole lot of brains.'),
			_('Good going!'),
			_('Hard work pays off.'),
			_('You have a bright career ahead of you.'),
			_('Buddha would be proud.'),
			_('Kudos!'),
			_('This is a true example of how even you can accomplish something.'),
			_('I bow before your greatness.'),
			_('I always new you that you had it in you to be a true winner.'),
			_('Oh sorry, I was not paying attention. What happened?'),
			_('Was that a guess...?'),
			_('Maybe this was too easy. Try increasing the difficulty.'),
			_('Well on your way to becoming a pro!')
		];
		this.loseSentences = [
			_('That was bad!'),
			_('You had no idea, did you?'),
			_('That is probably not good for you ego'),
			_('Could you be anymore wrong?'),
			_('Maybe you should be doing this with transparent cups?'),
			_('I am not going to be bothered to comment about this one.'),
			_('That was pathetic.'),
			_('Even our testing monkeys got more guesses right than you.'),
			_('Maybe banging your head into the wall will help?'),
			_('Try to stop sniffing glue.'),
			_('You probably want someone else filling in your tax returns.'),
			_('You have got to be kidding me.'),
			_('Really? That one?'),
			_('WRONG!'),
			_('Maybe you are more of a Sudoku-person?'),
			_('Did I go too fast for you?'),
			_('Did the light get in your eye?'),
			_('Are you suffering from a "sports injury"?'),
			_('Guessing does not always work.'),
			_('Epic fail!'),
			_('That was embarrassing!'),
			_('Hope you did not waste too much blood, sweat and tears for this.'),
			_('You better not tell anyone about this embarressment.'),
			_('BURN!'),
			_('It is good that you did not play for money.'),
			_('Damn, why did I not ask for money?'),
			_('Was this another "practice" round?'),
			_('I did not know anyone could sink this low.'),
			_('LOSER!'),
			_('OOOOO, so close! Not really.'),
			_('I pity the fool!')
		];
		Zarafa.widgets.shellgame.ShellGamePlayFieldPanel.superclass.initComponent.apply(this, arguments);
	},

	/**
	 * Overriden to trigger the drawing of the game.
	 * @override
	 * @private
	 */
	onRender: function()
	{
		Zarafa.widgets.shellgame.ShellGamePlayFieldPanel.superclass.onRender.apply(this, arguments);
		
		this.drawGame();
	},

	/**
	 * Draws the playing field for the game and sets the references to elements needed during the 
	 * game. It creates the template based on the number of cups in the game and use that template 
	 * to create the HTMl for the game. After that it will search for the elements to store 
	 * references to them. The z-index and position index for the cups are set as well as the 
	 * registration to the click event. It will set a reference to the ball and hide it for now. At 
	 * the end it will change the state of the game to IDLE.
	 * @private
	 */
	drawGame: function()
	{
		var tpl = '';;
		for(var i=0;i<this.numCups;i++){
			tpl = tpl + this.cupTemplate;
		}
		this.masterTpl = new Ext.XTemplate(
			tpl,
			'<div class="x-widget-shellgame-ball"></div>',
			{
				// Format functions like capitalize in the Ext.util.Format are not 
				// used in this template anyways. Speeds up the apply time.
				disableFormats: true
			}
		);

		// Setup the HTML structure 
		this.masterTpl.overwrite(this.el);

		this.containerElem = Ext.get(this.el.dom);

		this.cups = [];
		this.positions = [];
		this.cupContainingBallIndex = Math.floor(this.numCups / 2);
		for(var i=0;i<this.numCups;i++){
			this.cups[i] = Ext.get(this.containerElem.dom.childNodes[i]);
			this.positions[i] = [
				// 25 is offset from left, 50 width of cup and 25 margin between two cups
				this.leftOffset + ( (this.cupWidth+this.cupMargin) * i),
				this.topOffset
			];
			this.cups[i].setLeftTop( this.positions[i][0], this.positions[i][1] );
			this.cups[i].positionIndex = i;
			this.cups[i].setStyle('z-index', this.cupZIndex);

			this.mon(this.cups[i], {
				scope: this,
				// By using createDelegate with the "[1]" argument we can pass the index of the 
				// selected cup to the chooseCup listener.
				"click": this.chooseCup.createDelegate(this, [i])
			});
		}

		this.ball = Ext.get(this.containerElem.dom.childNodes[this.numCups]);
		this.ball.setVisible(false);

		this.changeState(Zarafa.widgets.shellgame.ShellGameStates.IDLE);
	},

	/**
	 * Recalculates the position of this container element. It is need to recalculate that before 
	 * doing positioning and animations so because after resizing of dragging and dropping it might 
	 * need new coordinates. The positioning in the animations is done by using the cooridates from 
	 * the top left corner.
	 */
	calcTopLeftContainerOffset: function()
	{
		this.topLeftContainerOffset = {
			x: this.containerElem.getX(),
			y: this.containerElem.getY()
		};
	},

	/**
	 * Places the cups at the correct positions
	 */
	setupGame: function()
	{
		// Place cups
		for(var i=0;i<this.numCups;i++){
			this.cups[i].setLeftTop( this.positions[i][0], this.positions[i][1] );
			this.cups[i].positionIndex = i;
		}
	},

	/**
	 * Starts the game by placing the cups on the positions first and then triggering to show the 
	 * ball. After that we let it call the shuffle method to start the shuffle process.
	 */
	startGame: function()
	{
		if(this.state == Zarafa.widgets.shellgame.ShellGameStates.IDLE || this.state == Zarafa.widgets.shellgame.ShellGameStates.GUESS){
			this.changeState(Zarafa.widgets.shellgame.ShellGameStates.SHOW);
			this.setupGame();
			this.showBall(this.shuffle.createDelegate(this));
		}
	},

	/**
	 * Set the ball to the position supplied. It will look at the position coordinates of the cups 
	 * and based on the height and width of the ball and the cup position it at the bottom of the 
	 * correct cup.
	 */
	setBallToPosition: function(positionIndex)
	{
		var x = this.positions[positionIndex][0] + (this.cups[this.cupContainingBallIndex].getWidth() / 2) - (this.ball.getWidth() / 2);
		var y = this.positions[positionIndex][1] + (this.cups[this.cupContainingBallIndex].getHeight() - this.ball.getHeight());
		this.ball.setLeftTop( x, y );
	},

	/**
	 * Will set the ball at the correct position and move the cup up and down to show it. When a 
	 * callback has been supplied that will be passed to the last animation as callback.
	 * @param {Function} callback
	 */
	showBall: function(callback)
	{
		this.calcTopLeftContainerOffset();

		// Place ball
		this.setBallToPosition(this.cups[ this.cupContainingBallIndex ].positionIndex);
		this.ball.setVisible(true);

		var cupY = this.topLeftContainerOffset.y+ this.positions[ this.cups[2].positionIndex ][1];
		this.cups[this.cupContainingBallIndex].shift({
			// Lift cup up 10px above the ball
			y : cupY - this.ball.getHeight() - 10,
			concurrent: false,
			duration: this.liftCupDuration
		});
		this.cups[this.cupContainingBallIndex].shift({
			y : cupY,
			duration: this.liftCupDuration,
			concurrent: false,
			callback: callback
		});
	},

	/**
	 * Handles the selection of the cup by the user. It will show the correct win or lose sentence 
	 * and show under which cup the ball was.
	 */
	chooseCup: function(cup)
	{
		if(this.state == Zarafa.widgets.shellgame.ShellGameStates.GUESS){
			if(cup == this.cupContainingBallIndex){
				this.ownerCt.instructionLabel.setText(this.winSentences[ Math.floor(Math.random()*this.winSentences.length) ]);
			}else{
				this.ownerCt.instructionLabel.setText(this.loseSentences[ Math.floor(Math.random()*this.loseSentences.length) ]);
			}

			this.changeState(Zarafa.widgets.shellgame.ShellGameStates.SHOW);
			this.showBall(this.onEndGame.createDelegate(this));
		}
	},

	/**
	 * Starts the shuffle procedure. It will change the state of the game to 
	 * {@link Zarafa.widgets.shellgame.ShellGameStates#SHUFFLE SHUFFLE} and make a list of switches 
	 * that need to be done. That list is stored in {@link #switches} list. The {@link #shuffleStep}
	 * method is called to start doing the actual animations step by step.
	 */
	shuffle: function()
	{
		this.changeState(Zarafa.widgets.shellgame.ShellGameStates.SHUFFLE);
		this.calcTopLeftContainerOffset();

		// First remove ball before shuffling
		this.ball.setVisible(false);

		var switches, switchCups;
		this.switches = [];
		for(var i=0;i<this.moves;i++){
			switchCups = [];
			// Select two cups to switch
			while(switchCups.length < 2){
				var cupIndex = Math.floor(Math.random()*this.cups.length);
				if(switchCups.indexOf(cupIndex) == -1){
					switchCups.push(cupIndex);
				}
			}
			this.switches.push(switchCups);
		}
		this.shuffleStep();

		this.ownerCt.instructionLabel.setText(this.shufflingSentence);
	},

	/**
	 * Loops through the list of {@link #switches switches} and sets the animation for each switch. 
	 * Each call will only handle one switch. It will register itself as the callback of the last 
	 * animation of each step so it will be triggered to run the next animation as soon as the 
	 * previous one is finished. When all switches are done it will call {@link #onShuffleEnd}.
	 * @private
	 */
	shuffleStep: function()
	{
		if(this.switches.length == 0){
			this.onShuffleEnd();
			return;
		}

		var switchCups = this.switches.shift();

		var cup1 = this.cups[ switchCups[0] ];
		var cup2 = this.cups[ switchCups[1] ];
		var positionCup1 = this.positions[ cup1.positionIndex ];
		var positionCup2 = this.positions[ cup2.positionIndex ];
		cup1.setStyle('z-index', this.cupShuffleZIndexBack);
		cup2.setStyle('z-index', this.cupShuffleZIndexFront);
		// Move cups forward and backwards
		cup1.shift({
			y : this.topLeftContainerOffset.y + this.topOffset - this.shuffleMoveOffset,
			concurrent: false,
			duration: this.moveCupToFrontDuration
		});
		cup2.shift({
			y : this.topLeftContainerOffset.y + this.topOffset + this.shuffleMoveOffset,
			concurrent: false,
			duration: this.moveCupToFrontDuration
		});
		// Switch the cups from position
		cup1.shift({
			callback: function(cup1){
				cup1.setStyle('z-index', this.cupZIndex );
			}.createDelegate(this),
			x : this.topLeftContainerOffset.x + positionCup2[0],
			concurrent: false,
			duration: this.moveDuration
		});
		cup2.shift({
			callback: function(cup2){
				cup2.setStyle('z-index', this.cupZIndex );
			}.createDelegate(this),
			x : this.topLeftContainerOffset.x + positionCup1[0],
			concurrent: false,
			duration: this.moveDuration
		});
		// Move the two cups back into position
		cup1.shift({
			y : this.topLeftContainerOffset.y + this.topOffset,
			concurrent: false,
			duration: this.moveCupToFrontDuration
		});
		cup2.shift({
			callback: this.shuffleStep.createDelegate(this),
			y : this.topLeftContainerOffset.y + this.topOffset,
			concurrent: false,
			duration: this.moveCupToFrontDuration
		});
		// Reset the position index of both cups
		var tmp = cup1.positionIndex;
		cup1.positionIndex = cup2.positionIndex;
		cup2.positionIndex = tmp;
	},

	/**
	 * Called when the shuffling animations are done. It will change the state of the game to 
	 * {@link Zarafa.widgets.shellgame.ShellGameStates#GUESS GUESS} and change the instruction label
	 * to a text that instructs the player to pick a cup.
	 * @private
	 */
	onShuffleEnd: function()
	{
		this.changeState(Zarafa.widgets.shellgame.ShellGameStates.GUESS);
		this.ownerCt.instructionLabel.setText(this.pickYourCupSentence);
	},

	/**
	 * Called when the game is over. Usually this is done after the player has selected a cup and 
	 * the the result is shown. This function will change the state of the game to 
	 * {@link Zarafa.widgets.shellgame.ShellGameStates#IDLE IDLE}.
	 * @private
	 */
	onEndGame: function()
	{
		this.changeState(Zarafa.widgets.shellgame.ShellGameStates.IDLE);
	},

	/**
	 * Changes the state for the game and fires the {@link #statechange} event.
	 * @param {Number} newState A state from the {@link Zarafa.widgets.shellgame.ShellGameStates ShellGameStates}.
	 * @private
	 */
	changeState: function(newState)
	{
		this.state = newState;
		this.fireEvent('statechange', this, this.state);
	}
});
Ext.reg('zarafa.widget.shellgame.playfieldpanel', Zarafa.widgets.shellgame.ShellGamePlayFieldPanel);
