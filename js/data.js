import { animateNewRow, animateDeleteRow, showNotification, animateButton } from './animation.js';

class DataValue {
  constructor(element, storage_key) {
    this.element = element;
    this.storage_key = storage_key;
    if (this.storage_key) { 
      this.value = localStorage.getItem(this.storage_key); 
    }

    if (this.value) { 
      this.element.value = this.value; 
    } else {
      this.value = this.element.value;
    }
    
    this.element.addEventListener('change', () => {
      this.value = this.element.value;
      if (this.storage_key) {
        localStorage.setItem(this.storage_key, this.value);
      }
    });
    
    this.element.addEventListener('blur', () => {
      this.element.parentElement.style.transform = 'translateY(0)';
    });
  }

  updateValue(value) {
    this.value = value ? value : '';
    this.element.value = this.value;
    if (this.storage_key) {
      localStorage.setItem(this.storage_key, this.value);
    }
  }
}

class RowElementValue {
  constructor(row, column, type, value) {
    this.row = row;
    this.column = column;
    
    const td = document.createElement('td');
    
    if (type === 'text') {
      this.element = document.createElement('input');
      this.element.type = 'text';
      this.element.value = value ? value : '';
      this.element.placeholder = this.getPlaceholder(column);
      
      this.element.addEventListener('change', () => { 
        this.row.updateElement(this.column, this.element.value); 
      });
      
      this.element.addEventListener('blur', () => {
        td.style.transform = 'translateY(0)';
      });

      td.appendChild(this.element);
      
    } else if (type === 'checkbox') {
      this.element = document.createElement('input');
      this.element.type = 'checkbox';
      this.element.checked = !!value;
      
      this.element.addEventListener('change', () => {
        this.row.updateElement(this.column, this.element.checked);
        animateButton(this.element);
      });

      const wrapper = document.createElement('label');
      wrapper.className = 'toggle-switch';
      const span = document.createElement('span');
      span.className = 'toggle-slider';
      wrapper.append(this.element, span);

      td.className = 'checkbox-cell';
      td.appendChild(wrapper);
    }
    
    this.row.element.appendChild(td);
  }

  getPlaceholder(column) {
    const placeholders = {
      name: 'attribute_name',
      nameRu: 'Имя атрибута',
      type: 'AttrType',
      dictionaryBase: 'DictBase',
      dictionaryAttr: 'dict_attribute',
      key: 'key',
      map: '{"attr": "value"}'
    };
    return placeholders[column] || '';
  }
}

class TableRow {
  constructor(table, columns) {
    this.table = table;

    this.element = document.createElement('tr');
    
    Object.entries(columns).forEach(([column, data]) => {
      new RowElementValue(this, column, data.type, data.value);
    });

    const deleteTd = document.createElement('td');
    deleteTd.className = 'actions';
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.innerHTML = '✖';
    
    deleteBtn.addEventListener('click', () => {
      animateButton(deleteBtn);
      const index = this.table.rows.indexOf(this);
      this.table.deleteRow(index);
    });
    
    deleteTd.appendChild(deleteBtn);
    this.element.appendChild(deleteTd);

    this.table.element.appendChild(this.element);
  }

  updateElement(column, value) {
    const index = this.table.rows.indexOf(this);
    this.table.value[index][column] = value;
    this.table.saveToStorage();
  }
}

export class TableValue {
  constructor(element, button_element, storage_key, columns) {
    this.element = element;
    this.storage_key = storage_key;
    this.columns = columns;

    this.rows = [];
    this.value = [];
    
    try {
      let value = JSON.parse(localStorage.getItem(this.storage_key)) || [];
      value.forEach((row) => { this.addRow(row); });
    } catch (e) {
      console.error('Error parsing stored table data:', e);
    }

    button_element.addEventListener('click', () => {
      animateButton(button_element);
      this.addRow({});
    });
  }

  saveToStorage() {
    localStorage.setItem(this.storage_key, JSON.stringify(this.value));
  }

  addRow(values) {
    this.value.push(values);
    this.saveToStorage();

    let data = {};
    Object.entries(this.columns).forEach(([column, type]) => {
      data[column] = { type: type, value: values[column] };
    });
    
    const row = new TableRow(this, data);
    this.rows.push(row);
    animateNewRow(row.element);
    
    showNotification('Добавлена новая строка', 'success');
  }

  deleteRow(index) {
    this.value.splice(index, 1);
    this.saveToStorage();

    let row = this.rows.splice(index, 1)[0];
    animateDeleteRow(row.element);
    
    showNotification('Строка удалена', 'warning');
  }

  updateValue(value) {
    this.value.length = 0;
    this.rows.forEach((row) => { row.element.remove(); });
    this.rows.length = 0;
    
    if (value) { 
      value.forEach((row) => { this.addRow(row); }); 
    }
    
    this.saveToStorage();
  }
}

