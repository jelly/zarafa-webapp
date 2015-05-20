package com.zarafa.extdoc;

import java.io.File;
import java.util.ArrayList;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;
import org.apache.tools.ant.types.FileList;
import org.apache.tools.ant.types.FileSet;

import extdoc.jsdoc.processor.FileProcessor;

/**
 * 
 * I started writing this task, only to found out it doesn't work. The problem lies in the intersection of ANT and JAXB retardedness somewhere. *sigh*
 * 
 * @author niels
 *
 */
public class ExtDocTask extends Task 
{

	private ArrayList<FileSet> fileSets;
	private ArrayList<FileList> fileLists;

	private String outputDirectory, projectFile, templateFile;
	private boolean quiet, verbose;
	
	public ExtDocTask()
	{
		fileSets = new ArrayList<FileSet>();
		fileLists = new ArrayList<FileList>();
	}
	
	private boolean fileExists(String path)
	{
		File file = new File(path);
		return file.exists() && file.isFile();
	}
	
	private boolean directoryExists(String path)
	{
		File file = new File(path);
		return file.exists() && file.isDirectory();
	}
	
	public String[] collectFileNames()
	{
		ArrayList<String> fileNames = new ArrayList<String>();
		
		for (FileSet fileSet : fileSets)
		{
			File dir = fileSet.getDir(getProject());
			for (String fileName : fileSet.getDirectoryScanner(getProject()).getIncludedFiles())
				fileNames.add(dir + "/" + fileName);
		}
		
		for (FileList fileList : fileLists)
		{
			File dir = fileList.getDir(getProject());
			for (String fileName : fileList.getFiles(getProject()))
				fileNames.add(dir + "/" + fileName);
		}

		String[] ret = new String[fileNames.size()];
		return fileNames.toArray(ret);
	}	

	@Override
	public void execute() throws BuildException
	{
		// Check if the required properties are set
		if (outputDirectory==null) throw new BuildException("No output directory given.");
		if (projectFile==null) throw new BuildException("No project file given.");
		if (templateFile==null) throw new BuildException("No template file given.");
		
		// Check if the required files/dirs exist
		if (!directoryExists(outputDirectory)) throw new BuildException(String.format("Output directory %s does not exist or is not a directory.", outputDirectory));
		if (!fileExists(projectFile)) throw new BuildException(String.format("Project file %s does not exist or is not a file.", projectFile));
		if (!fileExists(templateFile)) throw new BuildException(String.format("Template file %s does not exist or is not a file.", templateFile));
		
		String sourceFiles[] = collectFileNames();
		
        FileProcessor processor = new FileProcessor();
        
        if (quiet) processor.setQuiet();
        if (verbose) processor.setVerbose();
        
        processor.process(projectFile, sourceFiles);
        processor.saveToFolder(outputDirectory, templateFile);
        
	}
	
	public void setOutput(String outputDirectory)
	{
		this.outputDirectory = outputDirectory;
	}
	
	public void setProjectFile(String project)
	{
		this.projectFile = project;
	}
	
	public void setTemplate(String templateFile)
	{
		this.templateFile = templateFile;
	}
	
	public void setQuiet(Boolean quiet)
	{
		this.quiet = quiet;
	}
	
	public void setVerbose(Boolean verbose)
	{
		this.verbose = verbose;
	}			

}
