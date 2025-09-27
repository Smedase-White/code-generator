// Переменные для хранения данных
let attributes = [];
let currentCodeAnimation = null;

// Элементы DOM
const classNameInput = document.getElementById('className');
const classNameRuInput = document.getElementById('classNameRu');
const parentNameInput = document.getElementById('parentName');
const addAttributeBtn = document.getElementById('addAttribute');
const clearDataBtn = document.getElementById('clearData');
const saveDataBtn = document.getElementById('saveData');
const loadDataBtn = document.getElementById('loadData');
const attributesBody = document.getElementById('attributesBody');
const generateCodeBtn = document.getElementById('generateCode');
const generatedCodePre = document.getElementById('generatedCode');
const fileNameSpan = document.getElementById('fileName');
const codeTypeSelect = document.getElementById('codeType');
const fileInput = document.getElementById('fileInput');

// Ключи для localStorage
const STORAGE_KEYS = {
    CLASS_NAME: 'luaGenerator_className',
    CLASS_NAME_RU: 'luaGenerator_classNameRu',
    PARENT_NAME: 'luaGenerator_parentName',
    ATTRIBUTES: 'luaGenerator_attributes',
    CODE_TYPE: 'luaGenerator_codeType'
};

function getFileName(className, codeType) {
    if (codeType === 'json') {
        return 'request.json';
    }
    return className.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase() + '.lua';
}

function getAutoImports() {
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

// Функция сохранения данных в localStorage
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEYS.CLASS_NAME, classNameInput.value);
    localStorage.setItem(STORAGE_KEYS.CLASS_NAME_RU, classNameRuInput.value);
    localStorage.setItem(STORAGE_KEYS.PARENT_NAME, parentNameInput.value);
    localStorage.setItem(STORAGE_KEYS.ATTRIBUTES, JSON.stringify(attributes));
    localStorage.setItem(STORAGE_KEYS.CODE_TYPE, codeTypeSelect.value);
}

// Функция загрузки данных из localStorage
function loadFromLocalStorage() {
    const savedClassName = localStorage.getItem(STORAGE_KEYS.CLASS_NAME);
    const savedClassNameRu = localStorage.getItem(STORAGE_KEYS.CLASS_NAME_RU);
    const savedParentName = localStorage.getItem(STORAGE_KEYS.PARENT_NAME);
    const savedAttributes = localStorage.getItem(STORAGE_KEYS.ATTRIBUTES);
    const savedCodeType = localStorage.getItem(STORAGE_KEYS.CODE_TYPE);
    
    if (savedClassName) classNameInput.value = savedClassName;
    if (savedClassNameRu) classNameRuInput.value = savedClassNameRu;
    if (savedParentName) parentNameInput.value = savedParentName;
    if (savedAttributes) {
        try {
            attributes = JSON.parse(savedAttributes);
        } catch (e) {
            console.error('Ошибка при загрузке атрибутов из localStorage:', e);
            attributes = [];
        }
    }
    if (savedCodeType) codeTypeSelect.value = savedCodeType;
    
    // Обновляем интерфейс
    fileNameSpan.textContent = getFileName(classNameInput.value.trim(), codeTypeSelect.value);
    renderAttributesTable();
}

// Функция очистки всех данных
function clearAllData() {
    if (confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
        // Очищаем поля ввода
        classNameInput.value = '';
        classNameRuInput.value = '';
        parentNameInput.value = '';
        codeTypeSelect.value = 'lua';
        
        // Очищаем атрибуты
        attributes = [];
        
        // Очищаем сгенерированный код
        generatedCodePre.textContent = 'Код появится здесь после нажатия кнопки "Сгенерировать код"';
        
        // Очищаем имя файла
        fileNameSpan.textContent = getFileName('', codeTypeSelect.value);
        
        // Очищаем localStorage
        localStorage.removeItem(STORAGE_KEYS.CLASS_NAME);
        localStorage.removeItem(STORAGE_KEYS.CLASS_NAME_RU);
        localStorage.removeItem(STORAGE_KEYS.PARENT_NAME);
        localStorage.removeItem(STORAGE_KEYS.ATTRIBUTES);
        localStorage.removeItem(STORAGE_KEYS.CODE_TYPE);
        
        // Обновляем таблицу атрибутов
        renderAttributesTable();
        
        // Показываем сообщение об успешной очистке
        showNotification('Все данные успешно очищены', 'success');
    }
}

