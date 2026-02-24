export class LuaGenerator {
  getAutoImports(attributes, className, parentName) {
    const imports = new Set();
    
    attributes.forEach(attr => {
      if (attr.type && attr.type.trim()) {
        imports.add(attr.type.trim());
      }
      if (attr.dictionaryBase && attr.dictionaryBase.trim()) {
        imports.add('Dictionary');
      }
    });
    
    if (className && imports.has(className)) {
      imports.delete(className);
    }
    if (parentName && imports.has(parentName)) {
      imports.delete(parentName);
    }
    
    return Array.from(imports).sort();
  }

  generateImportString(className) {
    return `local ${className} = BaseClass:require('${className}')`;
  }

  generateAttributeInfo(attr) {
    let schema = `    ${attr.name} = {\n`;
    schema += `      type = ${attr.type}`;
    if (attr.nameRu) {
      schema += `,\n      name_ru = '${attr.nameRu}'`;
    }
    
    if (attr.selfAttr) {
      schema += `,\n      self_attr = true`;
    }
    
    if (attr.hasStandardSetter === true || attr.hasStandardSetter === false) {
      schema += `,\n      with_setters = true`;
    }
    
    schema += `\n    }`;
    return schema;
  }

  generateCustomSetter(className, parentName, attr) {
    let setter = `function ${className}:set_${attr.name}(value)\n`;
    
    if (attr.fromParent) {
      setter += `  ${parentName}._instanceDict.set_${attr.name}(self, value)\n`;
    } else {
      setter += `  self.${attr.name} = value\n`;
    }
    
    setter += `end`;
    
    return setter;
  }

  generateMethod(className, methodInfo, isStatic) {
    const isStaticWithInstanceCall = methodInfo.methodType === null;
    
    let method = '';
    
    if (isStatic) {
      method += `function ${className}.static:${methodInfo.name}(params)\n`;

      if (methodInfo.parameters) {
        const params = methodInfo.parameters.split(',').map(p => p.trim());
        params.forEach(param => {
          if (param && param !== 'params') {
            method += `  Utils:key_exists(params, '${param}')\n`;
          }
        });
      }
      
      if (isStaticWithInstanceCall) {
        method += `  local instance = self:find(params)\n\n`;
        method += `  instance:${methodInfo.name}(`;
        
        if (methodInfo.parameters) {
          const params = methodInfo.parameters.split(',').map(p => p.trim());
          const instanceParams = params.filter(p => p && p !== 'params').join(', ');
          method += instanceParams;
        }
        
        method += `)\n\n`;
        method += `  return instance\n`;
      } else {
        method += `  -- TODO ${methodInfo.description || methodInfo.nameRu}\n`;
      }
      
      method += `end\n\n`;
    } else {
      method += `function ${className}:${methodInfo.name}(`;
      method += methodInfo.parameters || '';
      method += `)\n`;
      method += `  -- TODO ${methodInfo.description || methodInfo.nameRu}\n`;
      method += `end\n\n`;
    }
    
    return method;
  }

  generateLuaCode(codeInfo) {
    const className = codeInfo.className;
    const classNameRu = codeInfo.classNameRu;
    const parentName = codeInfo.parentName;
    const attributes = codeInfo.attributes;
    const methods = codeInfo.methods || [];

    let code = `<=== ${className} ===>`;
    code += `--ignore_migrations\n`;
    code += `--${classNameRu}\n`;
    
    if (parentName && parentName.trim()) {
      code += `${this.generateImportString(parentName)}\n\n`;
    }

    const imports = this.getAutoImports(attributes, className, parentName);
    if (imports.length > 0) {
      code += imports.map(importClass => `${this.generateImportString(importClass)}`).join('\n');
      code += `\n\n`;
    }
    
    code += `local ${className} = class('${className}', ${parentName || 'BaseClass'})\n\n`;
    
    if (attributes.length > 0) {
      code += `${className}:update_attributes_info({\n`;
      
      code += attributes.map(attr => this.generateAttributeInfo(attr)).join(',\n')
      
      code += `\n})\n\n`;
    }

    const dictionarySetters = attributes.filter(attr => attr.dictionaryBase && attr.dictionaryBase.trim());
    if (dictionarySetters.length > 0) {
      code += `Dictionary:generate_setters_from_dictionaries(${className}, {`;
      code += dictionarySetters.map(attr => {
        const suffix = attr.dictionaryAttr ? `.${attr.dictionaryAttr}<${attr.type}>` : '';
        return `\n  ${attr.name} = "${attr.dictionaryBase}Dictionary.%s<${attr.dictionaryBase}Record>${suffix}"`;
      }).join(',');
      code += `\n})\n\n`;
    }
    
    const newAttributes = attributes.filter(attr => !attr.fromParent);
    if (newAttributes.length > 0) {
      code += `function ${className}.static:initialize_from_table(data)\n`;

      const requiredAttributes = newAttributes.filter(attr => attr.required);
      if (requiredAttributes.length > 0) {
        code += requiredAttributes.map(attr => `  Utils:key_exists(data, '${attr.name}')`).join('\n');
        code += '\n\n';
      }

      if (parentName && parentName.trim()) {
        code += `  local instance = ${parentName}.initialize_from_table(self, data)\n`;
      } else {
        code += `  local instance = self:initialize_default()\n`;
      }
      code += `\n`;
      
      newAttributes.forEach(attr => {
        if (attr.name) {
          if (attr.hasStandardSetter === true || attr.hasStandardSetter === false) {
            code += `  instance:set_${attr.name}(data.${attr.name})\n`;
          } else if (attr.dictionaryBase) {
            code += `  instance:set_${attr.name}_from_dictionary(data.${attr.name})\n`;
          } else {
            code += `  instance.${attr.name} = data.${attr.name}\n`;
          }
        }
      });
      
      code += `\n  return instance\n`;
      code += `end\n\n`;
    }

    const staticMethods = methods.filter(m => m.methodType === false || m.methodType === null);
    staticMethods.forEach(method => {
      code += this.generateMethod(codeInfo.className, method, true);
    });
    
    const customSetters = attributes.filter(attr => attr.hasStandardSetter === true);
    if (customSetters.length > 0) {
      code += customSetters.map(attr => this.generateCustomSetter(className, parentName, attr)).join('\n');
      code += `\n\n`;
    }
    
    const instanceMethods = methods.filter(m => m.methodType === true || m.methodType === null);
    instanceMethods.forEach(method => {
      code += this.generateMethod(codeInfo.className, method, false);
    });
    
    code += `return ${className}`;
    
    return code;
  }
}
