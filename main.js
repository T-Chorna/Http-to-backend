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
  table.appendChild(createModalInput(config));
  parentElement.appendChild(table);
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
  let modal = createElement("div","<h2>Modal</h2>");
  modal.setAttribute("class", "modal");
  let form = createElement('form',"");

  for(let i = 0; i < config.columns.length; i++){
    let input = config.columns[i].input;
    if(!Array.isArray(input)){
      let label = input.label?input.label:config.columns[i];
      let labelElement = createElement("label", label);
    }
  }

  modalOverlay.appendChild(modal);
  return modalOverlay;
}

{/* <div class="modal-overlay" id="modalOverlay">
<div class="modal">
    <h2>Модальне вікно</h2>
    <p>Це просте і симпатичне модальне вікно. Ви можете додати сюди будь-який вміст.</p>
    <button onclick="closeModal()">Закрити</button>
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
  let square = `<div style="width:100px; height:100px; background-color:${color}"></div>"`;
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