// Функция показа уведомления
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    // Цвета в зависимости от типа
    const colors = {
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Добавляем в DOM
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Функция для получения данных формы
function getFormData() {
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

// Функция для установки данных формы
function setFormData(data) {
    if (data.className) classNameInput.value = data.className;
    if (data.classNameRu) classNameRuInput.value = data.classNameRu;
    if (data.parentName) parentNameInput.value = data.parentName;
    if (data.codeType) codeTypeSelect.value = data.codeType;
    if (data.attributes && Array.isArray(data.attributes)) {
        attributes = data.attributes;
    }
    
    // Обновляем интерфейс
    fileNameSpan.textContent = getFileName(classNameInput.value.trim(), codeTypeSelect.value);
    renderAttributesTable();
    saveToLocalStorage();
}

// Функция сохранения данных в JSON файл
function saveDataToFile() {
    const data = getFormData();
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
    
    showNotification('Данные успешно сохранены в файл', 'success');
}

// Функция загрузки данных из JSON файла
function loadDataFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Проверяем структуру данных
            if (typeof data !== 'object' || data === null) {
                throw new Error('Некорректный формат файла');
            }
            
            // Запрашиваем подтверждение перед загрузкой
            if (confirm('Загрузить данные из файла? Текущие данные будут потеряны.')) {
                setFormData(data);
                showNotification('Данные успешно загружены из файла', 'success');
            }
        } catch (error) {
            console.error('Ошибка при загрузке файла:', error);
            showNotification('Ошибка при загрузке файла: ' + error.message, 'error');
        }
    };
    
    reader.onerror = function() {
        showNotification('Ошибка при чтении файла', 'error');
    };
    
    reader.readAsText(file);
    
    // Сбрасываем значение input, чтобы можно было загрузить тот же файл снова
    event.target.value = '';
}

// Обработчики изменений полей с сохранением
classNameInput.addEventListener('input', () => {
    const className = classNameInput.value.trim();
    fileNameSpan.textContent = getFileName(className, codeTypeSelect.value);
    saveToLocalStorage();
});

classNameRuInput.addEventListener('input', () => {
    saveToLocalStorage();
});

parentNameInput.addEventListener('input', () => {
    saveToLocalStorage();
});

codeTypeSelect.addEventListener('change', () => {
    const className = classNameInput.value.trim();
    fileNameSpan.textContent = getFileName(className, codeTypeSelect.value);
    saveToLocalStorage();
});

addAttributeBtn.addEventListener('click', () => {
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
    
    renderAttributesTable();
    animateNewAttribute(attributes.length - 1);
    saveToLocalStorage();
});

// Обработчики кнопок
clearDataBtn.addEventListener('click', clearAllData);
saveDataBtn.addEventListener('click', saveDataToFile);
loadDataBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', loadDataFromFile);

function animateNewAttribute(index) {
    const rows = attributesBody.querySelectorAll('tr');
    if (rows[index]) {
        rows[index].style.opacity = '0';
        rows[index].style.transform = 'translateX(-100%)';
        
        setTimeout(() => {
            rows[index].style.transition = 'all 0.3s ease-out';
            rows[index].style.opacity = '1';
            rows[index].style.transform = 'translateX(0)';
        }, 10);
    }
}

function deleteAttribute(index) {
    const row = attributesBody.children[index];
    if (row) {
        row.style.transition = 'all 0.3s ease-out';
        row.style.opacity = '0';
        row.style.transform = 'translateX(-100%)';
        
        setTimeout(() => {
            attributes.splice(index, 1);
            renderAttributesTable();
            saveToLocalStorage();
        }, 300);
    } else {
        attributes.splice(index, 1);
        renderAttributesTable();
        saveToLocalStorage();
    }
}

