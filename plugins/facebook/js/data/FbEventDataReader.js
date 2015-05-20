Ext.namespace('Zarafa.plugins.facebook.data');

/**
 * @class Zarafa.plugins.facebook.data.FbEventDataReader
 * @extends Ext.data.DataReader
 */
Zarafa.plugins.facebook.data.FbEventDataReader = Ext.extend(Ext.data.DataReader, {

	/**
	 * @cfg {Zarafa.core.data.RecordCustomObjectType} customObjectType The custom object type
	 * which represents the {@link Ext.data.Record records} which should be created using
	 * {@link Zarafa.core.data.RecordFactory#createRecordObjectByCustomType}.
	 */
	customObjectType : Zarafa.core.data.RecordCustomObjectType.ZARAFA_FACEBOOK_EVENT,

	/**
	 * @constructor
	 * @param {Object} meta Metadata configuration options (implementation-specific).
	 * @param {Array/Object} recordType
	 * <p>Either an Array of {@link Ext.data.Field Field} definition objects (which
	 * will be passed to {@link Ext.data.Record#create}, or a {@link Ext.data.Record Record}
	 * constructor created using {@link Ext.data.Record#create}.</p>
	 */
	constructor : function(meta, recordType)
	{
		meta = Ext.applyIf(meta || {}, {
			id            : 'id',
			idProperty    : 'id'
		});

		// If no recordType is provided, force the type to be a zarafa facebook event type
		if (!Ext.isDefined(recordType)) {
			recordType = Zarafa.core.data.RecordFactory.getRecordClassByCustomType(meta.customObjectType || this.customObjectType);
		}

		Zarafa.plugins.facebook.data.FbEventDataReader.superclass.constructor.call(this, meta, recordType);
	},

	/**
	 * start reading data from facebook through proxy
	 * @param {object} eventsData Received data from facebook
	 * @return {object} records : data
	 */
	readRecords: function (eventsData) {
		var root = eventsData.data;
		var success = true, v, totalRecords = root.length;
		if(this.meta.totalProperty){
			v = parseInt(this.getTotal(eventsData), 10);
			if(!isNaN(v)){
				totalRecords = v;
			}
		}
		if(this.meta.successProperty){
			v = this.getSuccess(eventsData);
			if(v === false || v === 'false'){
				success = false;
			}
		}
		var rs = this.extractData(eventsData.data, true);
		return {
			success: success,
			records: rs,
			totalRecords: totalRecords
		};
	},
	/**
	 * get an id from object with record data
	 * @param {object} recordData
	 * @return {number} id from the record's dataset
	 */
	getId : function(recordData) {
		return recordData.id;
	},

	/**
	 * extract data from the object
	 * received from the server
	 * @param {object} root
	 * @param {Boolean} returnRecords [false] Set true to return instances of Ext.data.Record
	 * @return {array}
	 */
	extractData: function (root, returnRecords) {
		var newRoot = [];
		var today = new Date();
		var max = today.add(Date.MONTH, 1);
		Ext.each(root, function(data){
			var newDate = new Date(data.start_time);
			if (newDate>=today && newDate<max) {
				newRoot.push(data);
			}
		});
		root = newRoot;
		//below is exact function from the superclass but changed according to ExtJs recommendations - record is created not through constructor, but using create function.
		// A bit ugly this, too bad the Record's raw data couldn't be saved in a common property named "raw" or something.
		var rawName = (this instanceof Ext.data.JsonReader) ? 'json' : 'node';

		// Had to add Check for XmlReader, #isData returns true if root is an Xml-object.  Want to check in order to re-factor
		// #extractData into DataReader base, since the implementations are almost identical for JsonReader, XmlReader
		if (this.isData(root) && !(this instanceof Ext.data.XmlReader)) {
			root = [root];
		}
		var f       = this.recordType.prototype.fields,
			fi      = f.items,
			fl      = f.length,
			rs      = [];
		if (returnRecords === true) {
			var Record = this.recordType;
			for (var i = 0; i < root.length; i++) {
				var n = root[i];
				var record = Zarafa.core.data.RecordFactory.createRecordObjectByCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_FACEBOOK_EVENT, this.extractValues(n, fi, fl), this.getId(n));
				record[rawName] = n;    // <-- There's implementation of ugly bit, setting the raw record-data.
				rs.push(record);
			}
		}
		else {
			for (var i = 0; i < root.length; i++) {
				var data = this.extractValues(root[i], fi, fl);
				data[this.meta.idProperty] = this.getId(root[i]);
				rs.push(data);
			}
		}
		return rs;
		//end of superclass's function
	},

	/**
	 * type-casts a single row of raw-data from server
	 * done because of emptyFn in superclass, so we need to create this function to avoid errors
	 * @param {Object} data
	 * @return Zarafa.plugins.facebook.dataFbEventRecord
	 */
	extractValues: function(data) {
		return data;
	}

});
