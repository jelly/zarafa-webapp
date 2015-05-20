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

function Property(type, isPublic)
{
	return {
		_ : Property,
		type : type,
		isPublic : isPublic
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

function dump()
{

	// print out digraph stuff, font sizes, etc
	print('digraph classdiagram {');
	print('\tnode [ shape = "record" ]');

	// print out each class definition
	for (var className in classes)
	{
		var classDef = classes[className];
		print('\t' + className + ' [');
		
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
	print('\tedge [ arrowhead = "empty" ]');
	for (var className in classes)
	{
		var classDef = classes[className];
		if (classDef._extends)
			print('\t' + className + '->' + classDef._extends);
	}
	
	

	print('}');

}
Class('Context', {
	
	// properties
	id : Property('Number', false),
	
	// methods
	getId : Method('Void'),
	getComponents : Method('Void', [ Argument('area', 'String') ]),
	enable : Method('Void', [ Argument('parameters', 'Object') ]),
	disable : Method('Void')
	
});

Class('MailContext', {
}, 'Context');

Class('TaskContext', {
}, 'Context');

Class('CalendarContext', {
}, 'Context');

dump();
