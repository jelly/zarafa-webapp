Ext.namespace('Zarafa.calendar.ui.canvas');

/**
 * @class Zarafa.calendar.ui.canvas.AppointmentDaysView
 * @extends Zarafa.calendar.ui.canvas.AppointmentView
 *
 * Appointment view used in {@link Zarafa.calendar.ui.AbstractCalendarDaysView CalendarDaysView}.
 * Each instance of {@link Zarafa.calendar.ui.canvas.AppointmentDaysView} represents a single
 * appointment which consists of one or horizontal rectangles on one or more day columns.
 * <p>
 * This class should be used when displaying appointments in a more detailed view (compared
 * to the {@link Zarafa.calendar.ui.canvas.AppointmentBoxView AppointmentBoxView} using a
 * header and a body.
 */
Zarafa.calendar.ui.canvas.AppointmentDaysView = Ext.extend(Zarafa.calendar.ui.canvas.AppointmentView, {
	/**
	 * Array of objects containing the {@link Zarafa.calendar.data.AppointmentBounds bounds} for the
	 * {@link #body} or {@link #header} elements which are part of the appointment.
	 * This field is initialized in {@link #layoutInBody} or {@link #layoutInHeader} using the function
	 * {@link Zarafa.calendar.ui.AbstractCalendarDaysView#dateRangeToBodyBounds dateRangeToBodyBounds}.
	 * @property
	 * @type Array
	 */
	bounds : undefined,

	/**
	 * {@cfg {Number} appointmentRadius The radius which must be applied to the appointment body
	 * to generate a nicely rounded rectangular.
	 */
	appointmentRadius : 5,

	/**
	 * @cfg {Number} lineHeight The textheight for the text which will be rendered
	 */
	lineHeight : 13,

	/**
	 * @cfg {Number} bodyTextTopOffset The offset from the top of the appointment used to render the text in the body
	 */
	bodyTextTopOffset: 2,

	/**
	 * @cfg {Number} bodyTextBottomOffset The offset from the bottom of the appointment until where the text in the body can be rendered.
	 */
	bodyTextBottomOffset : 2,

	/**
	 * @cfg {Number} leftPadding Left padding in pixels of the appointment text within the appointment body
	 */
	leftPadding : 4,

	/**
	 * @cfg {Number} iconSpacing The x distance between consecutive icons
	 */
	iconSpacing : 5,

	/**
	 * The main text which will be rendered into the body of the appointment. This field
	 * is initialized using the {@link #mainTextRenderer}.
	 * @property
	 * @type String
	 */
	mainRenderedText : '',

	/**
	 * The subtext which will be rendered alongside the {@link #mainRenderedText}. This field
	 * is initialized using the {@link #subTextRenderer}.
	 * @property
	 * @type String
	 */
	subRenderedText : '',

	/**
	 * This will mark the appointment as selected, and will draw the
	 * Selection Outline on the 3rd layer of the canvas {@link Zarafa.calendar.ui.canvas.CalendarDaysView calendar}.
	 * @param {Boolean} selected True iff the appointment should be marked as selected.
	 * @override
	 */
	setSelected : function(selected)
	{
		Zarafa.calendar.ui.canvas.AppointmentDaysView.superclass.setSelected.call(this, selected);

		if (selected && !Ext.isEmpty(this.bounds)) {
			if (this.isHeaderRange()) {
				this.drawHeaderSelectionOutline(this.bounds);
			} else {
				this.drawBodySelectionOutline(this.bounds);
			}

			// when selecting appointment set focus also so key shortcuts work properly
			this.focus();
		}
	},

	/**
	 * Tests whether a mouse event is over the header start (left) resize handle.
	 * @param {Ext.EventObject} event event object.
	 * @return {Boolean} true iff the event is over the resize handle.
	 * @override
	 */
	eventOverHeaderStartHandle: function(event)
	{
		if (!this.isHeaderRange() || !this.bounds || this.bounds.length == 0)
			return false;

		var position = this.getEventHeaderPosition(event);
		var element = {
			left	: this.bounds.left,
			right	: (this.bounds.left + this.dragHandleWidth),
			top		: this.bounds.top,
			bottom	: this.bounds.bottom
		}

		return this.isEventOverElement(position, element);
	},

	/**
	 * Tests whether a mouse event is over the header due (right) resize handle.
	 * @param {Ext.EventObject} event event object.
	 * @return {Boolean} true iff the event is over the resize handle.
	 * @override
	 */
	eventOverHeaderDueHandle : function(event)
	{
		if (!this.isHeaderRange() || !this.bounds || this.bounds.length == 0)
			return false;

		var position = this.getEventHeaderPosition(event);
		var element = {
			left	: (this.bounds.right - this.dragHandleWidth),
			right	: this.bounds.right,
			top		: this.bounds.top,
			bottom	: this.bounds.bottom
		}

		return this.isEventOverElement(position, element);
	},

	/**
	 * Tests whether a mouse event is over the appointment when laid out in the calendar header.
	 * @param {Ext.EventObject} event event object.
	 * @return {Boolean} true iff the event is over the appointment.
	 * @override
	 */
	eventOverHeader : function(event)
	{
		if (!this.isHeaderRange() || !this.bounds || this.bounds.length == 0)
			return false;

		var position = this.getEventHeaderPosition(event);

		return this.isEventOverElement(position, this.bounds);
	},

	/**
	 * Tests whether a mouse event is over the body start (top) resize handle.
	 * @param {Ext.EventObject} event event object.
	 * @return {Boolean} true iff the event is over the resize handle.
	 * @override
	 */
	eventOverBodyStartHandle : function(event)
	{
		if (this.isHeaderRange() || !this.bounds || this.bounds.length == 0) {
			return false;
		}

		var position = this.getEventBodyPosition(event);
		var bounds = this.bounds[0];
		var element = {
			left	: bounds.left,
			right	: bounds.right,
			top		: bounds.top,
			bottom	: (bounds.top + this.dragHandleHeight)
		};

		return this.isEventOverElement(position, element);
	},

	/**
	 * Tests whether a mouse event is over the body due (bottom) resize handle.
	 * @param {Ext.EventObject} event event object.
	 * @return {Boolean} true iff the event is over the resize handle.
	 * @override
	 */
	eventOverBodyDueHandle : function(event)
	{
		if (this.isHeaderRange() || !this.bounds || this.bounds.length == 0) {
			return false;
		}

		var position = this.getEventBodyPosition(event);
		var bounds = this.bounds[this.bounds.length - 1];
		var element = {
			left	: bounds.left,
			right	: bounds.right,
			top		: (bounds.bottom - this.dragHandleHeight),
			bottom	: bounds.bottom
		};

		return this.isEventOverElement(position, element);
	},

	/**
	 * Tests whether a mouse event is over the appointment when laid out in the calendar body.
	 * @param {Ext.EventObject} event event object.
	 * @return {Boolean} true iff the event is over the appointment.
	 * @override
	 */
	eventOverBody : function(event)
	{
		if (this.isHeaderRange() || !this.bounds || this.bounds.length == 0) {
			return false;
		}

		var position = this.getEventBodyPosition(event);

		for (var i = 0, len = this.bounds.length; i < len; i++) {
			if (this.isEventOverElement(position, this.bounds[i])) {
				return true;
			}
		}

		return false;
	},

	/**
	 * Draws the selection outline for the appointment inside the Calendar header.
	 * This is shown when the appointment is {@link #selected}.
	 * The draghandles are rendered using {@link #drawDragHandle}.
	 * @param {Zarafa.calendar.data.AppointmentBounds} bound The bounds object containing
	 * the position for the header.
	 * @private
	 */
	drawHeaderSelectionOutline : function(bound)
	{
		var context = this.parentView.getHeaderSelectionCanvas().dom.getContext('2d');
		var borderWidth = 1;

		// Get the left-top position of the appointment.
		// When drawing the border, our position will be the center
		// of the border. Thus update the coordinates, to move them
		// to the correct center.
		var x = bound.left + (borderWidth / 2);
		var y = bound.top + (borderWidth / 2);

		// Determine the exact dimensions of the appointment
		// When drawing the border, our position will be the center
		// of the border. The coordinates will have been moved to reflect
		// this, thus we must update our dimensions as well.
		var width = bound.right - bound.left - borderWidth;
		var height = bound.bottom - bound.top - borderWidth;

		// Determine the radius for the corners
		var leftRadius = bound.firstBox ? this.appointmentRadius : 1;
		var rightRadius = bound.lastBox ? this.appointmentRadius : 1;

		// Draw the border as rounder rectangular.
		context.save();
		context.lineWidth = borderWidth;
		context.strokeStyle = 'black';
		context.roundedRect2(x, y, width, height, leftRadius, rightRadius, rightRadius, leftRadius);
		context.stroke();

		// Draghandles must be positioned in the middle of the appointment.
		y += Math.floor(height / 2);

		// Draw the left and right draghandles.
		if (bound.firstBox) {
			this.drawDragHandle(context, x, y);
		}
		if (bound.lastBox) {
			this.drawDragHandle(context, x + width, y);
		}

		context.restore();
	},

	/**
	 * Draws the selection outline for the appointment inside the Calendar body.
	 * This is shown when the appointment is {@link #selected}.
	 * The draghandles are rendered using {@link #drawDragHandle}.
	 * @param {Array} bounds The {@link Zarafa.calendar.data.AppointmentBounds #bounds} array containing
	 * the position for the body.
	 * @private
	 */
	drawBodySelectionOutline : function(bounds)
	{
		var context = this.parentView.getBodySelectionCanvas().dom.getContext('2d');
		var borderWidth = 1;

		// Draw a border on each of the bounds which indicate that the
		// appointment is selected.
		context.save();
		context.lineWidth = borderWidth;
		context.strokeStyle = 'black';

		for (var i = 0, len = bounds.length; i < len; i++) {
			var bound = bounds[i];

			// Get the left-top position of the appointment.
			// When drawing the border, our position will be the center
			// of the border. Thus update the coordinates, to move them
			// to the correct center.
			var x = bound.left + (borderWidth / 2);
			var y = bound.top + (borderWidth / 2);

			// Determine the exact dimensions of the appointment
			// When drawing the border, our position will be the center
			// of the border. The coordinates will have been moved to reflect
			// this, thus we must update our dimensions as well.
			var width = bound.right - bound.left - borderWidth;
			var height = bound.bottom - bound.top - borderWidth;

			// Determine the radius for the corners
			var topRadius = bound.firstBox ? this.appointmentRadius : 1;
			var bottomRadius = bound.lastBox ? this.appointmentRadius : 1;

			// Draw the border as rounded rectangular.
			context.roundedRect2(x, y, width, height, topRadius, topRadius, bottomRadius, bottomRadius);
			context.stroke();

			if (bound.firstBox) {
				// Draghandles must be positioned in the center of the appointment.
				x += Math.ceil(width / 2);

				// Draw the top dragHandle
				this.drawDragHandle(context, x, y);
			}

			if (bound.lastBox) {
				// Draghandles must be positioned in the center of the appointment.
				// If this is also the firstBox then we have already repositioned
				// the x coordinate to the center.
				if (!bound.firstBox) {
					x += Math.ceil(width / 2);
				}

				this.drawDragHandle(context, x, y + height);
			}
		}
		context.restore();
	},

	/**
	 * Draws text on the appointment when laid out on the calendar body. A gradient with an alpha component is used
	 * to fade out text that is close to the right border of the appointment which looks prettier.
	 * @param {CanvasRenderingContext2D} context canvas drawing context.
	 * @param {Number} x horizontal position.
	 * @param {Number} y vertical position.
	 * @param {Number} width maximum text width.
	 * @param {Number} maxHeight maximum available height for the text
	 * @private
	 */
	drawBodyText : function(context, x, y, width, maxHeight)
	{
		// Avoid division by zero.
		if (width <= 0) {
			return;
		}

		// First start drawing all icons
		var icons = this.iconRenderer();
		var clipX = 0;
		var clipY = y;
		for (var i = 0, len = icons.length; i < len; i++) {
			var img = Zarafa.calendar.ui.IconCache['get' + Ext.util.Format.capitalize(icons[i]) + 'Icon']();
			context.drawImage(img, x+clipX, clipY + this.bodyTextTopOffset + Math.ceil((this.lineHeight - img.height) / 2));
			clipX += img.width + this.iconSpacing;
		}
		//add icon height to the clipping rectangle height
		if(icons.length>0) {
			var img = Zarafa.calendar.ui.IconCache['get' + Ext.util.Format.capitalize(icons[0]) + 'Icon']();
			clipY += img.height;
		}
		// Create a gradient that fades out gradually near the right border.
		var gradient = context.createLinearGradient(x, y, x + width, y);

		var colorScheme = this.getAppointmentColorScheme();

		// Start fading out to transparent from 12 pixels from the right border.
		var stop = Math.min(1, Math.max(0.1, (width - 12) / width));
		gradient.addColorStop(0, this.isActive() ? 'black' : colorScheme.border);
		gradient.addColorStop(stop, this.isActive() ? 'black' : colorScheme.border);
		gradient.addColorStop(1, 'rgba(0,0,0,0)');
		context.fillStyle = gradient;

		context.lineWidth = 1;
		context.setFont('8pt Arial');

		// Draw text using simple wrapping.
		var textHeight = context.drawWrappedText(this.mainRenderedText, x, y + this.lineHeight, width, this.lineHeight, maxHeight, clipX, clipY);
		// Check if we have sufficient room for at least 1 extra line which contains the
		// subText.
		if ((textHeight + this.lineHeight) < maxHeight) {
			context.lineWidth = 1;
			context.setFont('8pt Arial');

			// Draw text using simple wrapping.
			context.drawWrappedText(this.subRenderedText, x, y + this.lineHeight + textHeight, width, this.lineHeight, maxHeight - textHeight);
		}
	},

	/**
	 * Lays out the header elements of the view.
	 * @private
	 */
	layoutInHeader : function()
	{
		// Get the bounds of the header from the parent calendar.
		this.bounds = this.parentView.dateRangeToHeaderBounds(this.getDateRange(), this.slot, 1, true);
		var width = this.bounds.right - this.bounds.left;
		var height = this.bounds.bottom - this.bounds.top;

		var context = this.parentView.getHeaderAppointmentCanvas().dom.getContext('2d');

		context.save();
		context.translate(this.bounds.left, this.bounds.top);
		context.lineWidth = 1;

		var colorScheme = this.getAppointmentColorScheme();
		var appointmentOpacity = 1;
		if(!this.isActive()){
			appointmentOpacity = this.opacityNonActiveAppointment;
		}

		var gradient = context.createLinearGradient(0, 0, 0, height);
		gradient.addColorStop(0, context.convertHexRgbToDecRgba(colorScheme.startcolorappointment, appointmentOpacity));
		gradient.addColorStop(1, context.convertHexRgbToDecRgba(colorScheme.endcolorappointment, appointmentOpacity));
		context.fillStyle = gradient;

		var leftRadius = this.bounds.firstBox ? this.appointmentRadius : 1;
		var rightRadius = this.bounds.lastBox ? this.appointmentRadius : 1;

		context.roundedRect2(0, 0, width, height, leftRadius, rightRadius, rightRadius, leftRadius);
		context.fill();

		var busyStatus = this.getBusyStatus();
		var stripWidth = this.getStripWidth();
		var lineWidth = context.lineWidth;

		if (stripWidth > 0) {
			// Set the global alpha to allow the fill of the inner strip to be transparent, this will be reset after
			context.globalAlpha = appointmentOpacity;
			switch (busyStatus) {
				case Zarafa.core.mapi.BusyStatus.FREE:
					context.fillStyle = 'white';
					break;
				case Zarafa.core.mapi.BusyStatus.TENTATIVE:
					// For tentative we use an image to only show parts of the background. This
					// image should not be transparent otherwise the color behind that will show
					// in the places where it should not be shown. So we reset the alpha for this.
					context.globalAlpha = 1;
					context.fillStyle = context.createPattern(Zarafa.calendar.ui.IconCache.getDashedImage(), 'repeat');
					break;
				case Zarafa.core.mapi.BusyStatus.OUTOFOFFICE:
					context.fillStyle = 'purple';
					break;
			}

			context.roundedRect2(lineWidth, lineWidth, stripWidth, height - (2 * lineWidth), leftRadius - lineWidth, 0, 0, leftRadius - lineWidth);
			context.fill();
			// Reset the global alpha to 1 to draw without transparency again
			context.globalAlpha = 1;
		}

		context.strokeStyle = colorScheme.border;
		context.roundedRect2((lineWidth / 2), (lineWidth / 2), width - lineWidth, height - lineWidth, leftRadius, rightRadius, rightRadius, leftRadius);
		context.stroke();

		var x = this.leftPadding + stripWidth;

		// First start drawing all icons
		var icons = this.iconRenderer();
		for (var i = 0, len = icons.length; i < len; i++) {
			var img = Zarafa.calendar.ui.IconCache['get' + Ext.util.Format.capitalize(icons[i]) + 'Icon']();
			context.drawImage(img, x, 4 + Math.ceil((img.height - this.lineHeight) / 2));
			x += img.width + 5;
		}

		var stop = Math.min(1, Math.max(0.1, (width - x) / width));
		gradient = context.createLinearGradient(0, 0, width, 0);
		gradient.addColorStop(0, this.isActive() ? 'black' : colorScheme.border);
		gradient.addColorStop(stop, this.isActive() ? 'black' : colorScheme.border);
		gradient.addColorStop(1, 'rgba(0,0,0,0)');
		context.fillStyle = gradient;

		context.save();
		context.clip();
		context.lineWidth = 1;
		context.setFont('8pt Arial');
		context.drawText(this.mainRenderedText, x, height - 6);

		// Update the X position with the text we just drawn
		x += context.textWidth(this.mainRenderedText + ' ');

		context.lineWidth = 1;
		context.setFont('8pt Arial');
		context.drawText(this.subRenderedText, x, height - 6);

		context.restore();

		// Drag drag handles if selected
		if (this.isSelected()) {
			this.drawHeaderSelectionOutline(this.bounds);
		}

		context.restore();
	},

	/**
	 * Draws an element of the appointment when laid out in the calendar body.
	 * @param {CanvasRenderingContext2D} context canvas drawing context.
	 * @param {Zarafa.calendar.data.AppointmentBounds} bound The bounds of this element.
	 * @private
	 */
	drawBodyElement : function(context, bound)
	{
		var busyStatus = this.getBusyStatus();
		var width = bound.right - bound.left;
		var height = bound.bottom - bound.top;
		var realHeight = this.parentView.getRangeVerticalHeight(this.getDateRange());

		context.save();
		context.translate(bound.left, bound.top);

		context.lineWidth = 1;

		var colorScheme = this.getAppointmentColorScheme();
		var appointmentOpacity = 1;
		if(!this.isActive()){
			appointmentOpacity = this.opacityNonActiveAppointment;
		}

		var gradient = context.createLinearGradient(0, 0, width, 0);
		gradient.addColorStop(0, context.convertHexRgbToDecRgba(colorScheme.startcolorappointment, appointmentOpacity));
		gradient.addColorStop(1, context.convertHexRgbToDecRgba(colorScheme.endcolorappointment, appointmentOpacity));
		context.fillStyle = gradient;

		var topRadius = bound.firstBox ? this.appointmentRadius : 1;
		var bottomRadius = bound.lastBox ? this.appointmentRadius : 1;

		var stripWidth = this.getStripWidth();
		// The outer strip is the attached bar that shows the duration of the appointment when it is
		// shorter than the resolution of the calendar view.
		var showOuterStrip = (realHeight + 1) < height;
		// The inner strip is the bar that shows duration of the appointment when the resolution is
		// small enough to show it inside the body of the appointment.
		var showInnerStrip = !showOuterStrip && stripWidth > 0;

		var left = showOuterStrip ? stripWidth : 0;
		var textLeft = left + showInnerStrip ? stripWidth : 0;

		context.fillStyle = gradient;
		if (bound.firstBox){
			// When the first box of the appointment is drawn we have to consider the outer strip.
			// If there is an outer strip we should not have a curved top left corner.
			context.roundedRect2(left, 0, width - left, height, showOuterStrip ? 0 : topRadius, topRadius, bottomRadius, bottomRadius);
		} else {
			context.roundedRect2(left, 0, width - left, height, topRadius, topRadius, bottomRadius, bottomRadius);
		}
		context.fill();

		if (showInnerStrip) {
			// Set the global alpha to allow the fill of the inner strip to be transparent, this will be reset after
			context.globalAlpha = appointmentOpacity;
			switch (busyStatus) {
				case Zarafa.core.mapi.BusyStatus.FREE:
					context.fillStyle = 'white';
					break;
				case Zarafa.core.mapi.BusyStatus.TENTATIVE:
					// For tentative we use an image to only show parts of the background. This
					// image should not be transparent otherwise the color behind that will show
					// in the places where it should not be shown. So we reset the alpha for this.
					context.globalAlpha = 1;
					context.fillStyle = context.createPattern(Zarafa.calendar.ui.IconCache.getDashedImage(), 'repeat');
					break;
				case Zarafa.core.mapi.BusyStatus.OUTOFOFFICE:
					context.fillStyle = 'purple';
					break;
			}

			context.roundedRect2(left, 0, stripWidth, height, topRadius, 0, 0, bottomRadius);
			context.fill();
			// Reset the global alpha to 1 to draw without transparency again
			context.globalAlpha = 1;
		}

		context.save();
		if (showOuterStrip) {
			var stripHeight = realHeight;

			// Set the global alpha to allow the fill of the outer strip to be transparent, this will be reset after
			context.globalAlpha = appointmentOpacity;
			switch (busyStatus) {
				case Zarafa.core.mapi.BusyStatus.FREE:
					context.fillStyle = 'white';
					break;
				case Zarafa.core.mapi.BusyStatus.TENTATIVE:
					context.fillStyle = colorScheme.startcolorappointment;
					context.fillRect(0, 0, stripWidth, stripHeight);

					// For tentative we use an image to only show parts of the background. This
					// image should not be transparent otherwise the color behind that will show
					// in the places where it should not be shown. So we reset the alpha for this.
					context.globalAlpha = 1;
					context.fillStyle = context.createPattern(Zarafa.calendar.ui.IconCache.getDashedImage(), 'repeat');
					break;
				case Zarafa.core.mapi.BusyStatus.OUTOFOFFICE:
					context.fillStyle = 'purple';
					break;
			}

			context.fillRect(0, 0, stripWidth, stripHeight);
			// Reset the global alpha to 1 to draw without transparency again
			context.globalAlpha = 1;

			context.translate(0.5, 0.5);

			context.beginPath();
			context.moveTo(0, 0);

			context.lineTo(width - 1 - topRadius, 0);
			context.arc(width - 1 - topRadius, topRadius, topRadius, 1.5 * Math.PI, 0 * Math.PI, false);
			context.lineTo(width - 1, height - 1 - bottomRadius);
			context.arc(width - 1 - bottomRadius, height - 1 - bottomRadius, bottomRadius, 0 * Math.PI, 0.5 * Math.PI, false);
			context.lineTo(bottomRadius + left, height - 1);
			context.arc(bottomRadius + left, height - 1 - bottomRadius, bottomRadius, 0.5 * Math.PI, 1 * Math.PI, false);
			context.lineTo(left, stripHeight);
			context.lineTo(0, stripHeight);
			context.closePath();

		} else {
			var lineWidth = context.lineWidth;
			context.roundedRect2(left + (lineWidth / 2), (lineWidth / 2), width - lineWidth, height - lineWidth,
								 topRadius - (lineWidth / 2), topRadius - (lineWidth / 2), bottomRadius - (lineWidth / 2), bottomRadius - (lineWidth / 2));
		}

		context.strokeStyle = colorScheme.border;
		context.stroke();
		context.restore();

		var lineWidth = context.lineWidth;
		context.roundedRect2(left + (lineWidth / 2), (lineWidth / 2), width - lineWidth, height - lineWidth,
							 topRadius - (lineWidth / 2), topRadius - (lineWidth / 2), bottomRadius - (lineWidth / 2), bottomRadius - (lineWidth / 2));
		context.clip();

		if (bound.firstBox) {
			this.drawBodyText(
				context,
				textLeft + this.leftPadding,
				this.bodyTextTopOffset,
				width - textLeft - this.leftPadding,
				height - this.bodyTextTopOffset - this.bodyTextBottomOffset
			);
		}
		context.restore();
	},

	/**
	 * Draws the elements for the appointment body on the Canvas context.
	 * @param {Array} bounds array of {@link Zarafa.calendar.data.AppointmentBounds bounds} objects.
	 * @private
	 */
	drawBodyElements : function(bounds)
	{
		// Obtain the context object on which we
		// will be drawing our appointment.
		var context = this.parentView.getBodyAppointmentCanvas().dom.getContext('2d');

		// Draw the individual body elements.
		for (var i = 0, len = bounds.length; i < len; i++) {
			this.drawBodyElement(context, bounds[i]);
		}

		// Optionally draw drag handles
		if (this.isSelected()) {
			this.drawBodySelectionOutline(bounds);
		}
	},

	/**
	 * Lays out the body of the view. This will generate the Body bounds using the
	 * function {@link Zarafa.calendar.ui.AbstractCalendarDaysView#dateRangeToBodyBounds dateRangeToBodyBounds}.
	 * Finally the bounds will be used for laying out the body elements using {@link #drawBodyElement}.
	 * @private
	 * @override
	 */
	layoutInBody : function()
	{
		this.bounds = this.parentView.dateRangeToBodyBounds(
			this.getAdjustedDateRange(),
			this.slot,
			this.slotCount,
			true
		);

		// Draw the body elements to match the bounds
		if (!Ext.isEmpty(this.bounds)) {
			this.drawBodyElements(this.bounds);
		}
	},

	/**
	 * Lays out the view. This function is called after {@link #render} and is used
	 * to update the view to the latest situation. When an appointment, or setting
	 * has been changed, the {@link #layout} function must change the look to reflect
	 * the new changes.
	 * If the range represented by this view spans over 24 hours,
	 * the body is made invisible and the header element is shown instead.
	 * @protected
	 */
	onLayout : function()
	{
		// The text Renderers deliver everything in HTML encoded strings. We must
		// decode it here, as Canvas doesn't need encoded text
		this.mainRenderedText = Ext.util.Format.htmlDecode(this.mainTextRenderer());
		this.subRenderedText = Ext.util.Format.htmlDecode(this.subTextRenderer());

		Zarafa.calendar.ui.canvas.AppointmentView.superclass.onLayout.call(this);
	}
});
