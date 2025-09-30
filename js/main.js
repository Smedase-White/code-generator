import { LuaGenerator } from './lua-generator.js';
import { JsonGenerator } from './json-generator.js';
import { typeWriterWithClear, animateButton, createParallaxBackground } from './animation.js';
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
  elements.fileNameSpan.textContent = fileName;
  
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
      
      generatedCode = `<=== ${get_snake_case(info.dictBase)}_dictionary.lua ===>\n${luaGenerator.generateLuaCode(dictCodeInfo)}\n\n<=== ${get_snake_case(info.dictBase)}_record.lua ===>\n${luaGenerator.generateLuaCode(recordCodeInfo)}`;
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

  typeWriterWithClear(elements.generatedCodePre, generatedCode, 1, () => {
    elements.generatedCodePre.classList.add('code-appear');
    setTimeout(() => {
      elements.generatedCodePre.classList.remove('code-appear');
    }, 500);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});
