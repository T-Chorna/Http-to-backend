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

  let modal = createModalInput(config)

  let btnAddData = document.createElement("button");
  btnAddData.setAttribute("class", "btn-add-data");
  btnAddData.innerHTML = "Додати";
  btnAddData.onclick = ()=>{modal.style.display = 'flex';}
  parentElement.appendChild(btnAddData);

  let table = document.createElement('table');
  table.appendChild(createHeadRow(config));
  table.appendChild(await createBodyRow(config));
  parentElement.appendChild(table);
  parentElement.appendChild(modal);
}
/**Створення верхівки таблиці з назвами колонок */
function createHeadRow(config){
  let head = document.createElement('thead');
  let titleRow = document.createElement('tr');
  titleRow.appendChild(createElement('th', '№'));
  for(let i = 0; i < config.columns.length; i++){
    titleRow.appendChild(createElement('th', config.columns[i].title));
  }
  titleRow.appendChild(createElement('th', 'Дії'));
  head.appendChild(titleRow)
  return head;
}

/**Створення тіла таблиці, а саме рядків з інформацією отриманою за вказаною інтернет адресою */
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
    let buttonDelete = createElement('button', "Видалити");
    buttonDelete.setAttribute('class', 'btn-delete');
    buttonDelete.onclick = () => {deleteItem(key, config)};
    actionCell.appendChild(buttonDelete);

    let buttonEdit = createElement('button', "Редагувати");
    buttonEdit.setAttribute('class', 'btn-edit');
    buttonEdit.onclick = () => {editItem(row, key, config)};
    actionCell.appendChild(buttonEdit);
    row.appendChild(actionCell);
    body.appendChild(row);
  }
  return body;
}

/**Створення модального вікна */
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
      let inputElem = input.type === 'select' ? addSelectWithLabel(input, config.columns[i].title, config.columns[i].value) 
                      : addInputWithLabel(input, config.columns[i].title, config.columns[i].value);
      form.appendChild(inputElem);
      continue;
    }
    for(let j = 0; j < input.length; j++){
      let inputElem = input[j].type === 'select' ? addSelectWithLabel(input[j], config.columns[i].title, config.columns[i].value) 
                      : addInputWithLabel(input[j], config.columns[i].title, config.columns[i].value);
      form.appendChild(inputElem)
    }
  }
  form.appendChild(createFormButtons(modalOverlay, form, config));

  // Обробка натискання клавіші Enter
  form.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      console.log('press enter');
      event.preventDefault(); // Запобігаємо стандартній дії для Enter
      handleSubmit(modalOverlay, form, config);
    }
  });

  modal.appendChild(form);
  modalOverlay.appendChild(modal);
  return modalOverlay;
}

function createFormButtons(modalOverlay, form, config){
  let btnContainer = createElement('div', '');
  btnContainer.setAttribute('class', 'form-btn-container');

  let btnCloseModal = createElement('button', 'Закрити');
  btnCloseModal.setAttribute('class', 'btn-close-modal');
  btnCloseModal.onclick = ()=>{modalOverlay.style.display = 'none'};
  btnContainer.appendChild(btnCloseModal);

  let btnSendForm = createElement('button', 'Додати');
  btnSendForm.setAttribute('class', 'btn-send-form-modal');
  btnSendForm.onclick = (event)=>{event.preventDefault(); handleSubmit(modalOverlay, form, config)};
  btnContainer.appendChild(btnSendForm);
  return btnContainer
}

function handleSubmit(modalOverlay, form, config) {
  const formData = new FormData(form);
  // const dataForSend = {data:{}};
  const dataForSend = {};

  let hasEmptyFields = false; // Перевірка на наявність порожніх полів

  formData.forEach((value, key) => {
    const inputElement = form.querySelector(`[name="${key}"]`);
    if(!value){
      inputElement.style.borderColor = 'red';
      hasEmptyFields = true; // Вказуємо, що є порожнє поле
    } else if (inputElement.type === 'number') {
      inputElement.style.borderColor = 'black';
      dataForSend[key] = parseFloat(value); // Перетворюємо рядок на число
    } else {
      inputElement.style.borderColor = 'black';
      dataForSend[key] = value; // Для інших типів залишаємо значення як є
    }
  });

  if (hasEmptyFields) {
    console.log('Please fill in all required fields.');
    return; // Якщо є порожні поля, зупиняємо виконання функції
  }

    sendRequest(config.apiUrl, "POST", dataForSend);

    // Очищення полів форми з перевіркою на тип color
    form.querySelectorAll('input, select').forEach(input => {
      if (input.type === 'color') {
        input.value = '#000000'; // Установлюємо значення за замовчуванням
      } else {
        input.value = ''; // Очищуємо інші поля
      }
    });

    modalOverlay.style.display = 'none'
    DataTable(config)

}

