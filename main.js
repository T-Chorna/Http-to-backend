"use strict"
async function DataTable(config) {
  let parentElement = document.querySelector(config.parent);
  if(!parentElement){
    console.log("Parent element not found");
    return;
  }
  parentElement.innerHTML = "";
  parentElement.style.display = 'flex';
  parentElement.style.flexDirection = 'column';

  let btnAddData = document.createElement("button");
  btnAddData.setAttribute("class", "btn-add-data");
  btnAddData.innerHTML = "Додати";
  parentElement.appendChild(btnAddData);

  let table = document.createElement('table');
  table.appendChild(createHeadRow(config));
  table.appendChild(await createBodyRow(config));
  parentElement.appendChild(table);
  parentElement.appendChild(createModalInput(config));
}

function createHeadRow(config){
  let head = document.createElement('thead');
  let titleRow = document.createElement('tr');
  titleRow.appendChild(createElement('th', '№'));
  for(let i = 0; i < config.columns.length; i++){
    titleRow.appendChild(createElement('th', config.columns[i].title));
  }
  titleRow.appendChild(createElement('th', 'Дії'));
  return head.appendChild(titleRow);
}

async function createBodyRow(config){
  let dataObj = await sendRequest(config.apiUrl, 'GET');
  let data = dataObj.data;
  let body = document.createElement('tbody');

  let counterRow = 0;
  for (let [key, value] of Object.entries(data)){
    let row = document.createElement('tr');
    for(let i = 0; i <= config.columns.length; i++){
      if(i === 0){
        row.appendChild(createElement('td', ++counterRow));
        continue;
      }
      let column = config.columns[i-1];
      if(typeof config.columns[i-1].value === 'string'){
        row.appendChild(createElement('td', value[column.value]));
      } else{
        row.appendChild(createElement('td', column.value(value)))
      }
    }
    let actionCell = createElement('td',"");
    let button = createElement('button', "Видалити");
    button.setAttribute('class', 'btn-delete');
    button.onclick = () => {deleteItem(key, config)};
    actionCell.appendChild(button);
    row.appendChild(actionCell);
    body.appendChild(row);
  }
  return body;
}

function createModalInput(config){
  let modalOverlay = createElement("div", "");
  modalOverlay.setAttribute("class", "modal-overlay");
  let modal = createElement("div","");
  // let modal = createElement("div","<h2>Modal</h2>");
  modal.setAttribute("class", "modal");
  let form = createElement('form',"");

  for(let i = 0; i < config.columns.length; i++){
    let input = config.columns[i].input;
    // console.log(JSON.stringify(input));
    // console.log(!Array.isArray(input));
    if(!Array.isArray(input)){
      let inputElem = input.type === 'select' ? addSelect(input, config.columns[i].title, config.columns[i].value) 
                      : addInput(input, config.columns[i].title, config.columns[i].value);
      form.appendChild(inputElem);
      continue;
    }
    for(let j = 0; j < input.length; j++){
      let inputElem = input[j].type === 'select' ? addSelect(input[j], config.columns[i].title, config.columns[i].value) 
                      : addInput(input[j], config.columns[i].title, config.columns[i].value);
      form.appendChild(inputElem)
    }
  }
  modal.appendChild(form);
  modalOverlay.appendChild(modal);
  return modalOverlay;
}

function addInput(property, columnTitle, columnValue){
  let label = property.label ? property.label : columnTitle;
  let labelElement = createElement("label", label);
  let inputElement;
  if(property.type === 'textarea'){
    inputElement = createElement('textarea', '');
  } else {
    inputElement = createElement('input', '');
  }
  for(let [key, value] of Object.entries(property)){
    console.log(JSON.stringify(key) + "   " + JSON.stringify(value));
    inputElement.setAttribute(key, value);
  }
  if(!property.hasOwnProperty("name")){inputElement.setAttribute("name", columnValue);}
  if(!property.hasOwnProperty("required")){inputElement.setAttribute("required", true);}

  labelElement.appendChild(inputElement);
  labelElement.setAttribute('for', inputElement.getAttribute("name"));
  return labelElement;
}

function addSelect(property, columnTitle, columnValue){
  let label = property.label ? property.label : columnTitle;
  let labelElement = createElement("label", label);
  let selectElement = createElement('select', '');;
  for(let [key, value] of Object.entries(property)){
    if(key === 'options'){
      continue
    }
    selectElement.setAttribute(key, value);
  }
  if(!property.hasOwnProperty("name")){selectElement.setAttribute("name", columnValue);}
  // if(!property.hasOwnProperty("required")){inputElement.setAttribute("required", true);}
  for(let i = 0; i < property.options.length; i++){
    let option = createElement('option', property.options[i]);
    option.setAttribute('value', property.options[i]);
    selectElement.appendChild(option);
  }

  labelElement.appendChild(selectElement);
  labelElement.setAttribute('for', selectElement.getAttribute("name"));
  return labelElement;
}

