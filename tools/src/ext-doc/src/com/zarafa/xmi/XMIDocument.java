package com.zarafa.xmi;

import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Result;
import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.TransformerFactoryConfigurationError;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import extdoc.jsdoc.docs.DocClass;
import extdoc.jsdoc.docs.DocMethod;
import extdoc.jsdoc.docs.DocProperty;
import extdoc.jsdoc.docs.Param;

public class XMIDocument
{
	
	private Document document;
	private Element model;
    private static long id = 0;
    
    private List<DocClass> classes;
    
    private HashMap<String, Element> packages;
    private HashMap<String, String> types;
	
	public XMIDocument(List<DocClass> classes)
	{
		this.classes = classes;
		
		this.create();
	}
    
    public static String getUniqueIdentifier()
    {
    	return String.format("EXT_DOC_%08d", id++);
    }
    
	private void create()
	{
		DocumentBuilder builder;
		try
		{
			
			builder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
			document = builder.newDocument();
			
    		// create root node
    		Element root = document.createElement("xmi:XMI");
    		root.setAttribute("xmi:version", "2.1");
    		root.setAttribute("xmlns:UML", "http://schema.omg.org/spec/UML/2.1");
    		root.setAttribute("xmlns:xmi", "http://schema.omg.org/spec/XMI/2.1");
    		document.appendChild(root);
    		
    		// create documentation node
    		Element documentation = document.createElement("xmi:documentation");
    		documentation.setAttribute("exporter", "ext-doc");
    		documentation.setAttribute("exporterVersion", "1.0.0");
    		root.appendChild(documentation);
    		
    		// create model
    		model = document.createElement("uml:Model");
    		model.setAttribute("xmi:type", "uml:Model");
    		model.setAttribute("xmi:id", "themodel");
    		model.setAttribute("name", "ext-doc");
    		root.appendChild(model);
    		
    		// create package tree
    		packages = createPackageTree();
    		types = createTypeSet();
    		
		} catch (ParserConfigurationException exception)
		{
			throw new XMIException(exception);
		}
	}
	
    public Element createModel()
    {
    	
    	
		for (int i=0; i<classes.size(); i++)
    	{
			DocClass docClass = classes.get(i);
			Element packageElement = packages.get(docClass.packageName);
			Element classElement = createPackagedElement("uml:Class", docClass.shortClassName);
			classElement.setAttribute("xmi:id", "EXT_DOC_" + docClass.className);
			
			// Add class description.
			classElement.appendChild(createComment(docClass.description));
			
			// Add properties.
			for (DocProperty docProperty : docClass.properties)
			{
				Element propertyElement = createProperty(types, docProperty.name, docProperty.type);
				
				// Add property description.
				propertyElement.appendChild(createComment(docProperty.description.longDescr));
				
				classElement.appendChild(propertyElement);
			}
			
			// Add methods.
			for (DocMethod docMethod : docClass.methods)
			{
				Element operationElement = createOperation(types, docMethod.name);
				
				// Add operation description.
				operationElement.appendChild(createComment(docMethod.description.longDescr));
				
				// Add parameter descriptions.
				for (Param param : docMethod.params)
					operationElement.appendChild(createParameter(types, "in", param.name, param.type, param.description));

				operationElement.appendChild(createParameter(types, "return", "return", docMethod.returnType, docMethod.returnDescription));
				
				classElement.appendChild(operationElement);
			}
			
			packageElement.appendChild(classElement);
    	}
		
		return model;
    }
	
	public void write(OutputStream outStream) throws IOException
	{
		// Create model contents.
		createModel();
		
		// Write out the xml
		Transformer transformer;
		try
		{
			transformer = TransformerFactory.newInstance().newTransformer();
			transformer.setOutputProperty(OutputKeys.INDENT, "yes");
			transformer.setOutputProperty("{http://xml.apache.org/xslt}" + "indent-amount", "2");
			Source input = new DOMSource(document);
			Result output = new StreamResult(outStream);
			transformer.transform(input, output);
		} catch (TransformerConfigurationException exception)
		{
			throw new XMIException(exception);
		} catch (TransformerFactoryConfigurationError exception)
		{
			throw new XMIException(exception);
		} catch (TransformerException exception)
		{
			throw new XMIException(exception);
		}
	}
    
