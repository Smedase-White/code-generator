import { LuaGenerator } from './lua-generator.js';
import { JsonGenerator } from './json-generator.js';
import { typeWriterWithClear, animateButton, createParallaxBackground, showNotification } from './animation.js';
import { Data } from './data.js';

createParallaxBackground();

const elements = {
  classTypeSelect: document.getElementById('classType'),

  baseClassForm: document.getElementById('baseClassForm'),
  classNameInput: document.getElementById('className'),
  classNameRuInput: document.getElementById('classNameRu'),
  parentNameInput: document.getElementById('parentName'),
  baseAttributesBody: document.getElementById('baseAttributesBody'),
  addBaseAttributeBtn: document.getElementById('addBaseAttribute'),

  dictionaryForm: document.getElementById('dictionaryForm'),
  dictBaseInput: document.getElementById('dictBase'),
  dictNameRuInput: document.getElementById('dictNameRu'),
  recordAttributesBody: document.getElementById('recordAttributesBody'),
  addRecordAttributeBtn: document.getElementById('addRecordAttribute'),
  recordValuesBody: document.getElementById('recordValuesBody'),
  addRecordValueBtn: document.getElementById('addRecordValue'),

  clearDataBtn: document.getElementById('clearData'),
  saveDataBtn: document.getElementById('saveData'),
  loadDataBtn: document.getElementById('loadData'),

  generateCodeBtn: document.getElementById('generateCode'),
  fileNameSpan: document.getElementById('fileName'),
  codeTypeSelect: document.getElementById('codeType'),
  generatedCodePre: document.getElementById('generatedCode'),

  fileInput: document.getElementById('fileInput')
};

const data = new Data(elements);
const luaGenerator = new LuaGenerator();
const jsonGenerator = new JsonGenerator();

function get_snake_case(value) {
  return value ? value.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase() : '';
}

function setupEventListeners() {
  elements.clearDataBtn.addEventListener('click', () => { 
    animateButton(elements.clearDataBtn);
    data.clear(); 
  });
  
  elements.saveDataBtn.addEventListener('click', () => { 
    animateButton(elements.saveDataBtn);
    data.saveToFile(); 
  });
  
  elements.loadDataBtn.addEventListener('click', () => {
    animateButton(elements.loadDataBtn);
    elements.fileInput.click();
  });
  
  elements.fileInput.addEventListener('change', (event) => { 
    data.loadFromFile(event);
  });

  elements.generateCodeBtn.addEventListener('click', generateCode);
}

function generateCode() {
  animateButton(elements.generateCodeBtn);

  const info = data.getValue();

  let fileName = '';
  if (info.codeType === 'json') {
    fileName = 'request.json';
  } else if (info.classType === 'dictionary' && info.codeType === 'lua') {
    const name = get_snake_case(info.dictBase);
    fileName = `${name}_dictionary.lua | ${name}_record.lua`;
  } else {
    fileName = `${get_snake_case(info.className)}.lua`;
  }
  updateFileNameDisplay(fileName);
  
  let generatedCode = '';
  
  if (info.codeType === 'lua') {
    if (info.classType === 'dictionary') {
      Object.values(info.recordAttributes).forEach((value) => {
        value.selfAttr = true;
        value.required = true;
      });
      
      const dictCodeInfo = {
        className: `${info.dictBase}Dictionary`,
        classNameRu: `Справочник "${info.dictNameRu}"`,
        parentName: 'Dictionary',
        attributes: [ { name: '__values_type', type: `${info.dictBase}Record`, fromParent: true } ]
      };
      
      let recordAttributes = [...info.recordAttributes]
      recordAttributes.unshift({
        name: 'dictionary_owner',
        type: `${info.dictBase}Dictionary`,
        fromParent: true
      });
      const recordCodeInfo = {
        className: `${info.dictBase}Record`,
        classNameRu: `Запись справочника "${info.dictNameRu}"`,
        parentName: 'BaseRecord',
        attributes: recordAttributes
      };
      
      generatedCode = `${luaGenerator.generateLuaCode(dictCodeInfo)}${luaGenerator.generateLuaCode(recordCodeInfo)}`;
    } else {
      const baseCodeInfo = {
        className: info.className,
        classNameRu: info.classNameRu,
        parentName: info.parentName,
        attributes: info.baseAttributes
      };
      generatedCode = luaGenerator.generateLuaCode(baseCodeInfo);
    }
  } else if (info.codeType === 'json') {
    if (info.classType === 'dictionary') {
      generatedCode = jsonGenerator.generateDictionaryRequest(info);
    } else {
      generatedCode = jsonGenerator.generateJsonRequest(
        info.className,
        info.baseAttributes
      );
    }
  } else {
    generatedCode = 'Документация пока не реализована';
  }

  const formattedCode = formatGeneratedCode(generatedCode);
  elements.generatedCodePre.innerHTML = '';
  elements.generatedCodePre.appendChild(formattedCode);

  /*typeWriterWithClear(elements.generatedCodePre, formattedCode, 1, () => {
    elements.generatedCodePre.classList.add('code-appear');
    setTimeout(() => {
      elements.generatedCodePre.classList.remove('code-appear');
    }, 500);
  });*/
}