{/* <div class="modal-overlay" id="modalOverlay">
<div class="modal">
    <h2>Модальне вікно</h2>
     <form action="#" method="post">

        <!-- Текстовое поле -->
        <div class="form-group">
            <label for="name">Имя:</label>
            <input type="text" id="name" name="name" placeholder="Введите ваше имя">
        </div>

        <!-- Поле для электронной почты -->
        <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" placeholder="Введите ваш email">
        </div>

        <!-- Поле для пароля -->
        <div class="form-group">
            <label for="password">Пароль:</label>
            <input type="password" id="password" name="password" placeholder="Введите ваш пароль">
        </div>

        <!-- Поле для номера телефона -->
        <div class="form-group">
            <label for="phone">Телефон:</label>
            <input type="tel" id="phone" name="phone" placeholder="Введите ваш телефон">
        </div>

        <!-- Поле для даты -->
        <div class="form-group">
            <label for="dob">Дата рождения:</label>
            <input type="date" id="dob" name="dob">
        </div>

        <!-- Выпадающий список -->
        <div class="form-group">
            <label for="country">Страна:</label>
            <select id="country" name="country">
                <option value="russia">Россия</option>
                <option value="ukraine">Украина</option>
                <option value="belarus">Беларусь</option>
                <option value="kazakhstan">Казахстан</option>
            </select>
        </div>

        <!-- Чекбоксы -->
        <div class="form-group">
            <label>Уведомления:</label>
            <input type="checkbox" id="email_notifications" name="notifications" value="email">
            <label for="email_notifications">Email</label>
            <input type="checkbox" id="sms_notifications" name="notifications" value="sms">
            <label for="sms_notifications">SMS</label>
        </div>

        <!-- Радио-кнопки -->
        <div class="form-group">
            <label>Пол:</label>
            <input type="radio" id="male" name="gender" value="male">
            <label for="male">Мужской</label>
            <input type="radio" id="female" name="gender" value="female">
            <label for="female">Женский</label>
        </div>

        <!-- Поле для текста -->
        <div class="form-group">
            <label for="message">Сообщение:</label>
            <textarea id="message" name="message" rows="4" placeholder="Введите ваше сообщение"></textarea>
        </div>

        <!-- Кнопка отправки -->
        <div class="form-group">
            <button type="submit">Отправить</button>
        </div>
    </form>
</div>
</div> */}

async function sendRequest(url, method){
  try {
    let response = await fetch(`${url}`, { method: method });
    if (response.ok) {
      let data = await response.json(); // Обробка JSON
      return data;
    } else {
      console.error('Помилка при обробці запиту:', response.statusText);
    }
  } catch (error) {
    console.error('Помилка при відправці запиту:', error);
  }
}

async function deleteItem(itemId, config){
  let deleteResponse = await sendRequest(`${config.apiUrl}/${itemId}`, 'DELETE');
  if(!deleteResponse) return;
  await DataTable(config)
}

function createElement(typeElement, content){
  let elem = document.createElement(typeElement);
  elem.innerHTML = content;
  return elem;
}

function getAge(birthDateString){
  let birthDate = new Date(birthDateString);
  let today = new Date();

  let yearDiff = today.getFullYear()-birthDate.getFullYear();
  let monthDiff = today.getMonth()-birthDate.getMonth();
  let dayDiff = today.getDate() - birthDate.getDate();

  if(dayDiff<0){
    monthDiff--;
    const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    dayDiff += previousMonth;
  }
  if(monthDiff < 0){
    yearDiff--;
    monthDiff += 12;
  }

  return `${yearDiff} year ${monthDiff} month ${dayDiff} day`
}

function getColorLabel(color){
  let square = `<div style="width:100px; height:100px; background-color:${color}"></div>`;
  return square;
}

const config1 = {
 parent: '#usersTable',
 columns: [
   {title: 'Ім’я', value: 'name'},
   {title: 'Прізвище', value: 'surname'},
   {title: 'Вік', value: (user) => getAge(user.birthday)}, // функцію getAge вам потрібно створити
   {title: 'Фото', value: (user) => `<img src="${user.avatar}" alt="${user.name} ${user.surname}"/>`} 
 ],
 apiUrl: "https://mock-api.shpp.me/tchorna/users"
};

// DataTable(config1);

const config2 = {
  parent: '#productsTable',
  columns: [
    {
      title: 'Назва', 
      value: 'title', 
      input: { type: 'text' }
    },
    {
      title: 'Ціна', 
      value: (product) => `${product.price} ${product.currency}`,
      input: [
        { type: 'number', name: 'price', label: 'Ціна' },
        { type: 'select', name: 'currency', label: 'Валюта', options: ['$', '€', '₴'], required: false }
      ]
    },
    {
      title: 'Колір', 
      value: (product) => getColorLabel(product.color), // функцію getColorLabel вам потрібно створити
      input: { type: 'color', name: 'color' }
    }, 
  ],
  apiUrl: "https://mock-api.shpp.me/tchorna/products"
};

DataTable(config2);
