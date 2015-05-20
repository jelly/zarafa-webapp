package com.zarafa.imagegen;
import java.awt.Color;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ColorScheme
{
	
	private final static Pattern colorSchemePattern = 
		Pattern.compile("\\W*(\\w+)\\W+(#[0-9abcdef]+)\\W+(#[0-9abcdef]+)\\W+(#[0-9abcdef]+)\\W+(#[0-9abcdef]+)\\W+(#[0-9abcdef]+)\\W+(#[0-9abcdef]+)\\W+(#[0-9abcdef]+)\\W+(#[0-9abcdef]+).*");

	public Color stripNormal, stripWorking;
	public Color lineNormal, lineWorking, hourLine;
	public Color border, borderInner, header;
	public String name;
	
	private ColorScheme()
	{
		
	}

	public static ColorScheme decode(String colorSchemeString)
	{
		// Check preconditions
		if (colorSchemeString == null) throw new NullPointerException();
		
		// Parse
		Matcher matcher;
		if ((matcher = colorSchemePattern.matcher(colorSchemeString)).matches())
		{
			if (matcher.groupCount()!=9)
				throw new IllegalArgumentException("String does not match format.");
			
			
			ColorScheme ret = new ColorScheme();
			
			ret.name = matcher.group(1);
			ret.stripNormal = Color.decode(matcher.group(2));
			ret.stripWorking = Color.decode(matcher.group(3));
			ret.lineNormal = Color.decode(matcher.group(4));
			ret.lineWorking = Color.decode(matcher.group(5));
			ret.hourLine = Color.decode(matcher.group(6));
			ret.border = Color.decode(matcher.group(7));
			ret.borderInner = Color.decode(matcher.group(8));
			ret.header = Color.decode(matcher.group(9));
			
			return ret;
		}
		else
			throw new IllegalArgumentException("String does not match format.");	
		
	}
	
}
