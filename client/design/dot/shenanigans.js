classes = {};

function Class(name, items, parent)
{

	classes[name] = {};

	if (parent)
	{
		var parentClass = classes[parent];
		for (var key in parentClass)
		{
			classes[name][key] = parentClass[key];
		}
			
	}

	for (var key in items)
		classes[name][key] = items[key];
		
	classes[name]._extends = parent;

}

function Property(type, isPublic, dimension)
{
	return {
		_ : Property,
		type : type,
		isPublic : isPublic,
		dimension : dimension || 1
	};
}

function Method(type, arguments, isPublic)
{
	arguments = arguments || [];
	if (isPublic===undefined) isPublic = true;
	return {
		_ : Method,
		type : type, 
		arguments : arguments,
		isPublic : isPublic
	};
}

function Argument(name, type)
{
	return {
		_ : Argument,
		name : name,
		type : type
	};
}

function argumentString(args)
{
	var ret = '(';
	
	for (var i=0, arg; arg=args[i]; i++)
		ret += (i==0?'':', ') + arg.name + ' : ' + arg.type;
	
	ret += ')';
	
	return ret;
}

function classExists(name)
{
	for (c in this.classes)
		if (c==name) return true;	
	return false;
}

function dump()
{


	// print out digraph stuff, font sizes, etc
	print('digraph classdiagram {');
	
//	print('orientation = land;');
//	print('size = "8.27,11.69"; // A4;');
//	print('page = "8.27,11.69"; // A4;');
//	print('ratio = "auto";');
	
	print('\tnode [ shape = "record" ]');

	// print out each class definition
	for (var className in classes)
	{
		var classDef = classes[className];
		print('\t"' + className + '" [');
		
		var line = '\t\tlabel = "{' + className + '|';
		
		// print out properties
		for (var key in classDef)
		{
			var item = classDef[key];
			if (key != '_' && item && item._==Property)
				line += (item.isPublic?'+':'-') + ' ' + key + ' : ' + item.type + '\\l';
		}
		line += '|';

		// print out methods
		for (var key in classDef)
		{
			var item = classDef[key];
			if (key != '_' && item && item._==Method)
				line += (item.isPublic?'+':'-') + ' ' + key + argumentString(item.arguments) + ' : ' + item.type + '\\l';
		}
		line += '}"';
				
		print(line);
		
		
		print("\t]");
	}
	
	// print out extends connections
	print('\tedge [ arrowtail = "empty" arrowhead = "none" ]');
	for (var className in classes)
	{
		var classDef = classes[className];
		if (classDef._extends)
			print('\t"' + classDef._extends + '"->"' + className +'"');
	}
	
// 	var connections = [];
	
	// print out uses connections
	print('\tedge [ arrowtail = "none" arrowhead = "none" ]');
	for (var className in classes)
	{
		var classDef = classes[className];
		
		for (key in classDef)
			if (classDef[key] && classDef[key]._==Property)
			{
				var type = classDef[key].type;
				var typeClass = type.replace('[]', '');
				
				// TODO fix cardinality to go both ways
				var cardinality = typeClass==type?'1':'*';
				
				if (classExists(typeClass))
					print('\t"' + className + '" ->"' + typeClass +'" [ headlabel = "' + cardinality + '"]');
					
				/* 					connections.push({
					start : className,
					end : 
				})*/
			}
		
	}
	
	/*
	for (var className in classes)
	{
		var classDef = classes[className];
		
		for (key in classDef)
			if (classDef[key]._==Property)
			{
				var type = classDef[key].type;
				var typeClass = type.replace('[]', '');
				
				// TODO fix cardinality to go both ways
				var cardinality = typeClass==type?'1':'*';
				
				if (classExists(typeClass))
					print('\t"' + className + '" ->"' + typeClass +'" [ headlabel = "' + cardinality + '"]');
			}
		
	}
	*/

	print('}');

}
