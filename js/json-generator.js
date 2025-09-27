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
      if (attr.selfAttr) {
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
    
    return JSON.stringify(jsonRequest, null, 2);
  }
}
