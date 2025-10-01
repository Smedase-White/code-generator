export class DocGenerator {
  generateDocumentation(info) {
    const formInfo = info[info.classType];
    
    let html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Документация класса ${formInfo.className}</title>
  <style>
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      margin: 0; 
      padding: 20px; 
      background: #f5f5f5;
      color: #172b4d; 
    }
    .container { 
      max-width: 1200px; 
      margin: 0 auto; 
      background: white; 
      padding: 30px; 
      border-radius: 10px; 
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1, h2, h3 { 
      margin-bottom: 20px;
    }
    h1 { 
      border-bottom: 2px solid #3498db; 
      padding-bottom: 10px;
    }
    .info-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-bottom: 30px;
    }
    .info-table td { 
      padding: 12px 15px; 
      border: 1px solid #808080;
    }
    .info-table td:first-child { 
      font-weight: bold; 
      background: #f8f9fa; 
      width: 200px;
    }
    .attributes-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-bottom: 30px;
    }
    .attributes-table th, .attributes-table td { 
      padding: 12px 15px; 
      border: 1px solid #808080; 
      text-align: left;
    }
    .attributes-table th { 
    }
    .section-divider { 
      background: #dddddd; 
      padding: 10px; 
      font-weight: bold; 
      text-align: center;
    }
    .parent-attributes { 
      background: #f4f5f7;
    }
    .own-attributes { 
      background: #f4f5f7;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Документация класса ${formInfo.className}</h1>
    
    <h2>Информация о классе</h2>
    <table class="info-table">
      <tr>
        <td>Системное имя</td>
        <td>${formInfo.className}</td>
      </tr>
      <tr>
        <td>Русское наименование</td>
        <td>${formInfo.classNameRu}</td>
      </tr>
      <tr>
        <td>Описание</td>
        <td></td>
      </tr>
      <tr>
        <td>Родительский класс</td>
        <td>${formInfo.parentName || 'BaseClass'}</td>
      </tr>
      <tr>
        <td>Является системным</td>
        <td>Да</td>
      </tr>
      <tr>
        <td>Расположение в репозитории</td>
        <td>${info.repositoryLocation || 'Общее'}</td>
      </tr>
    </table>
    
    <h2>Атрибуты класса</h2>
    <table class="attributes-table">
      <thead>
        <tr>
          <th>Системное имя</th>
          <th>Русское наименование</th>
          <th>Тип</th>
          <th>Собственность</th>
          <th>Обязательность</th>
          <th>Уникальность</th>
          <th>Пример значения</th>
          <th>Значение по умолчанию</th>
          <th>Описание</th>
        </tr>
      </thead>
      <tbody>`;

    const parentAttributes = formInfo.baseAttributes ? formInfo.baseAttributes.filter(attr => attr.fromParent) : [];
    const ownAttributes = formInfo.baseAttributes ? formInfo.baseAttributes.filter(attr => !attr.fromParent) : [];

    if (parentAttributes.length > 0) {
      html += `
        <tr class="section-divider">
          <td colspan="9">Атрибуты родителя</td>
        </tr>`;
      
      parentAttributes.forEach(attr => {
        html += `
        <tr class="parent-attributes">
          <td>${attr.name || ''}</td>
          <td>${attr.nameRu || ''}</td>
          <td>${attr.type || ''}</td>
          <td>${attr.selfAttr ? 'Да' : 'Нет'}</td>
          <td>${attr.required ? 'Да' : 'Нет'}</td>
          <td>${attr.unique ? 'Да' : 'Нет'}</td>
          <td></td>
          <td></td>
          <td></td>
        </tr>`;
      });
    }

    if (ownAttributes.length > 0) {
      html += `
        <tr class="section-divider">
          <td colspan="9">Собственные атрибуты</td>
        </tr>`;
      
      ownAttributes.forEach(attr => {
        html += `
        <tr class="own-attributes">
          <td>${attr.name || ''}</td>
          <td>${attr.nameRu || ''}</td>
          <td>${attr.type || ''}</td>
          <td>${attr.selfAttr ? 'Собственный' : 'Родительский'}</td>
          <td>${attr.required ? 'Да' : 'Нет'}</td>
          <td>${attr.unique ? 'Да' : 'Нет'}</td>
          <td></td>
          <td></td>
          <td></td>
        </tr>`;
      });
    }

    html += `
      </tbody>
    </table>
  </div>
</body>
</html>`;

    return html;
  }

  generateDictionaryDocumentation(info) {
    const formInfo = info.dictionary;
    
    let html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Документация справочника ${formInfo.dictBase}</title>
  <style>
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      margin: 0; 
      padding: 20px; 
      background: #f5f5f5;
    }
    .container { 
      max-width: 1200px; 
      margin: 0 auto; 
      background: white; 
      padding: 30px; 
      border-radius: 10px; 
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1, h2, h3 { 
      color: #2c3e50; 
      margin-bottom: 20px;
    }
    h1 { 
      border-bottom: 2px solid #3498db; 
      padding-bottom: 10px;
    }
    .info-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-bottom: 30px;
    }
    .info-table td { 
      padding: 12px 15px; 
      border: 1px solid #808080;
    }
    .info-table td:first-child { 
      font-weight: bold; 
      background: #f8f9fa; 
      width: 200px;
    }
    .attributes-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-bottom: 30px;
    }
    .attributes-table th, .attributes-table td { 
      padding: 12px 15px; 
      border: 1px solid #808080; 
      text-align: left;
    }
    .attributes-table th { 
      background: #3498db; 
      color: white;
    }
    .attributes-table tr:nth-child(even) { 
      background: #f8f9fa;
    }
    .values-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-bottom: 30px;
    }
    .values-table th, .values-table td { 
      padding: 12px 15px; 
      border: 1px solid #808080; 
      text-align: left;
    }
    .values-table th { 
      background: #27ae60; 
      color: white;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Документация справочника ${formInfo.dictBase}</h1>
    
    <h2>Информация о справочнике</h2>
    <table class="info-table">
      <tr>
        <td>Системное имя</td>
        <td>${formInfo.dictBase}Dictionary</td>
      </tr>
      <tr>
        <td>Русское наименование</td>
        <td>${formInfo.dictNameRu}</td>
      </tr>
      <tr>
        <td>Описание</td>
        <td></td>
      </tr>
      <tr>
        <td>Родительский класс</td>
        <td>Dictionary</td>
      </tr>
      <tr>
        <td>Является системным</td>
        <td>Да</td>
      </tr>
      <tr>
        <td>Расположение в репозитории</td>
        <td>${info.repositoryLocation || 'Общее'}</td>
      </tr>
    </table>
    
    <h2>Атрибуты записи</h2>
    <table class="attributes-table">
      <thead>
        <tr>
          <th>Системное имя</th>
          <th>Русское наименование</th>
          <th>Тип</th>
        </tr>
      </thead>
      <tbody>`;

    if (formInfo.recordAttributes && formInfo.recordAttributes.length > 0) {
      formInfo.recordAttributes.forEach(attr => {
        html += `
        <tr>
          <td>${attr.name || ''}</td>
          <td>${attr.nameRu || ''}</td>
          <td>${attr.type || ''}</td>
        </tr>`;
      });
    }

    html += `
      </tbody>
    </table>`;

    if (formInfo.recordValues && formInfo.recordValues.length > 0) {
      html += `
    <h2>Значения справочника</h2>
    <table class="values-table">
      <thead>
        <tr>
          <th>Ключ</th>
          <th>Русское имя</th>
          <th>JSON значений</th>
        </tr>
      </thead>
      <tbody>`;

      formInfo.recordValues.forEach(value => {
        html += `
        <tr>
          <td>${value.key || ''}</td>
          <td>${value.nameRu || ''}</td>
          <td><code>${value.map || ''}</code></td>
        </tr>`;
      });

      html += `
      </tbody>
    </table>`;
    }

    html += `
  </div>
</body>
</html>`;

    return html;
  }
}