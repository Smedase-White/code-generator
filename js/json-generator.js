export class JsonGenerator {
  generateJsonRequest(className, attributes) {
    if (attributes.length === 0) {
      return JSON.stringify({
        "object": className,
        "method_name": "initialize_from_table",
        "parameters": {}
      }, null, 2);
    }
    
    const parameters = {};
    
    attributes.forEach(attr => {
      if (attr.dictionaryBase && attr.dictionaryBase.trim()) {
        parameters[attr.name] = "";
      } else if (attr.selfAttr) {
        parameters[attr.name] = {
          "object": attr.type,
          "method_name": "initialize_from_table",
          "parameters": {
            "value": ""
          }
        };
      } else {
        parameters[attr.name] = {
          "object": attr.type,
          "method_name": "find",
          "parameters": {
            "database_id": ""
          }
        };
      }
    });
    
    const jsonRequest = {
      "object": className,
      "method_name": "initialize_from_table",
      "parameters": parameters
    };
    
    return `<=== ${className} ===>${JSON.stringify(jsonRequest, null, 2)}`;
  }

  generateDictionaryRequest(info) {
    const attributeTypes = {};
    info.recordAttributes.forEach(attr => {
      attributeTypes[attr.name] = attr.type;
    });

    const values = info.recordValues.map(record => {
      let mapData = JSON.parse(record.map);
      
      const valueObject = {};
      Object.keys(mapData).forEach(attrName => {
        const attrType = attributeTypes[attrName];
        if (attrType) {
          valueObject[attrName] = {
            "object": attrType,
            "method_name": "initialize_from_table",
            "parameters": {
              "value": mapData[attrName]
            }
          };
        }
      });
      
      return {
        "key": record.key,
        "value": valueObject,
        "schema": {
          "name_ru": record.nameRu,
          "self_attr": true
        }
      };
    });

    const result = {
      "object": `${info.dictBase}Dictionary`,
      "method_name": "initialize_from_table",
      "parameters": {
        "dictionary_name": {
          "object": "TextAttr",
          "method_name": "initialize_from_table",
          "parameters": {
            "value": `Справочник '${info.dictNameRu}'`
          }
        },
        "values": values
      }
    };

    return `<=== ${info.dictBase}Dictionary ===>${JSON.stringify(result, null, 2)}`;
  }
}
