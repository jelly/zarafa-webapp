package com.zarafa.imagegen;
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;


public class ImageGenTask extends Task
{
	
	private String configFileName, outputDirectory, resourceDirectory;
	
	public ArrayList<ColorScheme> loadColorSchemes() throws FileNotFoundException, IOException
	{
		ArrayList<ColorScheme> colorSchemes = new ArrayList<ColorScheme>();
		
		BufferedReader in = new BufferedReader(new FileReader(configFileName));
		
		String line;
		while ((line=in.readLine())!=null)
		{
			line = line.trim();
			if (!line.startsWith("#") && !(line.trim().equals("")))
				colorSchemes.add(ColorScheme.decode(line));
		}
		
		in.close();		
		
		return colorSchemes;		
	}
	
	public void execute()
	{
		
		if (configFileName==null) throw new BuildException("configfile property not set.");
		if (outputDirectory==null) throw new BuildException("outdir property not set.");
		if (resourceDirectory==null) throw new BuildException("resourcedir property not set.");
		
		try {
			
			ArrayList<ColorScheme> colorSchemes = loadColorSchemes();
			
			ImageGen imageGen = new ImageGen();
			
			for (ColorScheme scheme : colorSchemes) imageGen.createImages(outputDirectory, resourceDirectory, scheme);
			
		} catch (FileNotFoundException ex)
		{
			System.out.println("Configuration file not found: " + ex.getMessage());
		} catch (IOException ex)
		{
			System.out.println("IO error reading configuration file: " + ex.getMessage());
		}		
		
	}
	
	public void setConfigFile(String configFileName)
	{
		this.configFileName = configFileName;
	}
	
	public void setOutDir(String outputDirectory)
	{
		this.outputDirectory = outputDirectory;
	}
	
	public void setResourceDir(String resourceDirectory)
	{
		this.resourceDirectory = resourceDirectory;
	}

}
