Ext.namespace('Zarafa.widgets.clockwidget');

/**
 * @class Zarafa.widgets.clockwidget.ClockWidget
 * @extends Zarafa.core.ui.widget.Widget
 */
Zarafa.widgets.clockwidget.ClockWidget = Ext.extend(Zarafa.core.ui.widget.Widget, {

	/**
	 * The {@link Ext.util.TaskRunner task} which is used to frequently
	 * {@link #drawHands update} the {@link #handsCanvas} with the new time.
	 * @property
	 * @type Ext.util.TaskRunner
	 * @private
	 */
	updateTask : undefined,

	/**
	 * The X coordinate of the center of the clock
	 * @property
	 * @type Number
	 * @private
	 */
	centerX : undefined,

	/**
	 * The Y coordinate of the center of the clock
	 * @property
	 * @type Number
	 * @private
	 */
	centerY : undefined,

	/**
	 * The radius for the clock circle
	 * @property
	 * @type Number
	 * @private
	 */
	radius : undefined,

	/**
	 * @cfg {Number} margins The minimum margins between the clock
	 * and the size of the {@link #body} element.
	 */
	margins : 5,

	/**
	 * @cfg {Number} borderWidth The width for the outer border
	 * of the clockface.
	 */
	borderWidth : 8,

	/**
	 * @cfg {Number} lineWidth The width for the lines in the clock
	 */
	lineWidth : 1,

	/**
	 * The Canvas {@link Ext.Element element} on which the clock face
	 * will be rendered.
	 * @property
	 * @type Ext.Element
	 * @private
	 */
	clockCanvas : undefined,

	/**
	 * The Canvas {@link Ext.Element element} on which the clock hands
	 * will be rendered.
	 * @property
	 * @type Ext.Element
	 * @private
	 */
	handsCanvas : undefined,

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, { 
			height : 260
		});

		Zarafa.widgets.clockwidget.ClockWidget.superclass.constructor.call(this, config);
	},

	/**
	 * Called when the component has been rendered. This will also render the
	 * {@link #clockCanvas} and {@link #handsCanvas} elements.
	 * @private
	 */
	onRender  : function()
	{
		Zarafa.widgets.clockwidget.ClockWidget.superclass.onRender.apply(this, arguments);

		this.clockCanvas = this.body.createChild({
			tag : 'canvas',
			style : 'position: absolute;'
		});

		this.handsCanvas = this.body.createChild({
			tag : 'canvas',
			style : 'position: absolute;'
		});
	},

	/**
	 * Initialize the events for this component.
	 * {@link Ext.TaskMgr#start Creates} the {@link #updateTask} timer for periodically
	 * calling {@link #drawHands}.
	 * @private
	 */
	initEvents : function()
	{
		Zarafa.widgets.clockwidget.ClockWidget.superclass.initEvents.apply(this, arguments);

		this.updateTask = Ext.TaskMgr.start({
			run: this.drawHands,
			interval: 500,
			scope: this
		});

		this.mon(this, 'bodyresize', this.redrawClock, this, { buffer : 5 });
		this.mon(this, 'expand', this.redrawClock, this);
	},

	/**
	 * Event handler for the events which require the entire clock to be redrawn,
	 * this will {@link #calculatePosition reposition} the clock and will then
	 * {@link #drawClock redraw} it.
	 * @private
	 */
	redrawClock : function()
	{
		this.calculatePosition();
		this.drawClock();
	},

	/**
	 * This will recalculate the {@link #centerX} and {@link #centerY} coordinates
	 * as well as the new {@link #radius}. It will then {@link #drawClock redraw the clock}.
	 * @private
	 */
	calculatePosition : function()
	{
		// The body is smaller then the dimensions of the entire panel.
		var width = this.body.getWidth();
		var height = this.body.getHeight();

		// Recalculate the position of the clock
		this.centerX = Math.round(width / 2) + (this.lineWidth / 2);
		this.centerY = Math.round(height / 2) + (this.lineWidth / 2);
		this.radius = Math.min(this.centerX, this.centerY) - this.margins;
	},

	/**
	 * Draw the entire clock. This calls {@link #drawBackground}, {@link #drawLabels}
	 * and {@link #drawHands}.
	 * @private
	 */
	drawClock : function()
	{
		this.drawBackground();
		this.drawLabels();
		this.drawHands();
	},

	/**
	 * Draw the background image which contains the clock fase and the border
	 * on the {@link #clockCanvas}.
	 * @private
	 */
	drawBackground : function()
	{
		if (!this.isWidgetVisible() || this.collapsed) {
			return;
		}

		var canvas = this.clockCanvas;
		var gradient;

		// Reset contents
		Zarafa.resizeCanvas(canvas, this.body.getWidth(), this.body.getHeight());

		// Initialize rendering
		var context = canvas.dom.getContext('2d');
		context.save();

		// Define the outer area
		context.circle(this.centerX, this.centerY, this.radius);

		// Draw the outer border
		context.lineWidth = this.lineWidth;
		context.strokeStyle = '#000000';
		context.stroke();

		// Fill the area with the border gradient
		gradient = context.createLinearGradient(0, 0, 0, this.radius * 2);
		gradient.addColorStop(0, '#9f9f9f');
		gradient.addColorStop(0.2, '#afafaf');
		gradient.addColorStop(0.8, '#efefef');
		gradient.addColorStop(1, '#9f9f9f');
		context.fillStyle = gradient;
		context.fill();

		// Define the inner area
		context.circle(this.centerX, this.centerY, this.radius - this.borderWidth);

		// Draw the inner border
		context.lineWidth = this.lineWidth;
		context.strokeStyle = '#000000';
		context.stroke();

		// Fill the area with the inner gradient
		gradient = context.createLinearGradient(0, 0, 0, this.radius * 2 - this.borderWidth);
		gradient.addColorStop(0, '#ffffff');
		gradient.addColorStop(0.2, '#e0e0e0');
		gradient.addColorStop(0.8, '#efefef');
		gradient.addColorStop(1, '#ffffff');
		context.fillStyle = gradient;
		context.fill();

		// Create the center dot for the clock hands
		context.beginPath();
		context.fillStyle = '#000000';
		context.circle(this.centerX, this.centerY, 2);
		context.fill();

		context.restore();
	},

	/**
	 * Draw a line over the border area to mark it as an hour.
	 * @param {CanvasRenderingContext2D} context The context on which to draw
	 * @param {Number} width The width of the line
	 * @param {Number} height The height of the line
	 * @param {Number} rotate The degrees by which the hand should be rotated
	 * @private
	 */
	drawLabelLine : function(context, width, height, rotate)
	{
		var hw = width / 2;
		var hh = height / 2;

		context.save();
		context.translate(this.centerX, this.centerY);
		context.rotate((Math.PI / 180) * rotate);

		context.moveTo(-hw, -this.radius - 4);
		context.lineTo(-hw, -this.radius + (4 + hh));
		context.lineTo(hw, -this.radius + (4 + hh));
		context.lineTo(hw, -this.radius - 4);
		context.lineTo(-hw, -this.radius - 4);

		context.fillStyle = '#000000';
		context.fill();

		context.restore();
	},

	/**
	 * Draw the labels on the clock for the various hours on the
	 * {@link #clockCanvas}.
	 * This will call {@link #drawLabelLine}.
	 * @private
	 */
	drawLabels : function()
	{
		if (!this.isWidgetVisible() || this.collapsed) {
			return;
		}

		var canvas = this.clockCanvas;

		// Initialize rendering
		var context = canvas.dom.getContext('2d');
		context.save();

		for (var i = 0; i < 60; i += 5) {
			if ((i % 15) === 0) {
				// Every 15 minutes (or 3 hours) we show a thicker line
				this.drawLabelLine(context, 2, 16, (i * 360) / 60.0);
			} else {
				this.drawLabelLine(context, 1, 10, (i * 360) / 60.0);
			}
		}

		context.restore();
	},

	/**
	 * Draw the clock hand.
	 * @param {CanvasRenderingContext2D} context The context on which to draw
	 * @param {Number} rotate The degrees by which the hand should be rotated
	 * @param {Number} width The width of the clock hand
	 * @param {Number} height The length of the clock hand
	 * @param {String} color The color in which the hand should be drawn
	 * @private
	 */
	drawHand : function(context, rotate, width, height, color)
	{
		context.save();
		context.translate(this.centerX, this.centerY);
		context.rotate((Math.PI / 180) * rotate);

		context.beginPath();
		context.moveTo(0, 0);
		context.lineTo(-(width / 2), -10);
		context.lineTo(0, -height);
		context.lineTo((width / 2), -10);
		context.lineTo(0, 0);

		context.fillStyle = color || '#000000';
		context.fill();

		context.lineWidth = this.lineWidth;
		context.fillStyle = '#000000';
		context.stroke();

		context.restore();
	},

	/**
	 * Draw the clock hands in the correct position on the {@link #handsCanvas}.
	 * This will call {@link #drawHand} for each hand which should be shown.
	 * @private
	 */
	drawHands : function()
	{
		if (!this.isWidgetVisible() || this.collapsed) {
			return;
		}

		var canvas = this.handsCanvas;
		var degrees;

		Zarafa.resizeCanvas(canvas, this.body.getWidth(), this.body.getHeight());

		// Initialize rendering
		var context = canvas.dom.getContext('2d');
		context.save();

		// Obtain the current time
		var date = new Date();
		var seconds = date.getSeconds();
		var minutes = date.getMinutes();
		var hours = date.getHours();

		// Draw the hours hand
		degrees = (((hours * 60) + minutes) * 720) / (24 * 60.0);
		this.drawHand(context, degrees, 8, this.radius / 1.8, '#000000');

		// Draw the minutes hand
		degrees = (minutes * 360) / 60.0;
		this.drawHand(context, degrees, 8, this.radius / 1.2, '#000000');

		// Draw the seconds hand
		degrees = (seconds * 360) / 60.0;
		this.drawHand(context, degrees, 6, this.radius / 1.1, '#ff0000');

		context.restore();
	},

	/**
	 * Called when the component is about to be destroyed. This will
	 * {@link Ext.TaskMgr#stop stop} the {@link #updateTask}.
	 * @private
	 */
	onDestroy : function()
	{
		Zarafa.widgets.clockwidget.ClockWidget.superclass.onDestroy.apply(this, arguments);

		Ext.TaskMgr.stop(this.updateTask);
	}
});

Zarafa.onReady(function() {
	if (Zarafa.supportsCanvas()) {
		container.registerWidget(new Zarafa.core.ui.widget.WidgetMetaData({
			name : 'clockwidget',
			displayName : _('Clock'),
			iconPath : 'plugins/clockwidget/resources/images/clock.png',
			widgetConstructor : Zarafa.widgets.clockwidget.ClockWidget
		}));
	}
});
