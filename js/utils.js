export function getAutoImports(attributes) {
  const imports = new Set();
  
  attributes.forEach(attr => {
    if (attr.type && attr.type.trim()) {
      imports.add(attr.type.trim());
    }
    if (attr.dictionaryBase && attr.dictionaryBase.trim()) {
      imports.add('Dictionary');
    }
  });
  
  return Array.from(imports).sort();
}
