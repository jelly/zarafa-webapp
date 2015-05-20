Ext.namespace('Zarafa.plugins.files.ui');

/**
 * @class Zarafa.plugins.files.ui.QuotaBar
 * @extends Ext.BoxComponent
 * @xtype zarafa.plugins.files.quotabar
 *
 * Quotabar shows information about user's store size,
 * and denotes warning-quota and hard-quota information.
 *
 */
Zarafa.plugins.files.ui.QuotaBar = Ext.extend(Ext.BoxComponent, {
	/**
	 * @cfg {number} storeSize
	 * Current store size.
	 */
	storeSize : undefined,
	
	/**
	 * @cfg {number} warnQuota
	 * Quota warning.
	 */
	warnQuota : undefined,
	
	/**
	 * @cfg {number} hardQuota
	 * Quota limit.
	 */
	hardQuota : undefined,

	/**
	 * @cfg {String} quotaTemplate
	 * Template for quota bar.
	 */
	quotaTemplate :'<div class="zarafa-quotabar">' +
						'<div class="zarafa-quotabar-normal"></div>' +
						'<div class="zarafa-quotabar-warn"></div>' +
						'<div class="zarafa-quotabar-hard"></div>' +
					'</div>',

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Zarafa.plugins.files.ui.QuotaBar.superclass.constructor.call(this, config);

		this.quotaTemplate = new Ext.XTemplate(this.quotaTemplate, {
			compiled: true
		});

		this.on('afterrender', this.onQuotaBarRender, this);
	},

	/**
	 * Function will overwrites the quotaTemplate the content of el with the new node(s).
	 * @private
	 */
	onQuotaBarRender : function() {
		this.quotaTemplate.overwrite(Ext.get(this.el));
		this.updateQuotaBar();
	},
	
	/**
	 * Set store size.
	 *
	 * @param {Number} size
	 */
	setStoreSize : function (size) {
		this.storeSize = size;
	},
	
	/**
	 * Set warn quota.
	 *
	 * @param {Number} size
	 */
	setWarnQuota : function (size) {
		this.warnQuota = size;
	},
	
	/**
	 * Set hard quota.
	 *
	 * @param {Number} size
	 */
	setHardQuota : function (size) {
		this.hardQuota = size;
	},

	/**
	 * Function will count the quota size from the user store,
	 * and will update/show the quotabar accordingly.
	 * @private
	 */
	updateQuotaBar : function() {
		if(this.el && this.el.child('div.zarafa-quotabar')) {

			// If quota information is not set then return.
			if(!this.hardQuota) {
				return;
			}

			// calculate warn quota
			if(!this.warnQuota) {
				this.warnQuota = this.hardQuota - 100 * 1024; // Warnquota is 100MB below hard Quota.
			}
			
			var quota = [];
			if(this.warnQuota && (!this.hardQuota || this.warnQuota < this.hardQuota)) {
				quota.push({size : this.warnQuota, element : 'div.zarafa-quotabar-warn'});
			}
			
			if(this.hardQuota) {
				quota.push({size : this.hardQuota, element : 'div.zarafa-quotabar-hard'});
			}


			var maxLimit = this.hardQuota || this.warnQuota;

			if(this.storeSize > maxLimit) {
				// If store size has exceeded the hard_quota then set it as maxLimit
				maxLimit = this.storeSize;
				quota.push({size : this.storeSize});
			}

			// Count the factor by 'total width of qouta bar'/'max qouta limit'
			var maxAvailableWidth = this.el.child('div.zarafa-quotabar').getWidth(true);
			var factor = maxAvailableWidth/maxLimit;

			// Set blockSize
			var blockSize, totalSize = 0;
			var element = 'div.zarafa-quotabar-normal';
			for (var i = 0; i < quota.length ; i++)
			{
				blockSize = quota[i].size;
				if(this.storeSize <= blockSize) {
					blockSize = this.storeSize;
					this.storeSize = 0;
				}

				/*
				 * get absolute difference between qouta levels in blockSize
				 *
				 * |--------|                           first
				 * |-------------------|                second
				 * |------------------------------|     third
				 *
				 * absolute difference
				 * |--------|                           first
				 *          |----------|                second
				 *                     |----------|     third
				 */
				blockSize -= totalSize;
				totalSize += blockSize;

				if(element) {
					// Set width of the current block.
					var elementWidth = Math.round(blockSize*factor);
					elementWidth = Math.max(elementWidth, 0);

					/*
					 * Math.round sometime gives extra 1 pixel while setting width
					 * of the quotabar elements, because of the layouting is spoiled,
					 * so checked whether it doesn't exceed max limit.
					 */
					if(maxAvailableWidth < elementWidth) {
						elementWidth = maxAvailableWidth;
					}

					this.el.child(element).setWidth(elementWidth);
					maxAvailableWidth -= elementWidth;
				}

				/*
				 * Update element according to which quota is started in quotabar.
				 * This variable will maintain that which quota is till now displayed,
				 * e.g. we have set soft quota and hard quota only, then first it will
				 * draw noraml green block till soft-quota limit, then it will get
				 * element of soft quota i.e. orange element, then it will draw ornage
				 * element till hard-quota and now it reached hard quota so it will draw
				 * red element.
				 */
				element = quota[i].element;

				// set default size of every block to zero so that previous block size calculation is cleared.
				if (element) {
					this.el.child(element).setWidth(0);
				}
			}
		}
	}
});
Ext.reg('zarafa.plugins.files.quotabar', Zarafa.plugins.files.ui.QuotaBar);
