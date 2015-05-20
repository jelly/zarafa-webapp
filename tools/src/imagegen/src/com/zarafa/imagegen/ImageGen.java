package com.zarafa.imagegen;
import java.awt.Color;
import java.awt.GradientPaint;
import java.awt.Graphics2D;
import java.awt.LinearGradientPaint;
import java.awt.RenderingHints;
import java.awt.TexturePaint;
import java.awt.geom.Path2D;
import java.awt.geom.Point2D;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

public class ImageGen
{
	
	public static String configFileName = "colors.cfg";
	
	public static int unitHeight = 23;
	public static int zoomLevels[] = new int[] {5, 6, 10, 15, 30, 60};

	public static void createTimeStripImage(String fileName, int heightInUnits, Color strip, Color halfHourLine, Color hourLine)
	{
		int height = heightInUnits * unitHeight;
        BufferedImage image = new BufferedImage(1, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2 = image.createGraphics();        
        
        g2.setColor(strip);
        g2.fillRect(0,0,image.getWidth(),image.getHeight());

        g2.setColor(halfHourLine);
        for (int i=1; i<heightInUnits; i++)
        	g2.drawLine(0, i*unitHeight-1, 1, i*unitHeight-1);
        
        g2.setColor(hourLine);
        g2.drawLine(0, height-1, 1, height-1);
        
        // write to file
        try {
			ImageIO.write(image, "gif", new File(fileName));
		} catch (IOException e) {
			e.printStackTrace();
			System.exit(-1);
		}      
    }
	
	public static void createAppointmentBackground(String fileName, Color gradientLow, Color gradientHigh)
	{
		int width = 128;
		int height = 32;

		BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2 = image.createGraphics();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        Point2D start = new Point2D.Float(0, 0);
        Point2D end = new Point2D.Float(width, 0);
        
        float[] dist = {0.0f, 1.0f};
        
        Color[] colors = {gradientHigh, gradientLow};
        
        LinearGradientPaint gp = new LinearGradientPaint(start, end, dist, colors);
        
        // GradientPaint gp = new GradientPaint(0, 0, gradientHigh, 0, height, gradientLow);
        
        g2.setPaint(gp);
        g2.fillRect(0,0,width,height);

        // write to file
        try {
			ImageIO.write(image, "gif", new File(fileName));
		} catch (IOException e) {
			e.printStackTrace();
			System.exit(-1);
		}    
	}
	
	public static void createAppointmentBackground2(String fileName, Color gradientLow, Color gradientHigh)
	{
		int width = 1;
		int height = 21;

		BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2 = image.createGraphics();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        Point2D start = new Point2D.Float(0, 0);
        Point2D end = new Point2D.Float(0, height);
        
        float[] dist = {0.0f, 1.0f};
        
        Color[] colors = {gradientHigh, gradientLow};
        
        LinearGradientPaint gp = new LinearGradientPaint(start, end, dist, colors);
        
        // GradientPaint gp = new GradientPaint(0, 0, gradientHigh, 0, height, gradientLow);
        
        g2.setPaint(gp);
        g2.fillRect(0,0,width,height);

        // write to file
        try {
			ImageIO.write(image, "gif", new File(fileName));
		} catch (IOException e) {
			e.printStackTrace();
			System.exit(-1);
		}    
	}
	
	public static Path2D.Double createPath(int x, int y, int width, int height, int inset, int arc)
	{
        Path2D.Double p = new Path2D.Double();
        p.moveTo(x, y + height);
        p.lineTo(x, y + arc);
        p.curveTo(x, y, x, y, x + arc, y);
        p.lineTo(x + width-inset, y);
        // p.lineTo(x + width, y + height);
        p.curveTo(
        		x + width-inset + arc, y,
        		x + width - arc, y + height-1,
        		x + width, y + height-1);
        p.lineTo(x + width, y + height);
        p.closePath();
        
        return p;
    }
	
	public static void createTabImage(String fileName, int height, Color background, Color gradientLow, Color gradientHigh, Color border)
	{
		int width = 128;
		int inset = 32;
		int borderSize = 3;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2 = image.createGraphics();        
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        g2.setColor(background);
        g2.fillRect(0,0,image.getWidth(),image.getHeight());

        /*
        Polygon p = new Polygon();
        p.addPoint(0, 0);
        p.addPoint(width - inset, 0);
        p.addPoint(width, height);
        p.addPoint(0, height);

        g2.setColor(gradientLow);
        g2.fill(p);

        g2.setColor(border);
        g2.draw(p);

        Polygon p2 = new Polygon();
        p2.addPoint(borderSize, borderSize);
        p2.addPoint(width - inset, borderSize);
        p2.addPoint(width-borderSize, height);
        p2.addPoint(borderSize, height);

        GradientPaint gp = new GradientPaint(0, - height/2, gradientHigh, 0, height, gradientLow);
        g2.setPaint(gp);
        g2.fill(p2);
        */

        /*
        int arc = 20;
        
        g2.setColor(gradientLow);
        g2.fillRoundRect(0, 0, width-1, height*2, arc, arc);
        
        g2.setColor(border);
        g2.drawRoundRect(0, 0, width-1, height*2, arc, arc);

        GradientPaint gp = new GradientPaint(0, borderSize - height, gradientHigh, 0, height, gradientLow);
        g2.setPaint(gp);
        g2.fillRoundRect(borderSize, borderSize, width-borderSize*2, height*2, arc-borderSize, arc-borderSize);
        */
        
        Path2D.Double p = createPath(0, 0, width, height, inset, 20);

        g2.setColor(gradientLow);
        g2.fill(p);

        g2.setColor(border);
        g2.draw(p);
        
        p = createPath(borderSize, borderSize, width-borderSize*2, height, inset - borderSize, 20-borderSize);
        
        GradientPaint gp = new GradientPaint(0, borderSize - height, gradientHigh, 0, height-1, gradientLow);
        g2.setPaint(gp);
        g2.fill(p);

        // write to file
        try {
			ImageIO.write(image.getSubimage(0, 0, inset, height), "gif", new File(fileName + "_left.gif"));
			ImageIO.write(image.getSubimage(inset, 0, 1, height), "gif", new File(fileName + "_center.gif"));
			ImageIO.write(image.getSubimage(width-inset, 0, inset, height), "gif", new File(fileName + "_right.gif"));
		} catch (IOException e) {
			e.printStackTrace();
			System.exit(-1);
		}      
    }

	public static void createBoxStripImages(String fileName, Color borderColor, BufferedImage pattern)
	{
		int width = 6;
		int height = 8;
		
		BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2 = image.createGraphics();        
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        g2.setColor(borderColor);
        g2.fillRect(0, 0, width, height);
        g2.setColor(Color.white);
        g2.fillRect(0, 0, width-1, height);
        
        // write to file
        try {
			ImageIO.write(image, "gif", new File(fileName + "_free.gif"));
		} catch (IOException e) {
			e.printStackTrace();
			System.exit(-1);
		}    

        g2.setColor(borderColor);
        g2.fillRect(0, 0, width, height);
        g2.setColor(Color.decode("#94309c"));
        g2.fillRect(0, 0, width-1, height);
        
        // write to file
        try {
			ImageIO.write(image, "gif", new File(fileName + "_outofoffice.gif"));
		} catch (IOException e) {
			e.printStackTrace();
			System.exit(-1);
		}    

        g2.setColor(borderColor);
        g2.fillRect(0, 0, width, height);
		g2.setPaint(new TexturePaint(pattern, new Rectangle2D.Float(0.0f, 0.0f, pattern.getWidth(), pattern.getWidth())));
        g2.fillRect(0, 0, width-1, height);

        // write to file
        try {
			ImageIO.write(image, "gif", new File(fileName + "_tentative.gif"));
		} catch (IOException e) {
			e.printStackTrace();
			System.exit(-1);
		}    
	}
	
	public void createImages(String outputDirectory, String resourceDirectory, ColorScheme colors)
	{
		// Read pattern file (dashed line pattern)
		BufferedImage pattern = null;
        try {
    		pattern = ImageIO.read(new File(resourceDirectory + "/dashed_background.gif"));
		} catch (IOException e) {
			e.printStackTrace();
			System.exit(-1);
		}    

		for (int zoomLevel : zoomLevels)
		{
			int units = 60 / zoomLevel;
			createTimeStripImage(String.format("%s/cs_%s_timestrip_%d_normal.gif", outputDirectory, colors.name, zoomLevel), units, colors.stripNormal, colors.lineNormal, colors.hourLine);
			createTimeStripImage(String.format("%s/cs_%s_timestrip_%d_working.gif", outputDirectory, colors.name, zoomLevel), units, colors.stripWorking, colors.lineWorking, colors.hourLine);
		}
		
		createTabImage(String.format("%s/cs_%s_timestrip_tab", outputDirectory, colors.name), 24, Color.white, colors.borderInner, colors.stripNormal, colors.border);
		createAppointmentBackground(String.format("%s/cs_%s_timestrip_appointment.gif", outputDirectory, colors.name), colors.borderInner, colors.header);
		createAppointmentBackground2(String.format("%s/cs_%s_horizontal_appointment_background.gif", outputDirectory, colors.name), colors.border, colors.header);
		
		createBoxStripImages(String.format("%s/cs_%s", outputDirectory, colors.name), colors.border, pattern);
	}

}
