Ext.namespace('Zarafa.common.rules.data');

/**
 * @class Zarafa.common.rules.data.ConditionFlags
 * @extends Zarafa.core.Enum
 * @singleton
 */
Zarafa.common.rules.data.ConditionFlags = Zarafa.core.Enum.create({
	/**
	 * Indicates that the condition is unknown/unsupported
	 * @property
	 * @type Number
	 */
	UNKNOWN : -1,

	/**
	 * Indicates that the condition checks whom has sent it
	 * @property
	 * @type Number
	 */
	RECEIVED_FROM : 1,

	/**
	 * Indicates that the condition checks to whom it was sent
	 * @property
	 * @type Number
	 */
	SENT_TO : 2,

	/**
	 * Indicates that the condition checks which words are in the subject
	 * @property
	 * @type Number
	 */
	SUBJECT_WORDS : 3,

	/**
	 * Indicates that the condition checks which words are in the body
	 * @property
	 * @type Number
	 */
	SUBJECT_BODY_WORDS : 4,

	/**
	 * Indicates that the condition checks which words are in the sender
	 * @property
	 * @type Number
	 */
	SENDER_WORDS : 5,

	/**
	 * Indicates that the condition checks if the user is in the To or CC field
	 * @property
	 * @type Number
	 */
	NAME_TO_CC : 6,

	/**
	 * Indicates that the condition checks if the message was sent with a certain importance
	 * @property
	 * @type Number
	 */
	IMPORTANCE : 7,

	/**
	 * Indicates that the condition checks if the message was sent only to the user
	 * @property
	 * @type Number
	 */
	SENT_TO_ME_ONLY : 8
});