/**Додавання полей для отримання інформації від користувача */
function addInputWithLabel(property, columnTitle, columnValue){
  let label = property.label ? property.label : columnTitle;
  let labelElement = createElement("label", label);
  let inputElement;
  if(property.type === 'textarea'){
    inputElement = createElement('textarea', '');
  } else {
    inputElement = createElement('input', '');
  }
  for(let [key, value] of Object.entries(property)){
    // console.log(JSON.stringify(key) + "   " + JSON.stringify(value));
    inputElement.setAttribute(key, value);
  }
  if(!property.hasOwnProperty("name")){inputElement.setAttribute("name", columnValue);}
  if(!property.hasOwnProperty("required")){inputElement.setAttribute("required", true);}

  labelElement.appendChild(inputElement);
  labelElement.setAttribute('for', inputElement.getAttribute("name"));
  return labelElement;
}

/**Додавання випадаючого списку */
function addSelectWithLabel(property, columnTitle, columnValue){
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


async function sendRequest(url, method, body){
  console.log(JSON.stringify(body));
  try {
    let response;
    if(body){
      response = await fetch(`${url}`, { 
                    method: method, 
                    headers: {'Content-Type': 'application/json'}, 
                    body: JSON.stringify(body) 
                  });
    } else {
      response = await fetch(`${url}`, { 
        method: method, 
      });
    }
    
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


/**Відповідає за видалення рядка з таблиці */
async function deleteItem(itemId, config){
  let deleteResponse = await sendRequest(`${config.apiUrl}/${itemId}`, 'DELETE');
  if(!deleteResponse) return;
  await DataTable(config)
}

/**Створення елементу певного типу з певним змістом */
function createElement(typeElement, content){
  let elem = document.createElement(typeElement);
  elem.innerHTML = content;
  return elem;
}

/**Функція для отримання віку. Приймає рядок з датою народження, а повертає скільки років, місяців та днів минуло */
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

/**Функція для отримання квадратного елемента вказаного кольору */
function getColorLabel(color){
  let square = `<div style="width:100px; height:100px; background-color:${color};"></div>`;
  return square;
}

function editItem(row, itemId, config){
  let cells = row.querySelectorAll('td');
  for(let i = 0; i < config.columns.length; i++){
    let currentCell = cells[i+1];
    let currentCellValue = currentCell.innerHTML;
    // console.log(currentCellValue);
    currentCell.innerHTML = '';

    let input = config.columns[i].input;
    if(!Array.isArray(input)){
      let inputElem = input.type === 'select' ? addSelectWithoutLabel(input, config.columns[i].value, currentCellValue) 
                      : addInputWithoutLabel(input, config.columns[i].title, config.columns[i].value);
      if(input.type === 'color'){currentCellValue = currentCellValue.match(/#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g)}
      inputElem.value = currentCellValue;
      currentCell.appendChild(inputElem);
      continue;
    }
    currentCellValue = currentCellValue.split(' ');
    console.log(currentCellValue);
    for(let j = 0; j < input.length; j++){
      let inputElem = input[j].type === 'select' ? addSelectWithoutLabel(input[j], config.columns[i].value, currentCellValue[j]) 
                      : addInputWithoutLabel(input[j], config.columns[i].title, config.columns[i].value);
      if(input.type === 'color'){currentCellValue[j] = currentCellValue[j].match(/#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g)}
      inputElem.value = currentCellValue[j];
      currentCell.appendChild(inputElem)
    }
  }
}
function addInputWithoutLabel(property, columnValue){
  let inputElement;
  if(property.type === 'textarea'){
    inputElement = createElement('textarea', '');
  } else {
    inputElement = createElement('input', '');
  }
  for(let [key, value] of Object.entries(property)){
    // console.log(JSON.stringify(key) + "   " + JSON.stringify(value));
    inputElement.setAttribute(key, value);
  }
  if(!property.hasOwnProperty("name")){inputElement.setAttribute("name", columnValue);}
  if(!property.hasOwnProperty("required")){inputElement.setAttribute("required", true);}
  return inputElement;
}

/**Додавання випадаючого списку */
function addSelectWithoutLabel(property,columnValue, selectedOptions){
  let selectElement = createElement('select', '');;
  for(let [key, value] of Object.entries(property)){
    if(key === 'options'){
      continue
    }
    selectElement.setAttribute(key, value);
  }
  if(!property.hasOwnProperty("name")){selectElement.setAttribute("name", columnValue);}
  for(let i = 0; i < property.options.length; i++){
    let option = createElement('option', property.options[i]);
    option.setAttribute('value', property.options[i]);

    console.log(property.options[i]);
    console.log(selectedOptions);
    // Умова для вибору значення за замовчуванням
    if (property.options[i] === selectedOptions) {
      option.setAttribute('selected', 'selected');
    }

    selectElement.appendChild(option);
  }

  return selectElement;
}

/*
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

DataTable(config1);*/

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
