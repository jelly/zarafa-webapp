<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="text"/>
	
	
	<xsl:template match="/">
	        <xsl:for-each select="//classes">
			Class('<xsl:value-of select="className"/>', {
			}
			<!--<xsl:if test="superClasses">-->
				,<xsl:value-of select="superClasses[last()]/shortClassName"/>
			<!--/xsl:if-->
			);
        	</xsl:for-each>
	</xsl:template>

	<!--suppress default templates-->
	<xsl:template match="*"/>	

</xsl:stylesheet>

