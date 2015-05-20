Ext.namespace('Zarafa.calendar.ui');

/**
 * @class Zarafa.calendar.ui.IconCache
 * @extends Object
 * @singleton
 *
 * Special class which contains a number of
 * icons which are used within the Calendar.
 * These icons can be used inside the Canvas
 * for drawing, because this implies that the
 * images must be downloaded to the client,
 * we do that in this cache class.
 */
Zarafa.calendar.ui.IconCache = {

	/**
	 * Obtain a dashed Image object
	 * @return {Image} The dashed image
	 */
	getDashedImage : function()
	{
		var image = new Image();
		image.src = 'data:image/gif;base64,R0lGODlhCAAIAIABAP///wAAACH5BAEKAAEALAAAAAAIAAgAAAIPhIN2qRgKHIwPslZxpq8AADs=';
		return function () { return image; };
	}(),

	/**
	 * Obtain a icon for Private appointments
	 * @return {Image} The private icon
	 */
	getPrivateIcon : function()
	{
		var image = new Image();
		image.src = 'data:image/gif;base64,' +
					'R0lGODlhDAALAPcAAAQCBPz+/AAAAAAAAG/g+Bnl5wASEgAAADsCZx0ABAAA1AAAdwCY0ADltBU50QB3' +
					'dwyk/wDl/wAS/wAA/wBTywIbtABM0QAAdwDgDAPltQAS0QAAd7QCEOQAABIAAAAAAHmUDwjlAIISAHwA' +
					'AAAAAAAAAAEAAAAAAFYAHAAAtQAA0QAAd7yMAOPlABISAAAAAHM0AACHAADRAAB3ANy4AOQIABKSAAAA' +
					'ABgPAO4AAJAAAHwAAHAAqAUA5pEAEnwAAP8A4/8A6v8AkP8AfG2YAAXlAJE5FXx3ABXNGAqrAIK6AHzc' +
					'AAAA0AAAZhUAewAAAGDIDwPlAAASAAAAABCYAALlABo5AAB3AED0AGPlABUSAAAAAAAWmACI5QDRAQB3' +
					'AH4AAgDwAAD9AMB/AAD09ADl5QASEgAAAP9aKv+I2P/R0f93d/+06P/l5v8SEv8AAAAqGACI7gDRkAB3' +
					'fAAAcAAABQAAkQAAfAC4/wAI/xWS/wAA/+wAEuTwnxIAgAAAfGIUAAkAAIIAAHwAAEABAGMAABUAAAAA' +
					'ANsABwUAAIIAAHwAAKAAAAwAAFAAAAAAAEAQAGMAQAEAFQAAAGwAAAAAAAAAAAAAACjLAOSwABIAAAAA' +
					'AAAEAADmAAASAAAAAJyDAPcqABKCAAB8ABgAGO4An5AAgHwAfHAA/wUA/5EA/3wA//8AEv8An/8AgP8A' +
					'fG0pSAW3AJGSAHx8AEoYSPYAAIAAAHwAAAC+gAA+7RWCEgB8AAD//wD//wD//wD//0AAAGMAABUAAAAA' +
					'AADoMAHl5wASEgAAAAC+jgA+2ACCSwB8AFecEPb354ASEnwAABQYe+bu8BKQTgB8AEAARGO35xWSEgB8' +
					'AET/vuX/PhL/ggD/fAYY+B0A50wAEgAAAOK+tuU+/xKC/wB8f+EssOXn5xISEgAAAAPdAAA/AACCAAB8' +
					'AOEWvuU/PhKCggB8fJQAAOUAABIAAAAAAOEwy+UAsBIwAAAAAMAAABsAAEwAAAAAAOEcR+XmuxISRwAA' +
					'ACH5BAEAAAEALAAAAAAMAAsABwgtAAMIHBgAgEGCBAEMVIhQoUGHDQtKZLiw4EGKAjFinPgwokSEHw9G' +
					'FAmSJMiAADs=';
		return function() { return image };
	}(),

	/**
	 * Obtain a icon for Recurring appointments
	 * @return {Image} The recurring icon
	 */
	getRecurringIcon : function()
	{
		var image = new Image();
		image.src = 'data:image/gif;base64,' +
					'R0lGODlhCwALAIAAAAAAAP///yH5BAEAAAEALAAAAAALAAsAAAIXjA2nB7kNHWKyKRnsopdl/l3RlmGb' +
					'WQAAOw==';
		return function() { return image };
	}(),

	/**
	 * Obtain a icon for Exception appointments
	 * @return {Image} The exception icon
	 */
	getExceptionIcon : function()
	{
		var image = new Image();
		image.src = 'data:image/gif;base64,' +
					'R0lGODlhCwALAIAAAAAAAP///yH5BAEAAAEALAAAAAALAAsAAAIXjA13iawA4wsJLmevonrx2jmNJFLl' +
					'VhYAOw==';
		return function() { return image };
	}(),

	/**
	 * Obtain a icon for Meetings
	 * @return {Image} The meeting icon
	 */
	getMeetingIcon : function()
	{
		var image = new Image();
		image.src = 'data:image/png;base64,'+
								'iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAABHNCSVQICAgIfAhkiAAAAAlwSFlz' +
								'AAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHRSURB' +
								'VCiRnZNNa1pBFIafuc4dGxdSibaIgg2kKZSCItKNuHRhf4H9WInLLov5Af4GweX9A125cRPINhRE' +
								'IUWK2Un01uIm4tfccKeL4BdtF83AYQ7nzHvOe17OCGMMjz3WxnEcZ+U4zpP9pOM4f1Tej4kPn78a' +
								'gLPodwbT1xgjtg9fxa758evNAXg/JgGOw6csFt94FjlDqSOUrZBSMv95xcsXb7n37tGeRmvNfH7F' +
								'cfiU6d3NjvZSvscSNpawsCyLQCDA0+QXAoEAwhII8WBL+XHLQgJM724eJZj89O6ITCbz38But/vQ' +
								'GWA8HmPbNp7nYds26/UaKSVa6+29yadSqR1tACkl0WiU0WhEvV4HwPf9f5oxZgdeLpfc3t6yWq0I' +
								'h8Pkcjm01lSrVUKhEABaa5rNJovFgk6ns1NbKUUikUApRTAYpFKpkE6nqdVq9Pt9XNfl/PycZDJJ' +
								'sVhEKbXrbIxhMpmwWVfbtsnn8wghaDQaeJ5HqVQim80SiUQOZ47H4wdqGmPo9XoMh0PK5TKz2YzB' +
								'YEA8Ht+CRbvddn3ff74PbLVaFAoFTk5OyGazGGO2Il1eXuK6LhcXF4i//apyuWxisdiB4psCvu/j' +
								'eR6TyYTf1e/eakeXUAkAAAAASUVORK5CYII=';
		return function() { return image };
	}(),

	/**
	 * Obtain a icon for appointments with reminders
	 * @return {Image} The reminder icon
	 */
	getReminderIcon : function()
	{
		var image = new Image();
		image.src = 'data:image/gif;base64,' +
			'R0lGODlhEgAMAPcAAAQCBPz+/AAAQQAAfk8AAB4A8AAA/QAAf5i/bB495AA/EgB3AABzWgC0iBVBQQB+' +
			'fg4gLADj5AASEgAAAAAsKgIAiAAAQQAAfgAADAEAAACFAACBAIi+2OKU1BJBewB+AOkt7OW01IFBe3x+' +
			'AABEFAADAAEIAAAAAFYgAQAAAAAAAAAAAJC+AOEDABI9AAAAAHMSAAAAAAAAAAACALAAEOIAABIAAAAA' +
			'ABieAO4CAJAAAHwAAHABAAUAAJEAAHwAAP/YAP/xAP8SAP8AAG0QAAX3AJFFAHwAAIUgAecAAIEAAHwA' +
			'AABONQBvNhV0MgAgNWBhIAMgJQBmIABpAIBsEOll6RsAEgAAAJAMV2UABBUARAAAfgAAMAAAiAAAQQAA' +
			'fn5g/wBj/wBQ/8AA/wABKgAAiAAAQQAAfv9gm/9juP9QQf8Afv+QAP/jAP8SAP8AAACYoADVnABBRQB+' +
			'AABEjgADAwAIQAAAAAAgDAAAABUAAAAAAPK+YGsDngA9gAAAfMASUOIA1RIAFQACAJ8BAOsAAIEAAHwA' +
			'AErYB+PjAIESAHwAAMBFAHbVAFBBAAB+AJBEAGUD0AEIFQAAAGwgAAAAAAAAAAAAAPzyAOFrABIAAAAA' +
			'ADTYAADjAAASAMAAAPiFAPcrABKDAAB8ABgAaO4AnpAAgHwAfHAA/wUA/5EA/3wA//8AYP8Anv8AgP8A' +
			'fG0APgUBAJEAAHwAAErpPvQrAICDAHx8AAD8SADj6xUSEgAAAADE/wAr/wCD/wB8/5AAAGUAABUAAAAA' +
			'AABQBAHV5QAVEgAAAAA0vgBkOwCDTAB8AFf/5PT/5ID/Enz/AOgAd+PlEBISTwAAAJBtGGVk5RWDEgB8' +
			'AOMMNOoUZJBPg3wAfOzUxuIy5RJPEgAAADgAwAAB/wAA/wAAfzj8iADj5QASEgAAAAIAUAAB1QAAFQAA' +
			'AAGINABkZACDgwB8fMwBUAUA1U4AFZ8AADAA8gAAawAAAAAAAACgAACcAABFAAAAANhs6dTkznsSRwAA' +
			'ACH5BAEAAAEALAAAAAASAAwABwg9AAMIHEiwYEEABxEeJKhQIICGDg0qfPhwIMSFFg0GoLhR4saKGBlq' +
			'7HiRJMaSEzN21JjSIsWJL0c65GgwIAA7';
		return function() { return image };
	}()
};
