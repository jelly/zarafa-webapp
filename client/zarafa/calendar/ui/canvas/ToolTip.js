Ext.namespace('Zarafa.calendar.ui.canvas');

/**
 * @class Zarafa.calendar.ui.canvas.ToolTip
 * @extends Ext.util.Observable
 *
 * A special Tooltip class which uses Canvas to render the tooltip on,
 * opposite to the {@link Ext.Tooltip} class, it also doesn't require
 * a real {@link Ext.Element} to be registered on, as it can be called
 * manually to display it on a particular location.
 */
Zarafa.calendar.ui.canvas.ToolTip = Ext.extend(Ext.util.Observable, {
	/**
	 * The &lt;canvas&gt; element which contains
	 * all the information of the Tooltip.
	 * @property
	 * @type Ext.Element
	 * @private
	 */
	el : undefined,

	/**
	 * True if {@link Ext.Fx#stopFx} has been called, and we want
	 * to cancel the execution of the {@link Ext.Fx#callback callback} function
	 * of the {@link Ext.Fx animation}.
	 * @property
	 * @type Boolean
	 * @private
	 */
	cancelFx : false,

	/**
	 * The component id which was provided in the function {@link #show},
	 * this identifies the component for which the Tooltip is being shown.
	 * @property
	 * @type String
	 * @private
	 */
	targetId : undefined,

	/**
	 * @cfg {Ext.Element} container The container in which the {@link #el}
	 * must be created. All positioning will be based on this container.
	 */
	container : undefined,

	/**
	 * @cfg {String} tipCls The CSS class which must be applied to
	 * the {@link #el} when it is being created.
	 */
	tipCls : 'zarafa-canvas zarafa-canvas-quicktip',

	/**
	 * @cfg {Number} lineHeight The height for the text
	 */
	lineHeight : 12,

	/**
	 * @cfg {Number} lineWidth The width for the text lines
	 */
	lineWidth : 1,

	/**
	 * @cfg {Number} radius The rounding which should be used for the
	 * 4 corners of the tooltip
	 */
	radius : 3,

	/**
	 * @cfg {Number} borderWidth The line width for the border around the tooltip
	 */
	borderWidth : 1,

	/**
	 * @cfg {Number} width The width of the Tooltip
	 */
	width : 250,

	/**
	 * @cfg {Number} height The height of the Tooltip (this will be updated
	 * based on the amount of text which will be written).
	 */
	height : 100,

	/**
	 * @cfg {Number} margins The margins which should be applied to the text inside the tooltip
	 */
	margins : 10,

	/**
	 * @cfg {Number} titleMargins Extra margins to be applied between the title and normal
	 * text inside the tooltip.
	 */
	titleMargins : 5,

	/**
	 * @param {String} backgroundColor The Hex String for the color which should be applied
	 * to the background of the tooltip
	 */
	backgroundColor : '#dfdfdf',

	/**
	 * @param {Float} backgroundOpacity The opacity to be applied on the background of the tooltip
	 */
	backgroundOpacity : 0.7,

	/**
	 * @param {String} borderColor The Hex String for the color which should be applied
	 * to the border around the tooltip
	 */
	borderColor : '#b0b0b0',

	/**
	 * @param {String} fontColor The color for the text which should be used in the tooltip
	 */
	fontColor : '#111111',

	/**
	 * @param {String} fontType The font specification which should be used in the tooltip
	 */
	fontType : '8pt Arial',

	/**
	 * @param {String} titleFontType The font specification for the title of the tooltip
	 */
	titleFontType : 'bold 10pt Arial',

	/**
	 * @cfg {Boolean} enableShadow True to enable a shadow effect of the Tooltip
	 */
	enableShadow : true,

	/**
	 * @cfg {String} shadowColor The color which is to be applied on the shadow
	 */
	shadowColor : '#ffffff',

	/**
	 * @cfg {Number} shadowSize The size of the shadow
	 */
	shadowSize : 5,

	/**
	 * @cfg {Number} shadowOffset The offset of the shadow from the top-left corner.
	 */
	shadowOffset : 1,

	/**
	 * @cfg {Boolean} fadeOutOnHide True to use a {@link Ext.Fx#fadeOut FadeOut} effect
	 * when the Tooltip is being {@link #hide hidden}.
	 */
	fadeOutOnHide : true,

	/**
	 * @cfg {Float} fadeOutTime The duration for the {@link Ext.Fx#fadeOut FadeOut} effect
	 * which is applied on {@link #hide}. This timeout applies when the cursor is currently
	 * not over the tooltip itself.
	 */
	fadeOutTime : 0.5,

	/**
	 * @cfg {Float} fadeOutTimeOnOver The duration for the {@link Ext.Fx#fadeOut FadeOut} effect
	 * which is applied on {@link #hide}. This timeout applies when the cursor is currently
	 * over the tooltip itself.
	 */
	fadeOutTimeOnOver : 3.5,

	/**
	 * @cfg {Number} hoverXOffset Horizontal offset of the tooltip from the mouse cursor
	 * This is done in order to prevent the tooltip from completely covering an appointment,
	 * which makes it difficult to interact with this appointment.
	 */
	hoverXOffset : 10,

	/**
	 * @cfg {Number} hoverYOffset Vertical offset of the tooltip from the mouse cursor
	 * This is done in order to prevent the tooltip from completely covering an appointment,
	 * which makes it difficult to interact with this appointment.
	 */
	hoverYOffset : 10,

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		this.addEvents(
			/**
			 * @event tooltipmousemove
			 * Fired when the user moves his cursor over the tooltip
			 * @param {Zarafa.calendar.ui.canvas.ToolTip} tooltip The tooltip which fired the event
			 * @param {Ext.EventObject} event The event object
			 */
			'tooltipmousemove'
		);

		Ext.apply(this, config);

		Zarafa.calendar.ui.canvas.ToolTip.superclass.constructor.call(this, config);
	},

	/**
	 * Obtain the Tooltip ({@link #el}) instance. If the instance does not yet exist
	 * it will be created. Otherwise it will {@link #cancelFx cancel} all
	 * {@link Ext.Fx#stopFx animations}.
	 *
	 * This function will return a {@link Ext.Element} which will be
	 * {@link Ext.Element#hide hidden} by default.
	 *
	 * @return {Ext.Element} The Tooltip element
	 * @private
	 */
	getTooltip : function()
	{
		if (!this.el) {
			this.el = Ext.get(this.container).createChild({
				tag : 'canvas',
				cls : this.tipCls
			});
		} else {
			this.cancelFx = true;
			this.el.stopFx();
			this.cancelFx = false;
		}

		this.el.hide();
		return this.el;
	},

	/**
	 * Show the Tooltip, this will {@link Ext.Element#show show} the {@link #el tooltip}.
	 *
	 * @param {String} id The Object id referring to the Object on which we are showing the Tooltip
	 * @param {Object} config The properties used for creating the tooltop, this should at least contain
	 * either a 'title' or 'text' property.
	 * @param {Ext.EventObject} event The event object
	 */
	show : function(id, config, event)
	{
		var tip = this.getTooltip();

		// Check if the object which we are going
		// to render the tooltip for is the same
		// as the current target. If that is the case,
		// ca can just show the same tooltip immediately
		if (this.targetId === id) {
			tip.show();
			return;
		}

		this.targetId = id;

		// We want to redirect all 'mousemove' events from
		// this Tooltip to the parent.
		tip.on('mousemove', this.onTooltipMouseMove, this);
		tip.on('click', this.onTooltipClick, this);

		// Obtain the Context so we can access the Canvas functionality
		var context = tip.dom.getContext('2d');

		// Text and Title is in HTML encoded strings. We must decode it here
		// to obtain actual values, as Canvas doesn't need encoded text.
		var tipTitle = Ext.util.Format.htmlDecode(config.title);
		var tipText = Ext.util.Format.htmlDecode(config.text);

		// Update the height of the Tooltip based on the new text which
		// will be written into the Tooltip.
		this.height = (2 * this.margins);
		if (!Ext.isEmpty(tipTitle)) {
			context.setFont(this.titleFontType);
			this.height += context.textHeight(tipTitle, this.width - (2 * this.margins), this.lineHeight);
			this.height += this.titleMargins;
		}
		if (!Ext.isEmpty(tipText)) {
			context.setFont(this.fontType);
			this.height += context.textHeight(tipText, this.width - (2 * this.margins), this.lineHeight);
		}

		// Now we have the desired position and dimensions of
		// the Tooltip. Update this information based on the
		// available positions and dimensions.
		var containerBox = Ext.apply({}, this.container.getSize());
		containerBox.x = this.container.getX();
		containerBox.y = this.container.getY();

		var tooltipBox = {
			x : event.getPageX() + this.hoverXOffset,
			y : event.getPageY() + this.hoverYOffset,
			height : this.height,
			width : this.width
		};
		tooltipBox = Zarafa.core.Util.restrictBox(containerBox, tooltipBox);

		// Reposition the Tooltip to the desired location
		tip.setStyle({
			position : 'absolute',
			left : (tooltipBox.x - containerBox.x) + 'px',
			top  : (tooltipBox.y - containerBox.y) + 'px'
		});

		// Resize the canvas accordingly, this will also
		// clear out any contents from previous usage.
		Zarafa.resizeCanvas(tip, this.width + this.shadowSize, this.height + this.shadowSize);

		// Now we are ready to start drawing
		context.save();

		// Define the rectangle in which we will create our tooltip,
		// this will fill most of the <canvas> element, except for the
		// rounded corners.
		context.roundedRect(this.borderWidth / 2, this.borderWidth / 2, this.width - this.borderWidth, this.height - this.borderWidth, this.radius);
		context.lineWidth = this.borderWidth;

		// If shadows are enabled, we are going to generate the shadow
		// for the background. As soon as the background has been painted,
		// these properties will be reset again.
		if (this.enableShadow === true) {
			context.shadowColor = this.shadowColor;
			context.shadowBlur = this.shadowSize;
			context.shadowOffsetX = this.shadowOffset;
			context.shadowOffsetY = this.shadowOffset;
		}

		// First we fill our rectangle with a background color
		context.fillStyle = context.convertHexRgbToDecRgba(this.backgroundColor, this.backgroundOpacity);
		context.fill();

		// Reset shadow properties, we don't need it for the border,
		// or any of the text.
		context.shadowBlur = 0;
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;

		// Second we draw a border around our rectangle
		context.strokeStyle = this.borderColor;
		context.stroke();

		// Fill the contents of the tooltip with the requested text
		context.lineWidth = this.lineWidth;

		// Start fading out to transparent over the right-margin of the tooltip.
		var gradient = context.createLinearGradient(this.margins, 0, this.width - (1 * this.margins), 0);
		var stop = Math.min(1, Math.max(0.1, (this.width - (2 * this.margins)) / (this.width - (1 * this.margins))));
		gradient.addColorStop(0, this.fontColor);
		gradient.addColorStop(stop, this.fontColor);
		gradient.addColorStop(1, 'rgba(0,0,0,0)');
		context.fillStyle = gradient;

		var offset = this.margins + this.lineHeight;
		if (!Ext.isEmpty(tipTitle)) {
			context.setFont(this.titleFontType);
			offset += context.drawWrappedText(tipTitle, this.margins, offset, this.width - (2 * this.margins), this.lineHeight, this.height - (2 * this.margins));
			offset += this.titleMargins;
		}
		if (!Ext.isEmpty(tipText)) {
			context.setFont(this.fontType);
			offset += context.drawWrappedText(tipText, this.margins, offset, this.width - (2 * this.margins), this.lineHeight, this.height - (2 * this.margins));
		}

		context.restore();

		// Done drawing, show the element
		tip.show();
	},

	/**
	 * Hide the Tooltip, this will {@link Ext.Fx#fadeOut Fade out} the {@link #el tooltip}
	 * to gradually make the tooltip disappear.
	 * On completion the {@link #onHideComplete} function will be called as callback.
	 * @param {Ext.EventObject} event The event object
	 */
	hide : function(event)
	{
		var tip = this.el;

		if (this.fadeOutOnHide === true && event) {
			tip.fadeOut({
				endOpacity: 0,
				easing: 'easeOut',
				duration : (event.getTarget().id === tip.id) ? this.fadeOutTimeOnOver : this.fadeOutTime,
				remove : false,
				callback : this.onHideComplete,
				scope : this
			});
		} else {
			this.onHideComplete();
		}
	},

	/**
	 * Callback function for the {@link Ext.Fx#fadeOut FadeOut} request of the {@link #el tooltip}.
	 * This will determine if the {@link Ext.Fx action} was {@link #cancelFx cancelled}, and if not
	 * then will {@link Ext.Element#hide hide} the {@link #el tooltip} and reset the {@link #targetId}.
	 * @private
	 */
	onHideComplete : function()
	{
		var tip = this.el;

		if (this.cancelFx !== true) {
			tip.un('mousemove', this.onTooltipMouseMove, this);
			tip.un('click', this.onTooltipClick, this);
			tip.hide();
		}

		this.targetId = false;
	},

	/**
	 * Event handler which is fired when the mouse is moving over the {@link #el tooltip element}.
	 * This will fire the {@link #tooltipmousemove tooltipmousemove event},
	 * @param {Ext.EventObject} event The event object
	 * @private
	 */
	onTooltipMouseMove : function(event)
	{
		this.fireEvent('tooltipmousemove', this, event);
	},

	/**
	 * Event handler which is fired when the {@link #el tooltip element} is clicked
	 * This allows dismissing the tooltip when it is in the way.
	 * @param {Ext.EventObject} event The event object
	 * @private
	 */
	onTooltipClick : function(event)
	{
		this.el.stopFx();
		this.hide();
	}
});