    @SuppressWarnings("serial")
	private HashMap<String, Element> createPackageTree()
    {
    	HashMap<String, Element> ret = new HashMap<String, Element>() {
    		
    	    public String getParentPackage(String packageName)
    	    {
    	    	String parts[] = packageName.split("\\.");
    	    	String ret = "";
    	    	for (int i=0; i<parts.length-1; i++) ret += (i==0?"":".") + parts[i];    	
    	    	return ret;
    	    }

    	    public String getShortPackageName(String packageName)
    	    {
    	    	String parts[] = packageName.split("\\.");
    	    	return parts[parts.length-1];
    	    }

    	    @Override
    	    public Element get(Object key)
    		{
    	    	String name = (String)key;
    	    	
    	    	// Root is the model element.
    	    	if (name.equals(""))
    	    		return model;
    	    	
    	    	// If the package exists, return it.
    	    	if (this.containsKey(name))
    	    		return super.get(name);
    	    	
    	    	// Get parent node.
    	    	Element parent = get(getParentPackage(name));
    	    	
    	    	Element ret = createPackagedElement("uml:Package", getShortPackageName(name)); 
    	    	parent.appendChild(ret);
    	    	this.put(name, ret);
    	    	
    	    	return ret;
    		}
    	    
    	};
    	
    	return ret;
    }
    
    @SuppressWarnings("serial")
	public HashMap<String, String> createTypeSet()
    {
    	
    	return new HashMap<String, String>() {
    		
    		@Override
    		public String get(Object key) {
    			
    			String type = (String)key;
    			
    			if (!this.containsKey(type))
    			{
    				// See if a class can be found with the same name.
    				String ret = null;

    				for (DocClass docClass : classes)
    					if (docClass.className.equals(type))
    						ret = "EXT_DOC_" + docClass.className;
    				
    				if (ret==null)
    				{
	    				Element typeElement = createType(type);
	    				model.appendChild(typeElement);
	    				ret = typeElement.getAttribute("xmi:id");
    				}
    				
    				put(type, ret);
    			}
    			
    			return super.get(key);
    		}
    		
    	};
    }

    public Element createPackagedElement(String type)
    {
    	Element ret = document.createElement("packagedElement");
    	ret.setAttribute("xmi:type", type);    	
    	ret.setAttribute("xmi:id", getUniqueIdentifier());    	
    	return ret;
    }    
    
    public Element createPackagedElement(String type, String name)
    {
    	Element ret = createPackagedElement(type);
    	ret.setAttribute("xmi:id", getUniqueIdentifier());    	
    	ret.setAttribute("name", name);    	
    	return ret;
    }    
   
    public Element createProperty(HashMap<String, String> types, String name, String type)
    {
    	Element ret = document.createElement("ownedAttribute");
    	ret.setAttribute("xmi:type", "uml:Property");    	
    	ret.setAttribute("xmi:id", getUniqueIdentifier());    	
    	ret.setAttribute("name", name);    	

    	Element typeElement = document.createElement("type");
    	typeElement.setAttribute("xmi:idref", types.get(type));
    	ret.appendChild(typeElement);
    	
    	return ret;
    }    
   
    public Element createOperation(HashMap<String, String> types, String name)
    {
    	Element ret = document.createElement("ownedOperation");
    	ret.setAttribute("xmi:type", "uml:Operation");    	
    	ret.setAttribute("xmi:id", getUniqueIdentifier());    	
    	ret.setAttribute("name", name);    	
    	return ret;
    }    
   
    public Element createParameter(HashMap<String, String> types, String direction, String name, String type, String description)
    {
    	Element ret = document.createElement("ownedParameter");
    	
    	ret.setAttribute("xmi:type", "uml:Parameter");    	
    	ret.setAttribute("xmi:id", getUniqueIdentifier());    	
    	ret.setAttribute("direction", direction);    	
    	ret.setAttribute("name", name);    	

    	Element typeElement = document.createElement("type");
    	typeElement.setAttribute("xmi:idref", types.get(type));
    	ret.appendChild(typeElement);
    	
    	/*
    	// ret.appendChild(createComment(doc, description));
    	 */
    	
    	return ret;
    }    
   
    public Element createComment(String body)
    {
    	Element ret = document.createElement("ownedComment");
    	ret.setAttribute("xmi:type", "uml:Comment");
    	ret.setAttribute("xmi:id", getUniqueIdentifier());    	
    	ret.setAttribute("body", body);    	
    	return ret;
    }    
   
    public Element createType(String name)
    {
    	Element ret = document.createElement("packagedElement");
    	ret.setAttribute("xmi:type", "uml:DataType");
    	ret.setAttribute("xmi:id", getUniqueIdentifier());    	
    	ret.setAttribute("name", name);
    	return ret;
    }
    
}