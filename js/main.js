import { getFormData } from './config.js';
import { UIManager } from './ui-manager.js';
import { StorageManager } from './storage-manager.js';
import { LuaGenerator } from './lua-generator.js';
import { JsonGenerator } from './json-generator.js';
import { CodeAnimator } from './code-animator.js';

let attributes = [];

const elements = {
  classNameInput: document.getElementById('className'),
  classNameRuInput: document.getElementById('classNameRu'),
  parentNameInput: document.getElementById('parentName'),
  addAttributeBtn: document.getElementById('addAttribute'),
  clearDataBtn: document.getElementById('clearData'),
  saveDataBtn: document.getElementById('saveData'),
  loadDataBtn: document.getElementById('loadData'),
  attributesBody: document.getElementById('attributesBody'),
  generateCodeBtn: document.getElementById('generateCode'),
  generatedCodePre: document.getElementById('generatedCode'),
  fileNameSpan: document.getElementById('fileName'),
  codeTypeSelect: document.getElementById('codeType'),
  fileInput: document.getElementById('fileInput')
};

const uiManager = new UIManager(elements, attributes);
const storageManager = new StorageManager(elements, attributes);
const luaGenerator = new LuaGenerator();
const jsonGenerator = new JsonGenerator();
const codeAnimator = new CodeAnimator();

window.deleteAttribute = (index) => {
  const row = elements.attributesBody.children[index];
  if (row) {
    row.style.transition = 'all 0.3s ease-out';
    row.style.opacity = '0';
    row.style.transform = 'translateX(-100%)';
    
    setTimeout(() => {
      attributes.splice(index, 1);
      uiManager.renderAttributesTable();
      storageManager.saveToLocalStorage();
    }, 300);
  } else {
    attributes.splice(index, 1);
    uiManager.renderAttributesTable();
    storageManager.saveToLocalStorage();
  }
};

window.updateAttribute = (index, field, value) => {
  attributes[index][field] = value;
  storageManager.saveToLocalStorage();
};

window.clearAllData = () => {
  if (confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
    elements.classNameInput.value = '';
    elements.classNameRuInput.value = '';
    elements.parentNameInput.value = '';
    elements.codeTypeSelect.value = 'lua';
    
    attributes.length = 0;
    
    elements.generatedCodePre.textContent = 'Код появится здесь после нажатия кнопки "Сгенерировать код"';
    uiManager.updateFileName();
    
    storageManager.clearLocalStorage();
    uiManager.renderAttributesTable();
    uiManager.showNotification('Все данные успешно очищены', 'success');
  }
};

function setupEventListeners() {
  elements.classNameInput.addEventListener('input', () => {
    uiManager.updateFileName();
    storageManager.saveToLocalStorage();
  });

  elements.classNameRuInput.addEventListener('input', () => {
    storageManager.saveToLocalStorage();
  });

  elements.parentNameInput.addEventListener('input', () => {
    storageManager.saveToLocalStorage();
  });

  elements.codeTypeSelect.addEventListener('change', () => {
    uiManager.updateFileName();
    storageManager.saveToLocalStorage();
  });

  elements.addAttributeBtn.addEventListener('click', () => {
    attributes.push({
      name: '',
      nameRu: '',
      type: '',
      fromParent: false,
      selfAttr: false,
      required: false,
      hasStandardSetter: false,
      dictionaryBase: '',
      dictionaryAttr: ''
    });
    
    uiManager.renderAttributesTable();
    uiManager.animateNewAttribute(attributes.length - 1);
    storageManager.saveToLocalStorage();
  });

  elements.clearDataBtn.addEventListener('click', window.clearAllData);
  elements.saveDataBtn.addEventListener('click', saveDataToFile);
  elements.loadDataBtn.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', loadDataFromFile);

  elements.generateCodeBtn.addEventListener('click', generateCode);
}

function saveDataToFile() {
  const data = getFormData(elements.classNameInput, elements.classNameRuInput, elements.parentNameInput, elements.codeTypeSelect, attributes);
  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const className = data.className || 'class_data';
  const fileName = `${className}_config.json`;
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  uiManager.showNotification('Данные успешно сохранены в файл', 'success');
}

function loadDataFromFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      if (typeof data !== 'object' || data === null) {
        throw new Error('Некорректный формат файла');
      }
      
      if (confirm('Загрузить данные из файла? Текущие данные будут потеряны.')) {
        setFormData(data);
        uiManager.showNotification('Данные успешно загружены из файла', 'success');
      }
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
      uiManager.showNotification('Ошибка при загрузке файла: ' + error.message, 'error');
    }
  };
  
  reader.onerror = function() {
    uiManager.showNotification('Ошибка при чтении файла', 'error');
  };
  
  reader.readAsText(file);
  event.target.value = '';
}

function setFormData(data) {
  if (data.className) elements.classNameInput.value = data.className;
  if (data.classNameRu) elements.classNameRuInput.value = data.classNameRu;
  if (data.parentName) elements.parentNameInput.value = data.parentName;
  if (data.codeType) elements.codeTypeSelect.value = data.codeType;
  if (data.attributes && Array.isArray(data.attributes)) {
    attributes.splice(0, attributes.length, ...data.attributes);
  }
  
  uiManager.updateFileName();
  uiManager.renderAttributesTable();
  storageManager.saveToLocalStorage();
}

function generateCode() {
  elements.generateCodeBtn.classList.add('btn-pulse');
  setTimeout(() => {
    elements.generateCodeBtn.classList.remove('btn-pulse');
  }, 500);

  const className = elements.classNameInput.value.trim();
  const codeType = elements.codeTypeSelect.value;
  
  uiManager.updateFileName();
  
  let generatedCode = '';
  
  if (codeType === 'lua') {
    generatedCode = luaGenerator.generateLuaCode(
      className,
      elements.classNameRuInput.value.trim(),
      elements.parentNameInput.value.trim(),
      attributes
    );
  } else if (codeType === 'json') {
    generatedCode = jsonGenerator.generateJsonRequest(className, attributes);
  } else {
    generatedCode = 'Документация пока не реализована';
  }

  codeAnimator.typeWriterWithClear(elements.generatedCodePre, generatedCode, 1, () => {
    elements.generatedCodePre.classList.add('code-appear');
    setTimeout(() => {
      elements.generatedCodePre.classList.remove('code-appear');
    }, 500);
  });
}

document.addEventListener('DOMContentLoaded', () => {
    storageManager.loadFromLocalStorage();
    uiManager.updateFileName();
    uiManager.renderAttributesTable();
    setupEventListeners();
});