Ext.namespace('Zarafa.widgets.shellgame');

/**
 * @class Zarafa.widgets.shellgame.ShellGameStates
 * 
 * An enum that contains all possible States for the Shell Game. 
 * 
 * @singleton
 */
Zarafa.widgets.shellgame.ShellGameStates =
{
	/**
	 * The state in which the game is idle.
	 * @property
	 * @type Number
	 */
	IDLE    : 1,

	/**
	 * The state in which the game is shuffling the cups.
	 * @property
	 * @type Number
	 */
	SHUFFLE : 2,

	/**
	 * The state in which the game is waiting for the player to guess.
	 * @property
	 * @type Number
	 */
	GUESS   : 3,

	/**
	 * The state in which the game is showing the ball under the cup.
	 * @property
	 * @type Number
	 */
	SHOW    : 4
};