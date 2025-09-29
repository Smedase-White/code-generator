import { animateNewRow, animateDeleteRow, showNotification } from './animation.js';

class DataValue {
  constructor(element, storage_key) {
    this.element = element;
    this.storage_key = storage_key;
    if (this.storage_key) { this.value = localStorage.getItem(this.storage_key); }

    if (this.value) { this.element.value = this.value; }
    this.element.onchange = () => {
      this.value = this.element.value;
      localStorage.setItem(this.storage_key, this.value);
    }
  }

  updateValue(value) {
    this.value = value ? value : '';
    this.element.value = this.value;
    localStorage.setItem(this.storage_key, this.value);
  }
}

class RowElementValue {
  constructor(row, column, type, value) {
    this.row = row;
    this.column = column
    
    const td = document.createElement('td');
    this.element = document.createElement('input');
    this.element.type = type;
    if (type === 'text'){
      this.element.value = value ? value : '';
      this.element.onchange = () => { this.row.updateElement(this.column, this.element.value); }

      td.appendChild(this.element)
    } else if (type === 'checkbox') {
      this.element.checked = !!value;
      this.element.onchange = () => {
        this.row.updateElement(this.column, this.element.checked);
      }

      const wrapper = document.createElement('label');
      wrapper.className = 'toggle-switch';
      const span = document.createElement('span');
      span.className = 'toggle-slider';
      wrapper.append(this.element, span);

      td.className = 'checkbox-cell'
      td.appendChild(wrapper);
    }
    this.row.element.appendChild(td);
  }
}

class TableRow {
  constructor(table, columns) {
    this.table = table;

    this.element = document.createElement('tr');
    Object.entries(columns).forEach(([column, data]) => {
      new RowElementValue(this, column, data.type, data.value);
    })

    const deleteTd = document.createElement('td');
    deleteTd.className = 'actions'
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger'
    deleteBtn.onclick = () => {
      const index = this.table.rows.indexOf(this);
      this.table.deleteRow(index);
    }
    deleteBtn.textContent = '✖'
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
      value.forEach((row) => { this.addRow(row); })
    } catch (e) {
      console.error('Error parsing stored table data:', e);
    }

     button_element.addEventListener('click', () => {
      this.addRow({});
    });
  }

  saveToStorage() {
    localStorage.setItem(this.storage_key, JSON.stringify(this.value));
  }

  addRow(values) {
    this.value.push(values)
    this.saveToStorage();

    let data = {};
    Object.entries(this.columns).forEach(([column, type]) => {
      data[column] = { type: type, value: values[column] };
    })
    const row = new TableRow(this, data);
    this.rows.push(row);
    animateNewRow(row.element);
  }

  deleteRow(index) {
    this.value.splice(index, 1);
    this.saveToStorage();

    let row = this.rows.splice(index, 1)[0];
    animateDeleteRow(row.element);
  }

  updateValue(value) {
    this.value.length = 0;
    this.rows.forEach((row) => {row.element.remove();});
    this.rows.length = 0;
    if (value) { value.forEach((row) => { this.addRow(row); }); }
    this.saveToStorage();
  }
}

export class Data {
  constructor(elements) {
    this.elements = elements

    this.data = {
      classType: new DataValue(elements.classTypeSelect, elements.addBaseAttributeBtn, 'luaGenerator_classType'),

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
        hasStandardSetter: 'checkbox',
        dictionaryBase: 'text',
        dictionaryAttr: 'text'
      }),

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
      }),

      codeType: new DataValue(elements.codeTypeSelect, 'luaGenerator_codeType')
    }

    this.data.classType.element.addEventListener('change', () => { this.updateForm(); });
    this.updateForm();
  }

  updateForm() {
    let classType = this.data.classType.value;
    if (classType === 'dictionary') {
      this.elements.baseClassForm.style.display = 'none';
      this.elements.dictionaryForm.style.display = 'block';
    } else {
      this.elements.baseClassForm.style.display = 'block';
      this.elements.dictionaryForm.style.display = 'none';
    }
  }

  getValue() {
    return Object.fromEntries(
      Object.entries(this.data).map(([key, value]) => [key, value.value])
    );
  }

  saveToFile() {
    const data = this.getValue();
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const className = data.classType === 'dictionary' ? `${data.dictBase}Dictionary` : data.className;
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
    
    const selfData = this.data;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        
        if (typeof data !== 'object' || data === null) {
          throw new Error('Некорректный формат файла');
        }
        
        if (confirm('Загрузить данные из файла? Текущие данные будут потеряны.')) {
          Object.entries(data).forEach(([key, value]) => { selfData[key].updateValue(value); });
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
    event.target.value = '';
  }

  clear() {
    Object.keys(this.data).forEach((key) => { this.data[key].updateValue(undefined); });

    showNotification('Все данные успешно очищены', 'success');
  }
}