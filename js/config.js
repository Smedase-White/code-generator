export const STORAGE_KEYS = {
  CLASS_NAME: 'luaGenerator_className',
  CLASS_NAME_RU: 'luaGenerator_classNameRu',
  PARENT_NAME: 'luaGenerator_parentName',
  ATTRIBUTES: 'luaGenerator_attributes',
  CODE_TYPE: 'luaGenerator_codeType'
};

export function getFileName(className, codeType) {
  if (codeType === 'json') {
    return 'request.json';
  }
  return className.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase() + '.lua';
}

export function getCSSVariable(variableName) {
    return getComputedStyle(document.documentElement)
           .getPropertyValue(variableName)
           .trim();
}

export function getFormData(classNameInput, classNameRuInput, parentNameInput, codeTypeSelect, attributes) {
  return {
    className: classNameInput.value.trim(),
    classNameRu: classNameRuInput.value.trim(),
    parentName: parentNameInput.value.trim(),
    codeType: codeTypeSelect.value,
    attributes: attributes,
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
}