function setupCopyFunctionality() {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('filename-part')) {
      const filename = e.target.getAttribute('data-filename');
      if (filename) {
        copyToClipboard(filename, e.target);
        showNotification(`Имя файла '${filename}' скопировано в буфер обмена.`, 'success');
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('code-header-tag')) {
      const codeSection = e.target.nextElementSibling;
      if (codeSection && codeSection.classList.contains('code-content')) {
        const codeText = codeSection.textContent;
        copyToClipboard(codeText, e.target);
        showNotification(`Код класса '${e.target.getAttribute('data-title')}' скопирован в буфер обмена.`, 'success');
        
        codeSection.classList.add('highlight');
        e.target.classList.add('copied');
        setTimeout(() => {
          codeSection.classList.remove('highlight');
          e.target.classList.remove('copied');
        }, 1000);
      }
    }
  });
}

function copyToClipboard(text, element) {
  navigator.clipboard.writeText(text).then(() => {
    element.classList.add('copied');
    setTimeout(() => {
      element.classList.remove('copied');
    }, 1000);
  }).catch(err => {
    console.error('Ошибка копирования: ', err);
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    element.classList.add('copied');
    setTimeout(() => {
      element.classList.remove('copied');
    }, 1000);
  });
}

function updateFileNameDisplay(fileName) {
  const fileNameElement = document.getElementById('fileName');
  fileNameElement.innerHTML = '';
  
  if (fileName.includes('|')) {
    const parts = fileName.split('|').map(part => part.trim());
    parts.forEach((part, index) => {
      const span = document.createElement('span');
      span.className = 'filename-part';
      span.setAttribute('data-filename', part);
      span.textContent = part;
      fileNameElement.appendChild(span);
      
      if (index < parts.length - 1) {
        const separator = document.createElement('span');
        separator.textContent = ' | ';
        separator.style.color = 'var(--text-muted)';
        fileNameElement.appendChild(separator);
      }
    });
  } else {
    const span = document.createElement('span');
    span.className = 'filename-part';
    span.setAttribute('data-filename', fileName);
    span.textContent = fileName;
    fileNameElement.appendChild(span);
  }
}

function formatGeneratedCode(code) {
  const sectionRegex = /<===([^=]+)===>/g;
  let lastIndex = 0;
  let sections = [];
  let match;
  
  while ((match = sectionRegex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      sections.push({
        type: 'content',
        content: code.substring(lastIndex, match.index)
      });
    }
    
    const title = match[1].trim();
    sections.push({
      type: 'header',
      content: match[0],
      title: title
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < code.length) {
    sections.push({
      type: 'content',
      content: code.substring(lastIndex)
    });
  }
  
  const container = document.createElement('div');
  let currentContent = '';
  
  sections.forEach((section, index) => {
    if (section.type === 'header') {
      if (currentContent) {
        const contentDiv = document.createElement('pre');
        contentDiv.className = 'code-content';
        contentDiv.textContent = currentContent;
        container.appendChild(contentDiv);
        container.appendChild(document.createElement('br'))
        currentContent = '';
      }
      
      const header = document.createElement('div');
      header.className = 'code-header-tag';
      header.textContent = section.content;
      header.setAttribute('data-title', section.title);
      container.appendChild(header);
    } else {
      currentContent += section.content;
    }
  });
  
  if (currentContent) {
    const contentDiv = document.createElement('pre');
    contentDiv.className = 'code-content';
    contentDiv.textContent = currentContent;
    container.appendChild(contentDiv);
  }
  
  
  return container;
}

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setupCopyFunctionality(); 
});