function updateAttribute(index, field, value) {
    attributes[index][field] = value;
    saveToLocalStorage();
}

function generateJsonRequest() {
    const className = classNameInput.value.trim();
    
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

function renderAttributesTable() {
    if (attributes.length === 0) {
        attributesBody.innerHTML = '<tr class="empty-row"><td colspan="9">Нет добавленных атрибутов</td></tr>';
        return;
    }
    
    attributesBody.innerHTML = '';
    
    attributes.forEach((attr, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><input type="text" value="${attr.name}" onchange="updateAttribute(${index}, 'name', this.value)"></td>
            <td><input type="text" value="${attr.nameRu}" onchange="updateAttribute(${index}, 'nameRu', this.value)"></td>
            <td><input type="text" value="${attr.type}" onchange="updateAttribute(${index}, 'type', this.value)"></td>
            <td class="checkbox-cell">
                <label class="toggle-switch">
                    <input type="checkbox" ${attr.fromParent ? 'checked' : ''} onchange="updateAttribute(${index}, 'fromParent', this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td class="checkbox-cell">
                <label class="toggle-switch">
                    <input type="checkbox" ${attr.selfAttr ? 'checked' : ''} onchange="updateAttribute(${index}, 'selfAttr', this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td class="checkbox-cell">
                <label class="toggle-switch">
                    <input type="checkbox" ${attr.required ? 'checked' : ''} onchange="updateAttribute(${index}, 'required', this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td class="checkbox-cell">
                <label class="toggle-switch">
                    <input type="checkbox" ${attr.hasStandardSetter ? 'checked' : ''} onchange="updateAttribute(${index}, 'hasStandardSetter', this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td>
                <input type="text" value="${attr.dictionaryBase}" onchange="updateAttribute(${index}, 'dictionaryBase', this.value)" placeholder="Основа справочника" style="width: 48%; display: inline-block;">
                <input type="text" value="${attr.dictionaryAttr}" onchange="updateAttribute(${index}, 'dictionaryAttr', this.value)" placeholder="Атрибут справочника" style="width: 48%; display: inline-block;">
            </td>
            <td>
                <button class="btn btn-danger" onclick="deleteAttribute(${index})">✖</button>
            </td>
        `;
        
        attributesBody.appendChild(row);
    });
}

function generateImportString(className) {
    return `local ${className} = BaseClass:require('${className}')`;
}

function generateAttributeSchema(attr) {
    let schema = `\n    ${attr.name} = {\n`;
    schema += `      name_ru = '${attr.nameRu || attr.name}'`;
    if (attr.selfAttr) {
        schema += `,\n      self_attr = true`;
    }
    schema += `\n    }`;
    return schema
}

function typeWriterWithClear(element, newText, speed = 1, onComplete = null) {
    if (currentCodeAnimation) {
        clearTimeout(currentCodeAnimation);
        currentCodeAnimation = null;
    }
    
    const currentText = element.textContent;
    
    function deleteText() {
        element.style.setProperty('--cursor-color', '#ef5350');
        let i = currentText.length;
        
        function deleteChar() {
            if (i > 0) {
                element.textContent = currentText.substring(0, i - 1);
                i--;
                currentCodeAnimation = setTimeout(deleteChar, speed * 2);
            } else {
                typeText();
            }
        }
        
        deleteChar();
    }
    
    function typeText() {
        element.style.setProperty('--cursor-color', '#66bb6a');
        let i = 0;
        
        function typeChar() {
            if (i < newText.length) {
                element.textContent = newText.substring(0, i + 1);
                i++;
                currentCodeAnimation = setTimeout(typeChar, speed);
            } else {
                element.classList.remove('typing');
                if (onComplete) onComplete();
            }
        }
        
        typeChar();
    }
    
    element.classList.add('typing');
    
    if (currentText.length > 0) {
        deleteText();
    } else {
        typeText();
    }
}

function displayCodeImmediately(element, text) {
    if (currentCodeAnimation) {
        clearTimeout(currentCodeAnimation);
        currentCodeAnimation = null;
    }
    element.textContent = text;
}

function generateLuaCode() {
    const className = classNameInput.value.trim();
    const classNameRu = classNameRuInput.value.trim();
    const parentName = parentNameInput.value.trim();
    
    let code = `--ignore_migrations\n`;
    code += `--${classNameRu}\n`;
    
    if (parentName && parentName.trim()) {
        code += `${generateImportString(parentName)}\n\n`
    }

    const imports = getAutoImports();
    if (imports.length > 0) {
        code += imports.map(importClass => `${generateImportString(importClass)}`).join('\n')
        code += `\n\n`
    }
    
    code += `local ${className} = class('${className}', ${parentName || 'BaseClass'})\n\n`;
    
    if (attributes.length > 0) {
        code += `${className}:initialize_attributes_types({\n`;
        code += attributes.map(attr => `  ${attr.name} = { ${attr.type} }`).join(',\n')
        code += `\n})\n\n`;
    }
    
    const newAttributes = attributes.filter(attr => attr.fromParent == false);
    if (newAttributes.length > 0) {
        code += `${className}:initialize_schema({\n`;
        code += `  attributes = {`;
        code += newAttributes.map(attr => generateAttributeSchema(attr)).join(',')
        code += `\n  }\n`;
        code += `})\n\n`;
    }
    
    const standardSetters = attributes.filter(attr => attr.hasStandardSetter);
    if (standardSetters.length > 0) {
        code += `${className}:generate_setters({ `;
        code += standardSetters.map(attr => `'${attr.name}'`).join(', ');
        code += ` })\n\n`;
    }
    
    const dictionarySetters = attributes.filter(attr => attr.dictionaryBase.trim());
    if (dictionarySetters.length > 0) {
        code += `Dictionary:generate_setters_from_dictionaries(${className}, {`;
        code += dictionarySetters.map(attr => `\n  ${attr.name} = "${attr.dictionaryBase}Dictionary.%s<${attr.dictionaryBase}Record>.${attr.dictionaryAttr}<${attr.type}>"`).join(',')
        code += `\n})\n\n`;
    }
    
    code += `function ${className}.static:initialize_from_table(data)\n`;

    const requiredAttributes = newAttributes.filter(attr => attr.required);
    if (requiredAttributes.length > 0) {
        code += requiredAttributes.map(attr => `  Utils:key_exists(data, '${attr.name}')`).join('\n')
        code += '\n'
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
            } else {
                code += `  instance.${attr.name} = data.${attr.name}\n`;
            }
        }
    });
    
    code += `\n  return instance\n`;
    code += `end\n\n`;
    
    code += `return ${className}`;
    
    return code;
}

generateCodeBtn.addEventListener('click', () => {
    generateCodeBtn.classList.add('btn-pulse');
    setTimeout(() => {
        generateCodeBtn.classList.remove('btn-pulse');
    }, 500);

    const className = classNameInput.value.trim();
    const codeType = codeTypeSelect.value;
    
    fileNameSpan.textContent = getFileName(className, codeType);
    
    let generatedCode = '';
    
    if (codeType === 'lua') {
        generatedCode = generateLuaCode();
    } else if (codeType === 'json') {
        generatedCode = generateJsonRequest();
    } else {
        generatedCode = 'Документация пока не реализована';
    }

    typeWriterWithClear(generatedCodePre, generatedCode, 1, () => {
        generatedCodePre.classList.add('code-appear');
        setTimeout(() => {
            generatedCodePre.classList.remove('code-appear');
        }, 500);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Загружаем данные из localStorage при загрузке страницы
    loadFromLocalStorage();
});

window.deleteAttribute = deleteAttribute;
window.updateAttribute = updateAttribute;
window.clearAllData = clearAllData;