export class Data {
  constructor(elements) {
    this.elements = elements;

    this.data = {
      classType: new DataValue(elements.classTypeSelect, 'luaGenerator_classType'),

      base: {
        className: new DataValue(elements.classNameInput, 'luaGenerator_className'),
        classNameRu: new DataValue(elements.classNameRuInput, 'luaGenerator_classNameRu'),
        parentName: new DataValue(elements.parentNameInput, 'luaGenerator_parentName'),
        baseAttributes: new TableValue(elements.baseAttributesBody, elements.addBaseAttributeBtn, 'luaGenerator_attributes', {
          name: 'text',
          nameRu: 'text',
          type: 'text',
          fromParent: 'checkbox',
          selfAttr: 'checkbox',
          required: 'checkbox',
          unique: 'checkbox',
          hasStandardSetter: 'checkbox',
          dictionaryBase: 'text',
          dictionaryAttr: 'text'
        })
      },

      dictionary: {
        dictBase: new DataValue(elements.dictBaseInput, 'luaGenerator_dictBase'),
        dictNameRu: new DataValue(elements.dictNameRuInput, 'luaGenerator_dictNameRu'),
        recordAttributes: new TableValue(elements.recordAttributesBody, elements.addRecordAttributeBtn, 'luaGenerator_recordAttributes', {
          name: 'text',
          nameRu: 'text',
          type: 'text'
        }),
        recordValues: new TableValue(elements.recordValuesBody, elements.addRecordValueBtn, 'luaGenerator_recordValues', {
          key: 'text',
          nameRu: 'text',
          map: 'text'
        })
      },

      array: {},

      catalog: {},

      codeType: new DataValue(elements.codeTypeSelect, 'luaGenerator_codeType'),
      repositoryLocation: new DataValue(elements.repositoryLocationSelect, 'luaGenerator_repositoryLocation')
    };

    this.data.classType.element.addEventListener('change', () => { 
      this.updateForm(); 
    });
    
    this.updateForm();
  }

  updateForm() {
    let classType = this.data.classType.value;
    
    this.elements.baseForm.style.display = 'none';
    this.elements.dictionaryForm.style.display = 'none';
    this.elements.arrayForm.style.display = 'none';
    this.elements.catalogForm.style.display = 'none';
    
    this.elements[`${classType}Form`].style.display = 'block';
  }

  getValue() {
    const result = {
      classType: this.data.classType.value,
      codeType: this.data.codeType.value
    };
  
    result[classType.value] = {}
    Object.entries(this.data[classType.value]).forEach(([key, data]) => {
      result[classType.value][key] = data.value
    });

    return result;
  }

  saveToFile() {
    const data = this.getValue();
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const className = data.classType === 'dictionary' ? `${data.dictionary.dictBase}Dictionary` : data.base.className;
    const fileName = `${className || 'class_data'}_config.json`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Данные успешно сохранены в файл', 'success');
  }
  
  loadFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const loadedData = JSON.parse(e.target.result);
        
        if (typeof loadedData !== 'object' || loadedData === null) {
          throw new Error('Некорректный формат файла');
        }
        
        if (confirm('Загрузить данные из файла? Текущие данные будут потеряны.')) {
          this.setValue(loadedData);
          showNotification('Данные успешно загружены из файла', 'success');
        }
      } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
        showNotification('Ошибка при загрузке файла: ' + error.message, 'error');
      }
    };
    
    reader.onerror = () => {
      showNotification('Ошибка при чтении файла', 'error');
    };
    
    reader.readAsText(file);
    event.target.value = '';
  }

  setValue(data) {
    if (data.classType && this.data.classType) {
      this.data.classType.updateValue(data.classType);
    }

    if (data.codeType && this.data.codeType) {
      this.data.codeType.updateValue(data.codeType);
    }

    Object.entries(data[data.classType]).forEach(([key, value]) => {
      this.data[data.classType][key].updateValue(value)
    });

    this.updateForm();
  }

  clear() {
    if (confirm('Вы уверены, что хотите очистить все данные?')) {
      Object.keys(this.data).forEach((key) => { 
        if (typeof this.data[key] === 'object' && this.data[key] !== null) {
          Object.keys(this.data[key]).forEach((subKey) => {
            if (this.data[key][subKey] && typeof this.data[key][subKey].updateValue === 'function') {
              this.data[key][subKey].updateValue(undefined);
            }
          });
        } else if (this.data[key] && typeof this.data[key].updateValue === 'function') {
          this.data[key].updateValue(undefined);
        }
      });
      showNotification('Все данные успешно очищены', 'success');
    }
  }
}
