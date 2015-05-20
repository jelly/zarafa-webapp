package extdoc.jsdoc.docs;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;
import java.util.ArrayList;
import java.util.List;

/**
 * User: Andrey Zubkov
 * Date: 25.10.2008
 * Time: 5:16:41
 */

@XmlRootElement
public class DocClass extends Doc{
    public String className;
    public String shortClassName;
    public String xtypeName;
    public String ptypeName;
    public String shortXtypeName;    
    public String packageName;
    public String definedIn;
    public boolean singleton;
    public String description;
    public String parentClass;
    public boolean hasConstructor;
    public Description constructorDescription;
    public List<Param> params = new ArrayList<Param>();
    public List<DocCfg> cfgs = new ArrayList<DocCfg>();
    public List<DocProperty> properties = new ArrayList<DocProperty>();
    public List<DocProperty> privateProperties = new ArrayList<DocProperty>();
    public List<DocProperty> protectedProperties = new ArrayList<DocProperty>();
    public List<DocMethod> methods = new ArrayList<DocMethod>();
    public List<DocMethod> privateMethods = new ArrayList<DocMethod>();
    public List<DocMethod> protectedMethods = new ArrayList<DocMethod>();
    public List<DocEvent> events = new ArrayList<DocEvent>();
    public List<DocInsert> inserts = new ArrayList<DocInsert>();
    public List<ClassDescr> subClasses = new ArrayList<ClassDescr>();
    public List<ClassDescr> superClasses = new ArrayList<ClassDescr>();
    @XmlTransient
    public DocClass parent = null;
    public boolean component = false;
}
