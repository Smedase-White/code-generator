import { STORAGE_KEYS } from './config.js';

export class StorageManager {
  constructor(elements, attributes) {
    this.elements = elements;
    this.attributes = attributes;
  }

  saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEYS.CLASS_NAME, this.elements.classNameInput.value);
    localStorage.setItem(STORAGE_KEYS.CLASS_NAME_RU, this.elements.classNameRuInput.value);
    localStorage.setItem(STORAGE_KEYS.PARENT_NAME, this.elements.parentNameInput.value);
    localStorage.setItem(STORAGE_KEYS.ATTRIBUTES, JSON.stringify(this.attributes));
    localStorage.setItem(STORAGE_KEYS.CODE_TYPE, this.elements.codeTypeSelect.value);
  }

  loadFromLocalStorage() {
    const savedClassName = localStorage.getItem(STORAGE_KEYS.CLASS_NAME);
    const savedClassNameRu = localStorage.getItem(STORAGE_KEYS.CLASS_NAME_RU);
    const savedParentName = localStorage.getItem(STORAGE_KEYS.PARENT_NAME);
    const savedAttributes = localStorage.getItem(STORAGE_KEYS.ATTRIBUTES);
    const savedCodeType = localStorage.getItem(STORAGE_KEYS.CODE_TYPE);
    
    if (savedClassName) this.elements.classNameInput.value = savedClassName;
    if (savedClassNameRu) this.elements.classNameRuInput.value = savedClassNameRu;
    if (savedParentName) this.elements.parentNameInput.value = savedParentName;
    if (savedAttributes) {
      try {
        this.attributes.splice(0, this.attributes.length, ...JSON.parse(savedAttributes));
      } catch (e) {
        console.error('Ошибка при загрузке атрибутов из localStorage:', e);
      }
    }
    if (savedCodeType) this.elements.codeTypeSelect.value = savedCodeType;
  }

  clearLocalStorage() {
    localStorage.removeItem(STORAGE_KEYS.CLASS_NAME);
    localStorage.removeItem(STORAGE_KEYS.CLASS_NAME_RU);
    localStorage.removeItem(STORAGE_KEYS.PARENT_NAME);
    localStorage.removeItem(STORAGE_KEYS.ATTRIBUTES);
    localStorage.removeItem(STORAGE_KEYS.CODE_TYPE);
  }
}
