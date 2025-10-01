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

  generateAttributeSchema(attr) {
    let schema = `\n    ${attr.name} = {\n`;
    schema += `      name_ru = '${attr.nameRu || attr.name}'`;
    if (attr.selfAttr) {
        schema += `,\n      self_attr = true`;
    }
    schema += `\n    }`;
    return schema;
  }

  generateLuaCode(codeInfo) {
    const className = codeInfo.className;
    const classNameRu = codeInfo.classNameRu;
    const parentName = codeInfo.parentName;
    const attributes = codeInfo.attributes;

    let code = `<=== ${className} ===>`
    code += `--ignore_migrations\n`;
    code += `--${classNameRu}\n`;
    
    if (parentName && parentName.trim()) {
      code += `${this.generateImportString(parentName)}\n\n`
    }

    const imports = this.getAutoImports(attributes, className, parentName);
    if (imports.length > 0) {
      code += imports.map(importClass => `${this.generateImportString(importClass)}`).join('\n')
      code += `\n\n`
    }
    
    code += `local ${className} = class('${className}', ${parentName || 'BaseClass'})\n\n`;
    
    if (attributes.length > 0) {
      code += `${className}:initialize_attributes_types({\n`;
      code += attributes.map(attr => `  ${attr.name} = { ${attr.type} }`).join(',\n')
      code += `\n})\n\n`;
    }
    
    const newAttributes = attributes.filter(attr => !attr.fromParent);
    if (newAttributes.length > 0) {
      code += `${className}:initialize_schema({\n`;
      code += `  attributes = {`;
      code += newAttributes.map(attr => this.generateAttributeSchema(attr)).join(',')
      code += `\n  }\n`;
      code += `})\n\n`;
    }
    
    const standardSetters = attributes.filter(attr => attr.hasStandardSetter);
    if (standardSetters.length > 0) {
      code += `${className}:generate_setters({ `;
      code += standardSetters.map(attr => `'${attr.name}'`).join(', ');
      code += ` })\n\n`;
    }
    
    const dictionarySetters = attributes.filter(attr => attr.dictionaryBase && attr.dictionaryBase.trim());
    if (dictionarySetters.length > 0) {
      code += `Dictionary:generate_setters_from_dictionaries(${className}, {`;
      code += dictionarySetters.map(attr => `\n  ${attr.name} = "${attr.dictionaryBase}Dictionary.%s<${attr.dictionaryBase}Record>.${attr.dictionaryAttr}<${attr.type}>"`).join(',')
      code += `\n})\n\n`;
    }
    
    if (newAttributes.length > 0) {
      code += `function ${className}.static:initialize_from_table(data)\n`;

      const requiredAttributes = newAttributes.filter(attr => attr.required);
      if (requiredAttributes.length > 0) {
        code += requiredAttributes.map(attr => `  Utils:key_exists(data, '${attr.name}')`).join('\n')
        code += '\n\n'
      }

      if (parentName && parentName.trim()) {
        code += `  local instance = ${parentName}.initialize_from_table(self, data)\n`;
      } else {
        code += `  local instance = self:initialize_default()\n`;
      }
      code += `\n`;
      
      newAttributes.forEach(attr => {
        if (attr.name) {
          if (attr.hasStandardSetter) {
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
    
    code += `return ${className}`;
    
    return code;
  }
}
