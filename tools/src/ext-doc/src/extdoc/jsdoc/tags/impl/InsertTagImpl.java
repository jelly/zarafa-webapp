package extdoc.jsdoc.tags.impl;

import extdoc.jsdoc.tags.InsertTag;

/**
 * User: Andrey Zubkov
 * Date: 01.11.2008
 * Time: 3:04:58
 */
class InsertTagImpl extends TagImpl implements InsertTag
{

    private String insertName;

    private String insertDescription;

    public InsertTagImpl(String name, String text)
    {
        super(name, text);
        String[] str = divideAtWhite(text, 2);
        insertName = str[0];
        insertDescription = str[1];
    }

	@Override
	public String getInsertDescription() {
        return insertDescription;
	}

	@Override
	public String getInsertName() {
        return insertName;
	}
}
