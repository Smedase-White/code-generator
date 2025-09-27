import { getFileName, getCSSVariable } from './config.js';

export class UIManager {
  constructor(elements, attributes) {
    this.elements = elements;
    this.attributes = attributes;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
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
    
    const colors = {
      success: getCSSVariable('--color-success'),
      warning: getCSSVariable('--color-warning'),
      error: getCSSVariable('--color-danger'),
      info: getCSSVariable('--color-primary')
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);
    
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

  renderInputTextBox(field, value, index) {
    return `<td><input type="text" value="${value}" onchange="updateAttribute(${index}, '${field}', this.value)"></td>`
  }

  renderCheckBox(field, value, index) {
    return `<td class="checkbox-cell">
        <label class="toggle-switch">
          <input type="checkbox" ${value ? 'checked' : ''} onchange="updateAttribute(${index}, '${field}', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </td>`
  }

  renderAttributesTable() {
    if (this.attributes.length === 0) {
      this.elements.attributesBody.innerHTML = '<tr class="empty-row"><td colspan="9">Нет добавленных атрибутов</td></tr>';
      return;
    }
    
    this.elements.attributesBody.innerHTML = '';
    
    this.attributes.forEach((attr, index) => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        ${this.renderInputTextBox('name', attr.name, index)}
        ${this.renderInputTextBox('nameRu', attr.nameRu, index)}
        ${this.renderInputTextBox('type', attr.type, index)}
        ${this.renderCheckBox('fromParent', attr.fromParent, index)}
        ${this.renderCheckBox('selfAttr', attr.selfAttr, index)}
        ${this.renderCheckBox('required', attr.required, index)}
        ${this.renderCheckBox('hasStandardSetter', attr.hasStandardSetter, index)}
        <td>
          <input type="text" value="${attr.dictionaryBase}" onchange="updateAttribute(${index}, 'dictionaryBase', this.value)" placeholder="Основа справочника" style="width: 48%; display: inline-block;">
          <input type="text" value="${attr.dictionaryAttr}" onchange="updateAttribute(${index}, 'dictionaryAttr', this.value)" placeholder="Атрибут справочника" style="width: 48%; display: inline-block;">
        </td>
        <td class="actions">
          <button class="btn btn-danger" onclick="deleteAttribute(${index})">✖</button>
        </td>
      `;
      
      this.elements.attributesBody.appendChild(row);
    });
  }

  animateNewAttribute(index) {
    const rows = this.elements.attributesBody.querySelectorAll('tr');
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

  updateFileName() {
    const className = this.elements.classNameInput.value.trim();
    this.elements.fileNameSpan.textContent = getFileName(className, this.elements.codeTypeSelect.value);
  }
}
