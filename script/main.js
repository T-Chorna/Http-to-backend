"use strict"

import {sendGETRequest, sendPOSTRequest, sendPUTRequest, sendDELETERequest } from './services.js';
import { config1, config2 } from './configs.js';

async function DataTable(config) {
  let parentElement = document.querySelector(config.parent);
  if(!parentElement){
    console.error("Parent element not found");
    return;
  }
  parentElement.textContent = "";
  parentElement.style.display = 'flex';
  parentElement.style.flexDirection = 'column';

  let modal = createModalInput(config)

  let btnAddData = document.createElement("button");
  btnAddData.setAttribute("class", "btn-add-data");
  btnAddData.textContent = "Додати";
  btnAddData.onclick = ()=>{showModal(modal)};
  parentElement.appendChild(btnAddData);

  let table = document.createElement('table');
  table.appendChild(createTableHead(config.columns));
  table.appendChild(await createTableBody(config));
  parentElement.appendChild(table);
  parentElement.appendChild(modal);
}

function showModal(modal){
  modal.style.display = 'flex';
}

function createElement(typeElement, content){
  let elem = document.createElement(typeElement);
  //тут змінюввати innerHTML на textContent не стала оскільки використовується не тільки для вставлення тексту але й HTML елементів
  elem.innerHTML = content;
  return elem;
}

function createTableHead(columns){
  let head = document.createElement('thead');
  let titleRow = document.createElement('tr');
  titleRow.appendChild(createElement('th', '№'));
  for(let i = 0; i < columns.length; i++){
    titleRow.appendChild(createElement('th', columns[i].title));
  }
  titleRow.appendChild(createElement('th', 'Дії'));
  head.appendChild(titleRow)
  return head;
}

async function createTableBody(config){
  let dataObj = await sendGETRequest(config.apiUrl);
  let data = dataObj.data;
  let body = document.createElement('tbody');

  let counterRow = 0;
  //цикл для створення рядків таблиці з даними
  for (let [key, value] of Object.entries(data)){
    let row = createRowWithData(++counterRow, key, value, config);
    body.appendChild(row);
  }
  return body;
}

function createRowWithData(rowNumber, rowId, rowValues, config){
  let row = document.createElement('tr');

  for(let i = 0; i <= config.columns.length; i++){
    //в першу комірку поміщуємо номер рядку
    if(i === 0){
      row.appendChild(createElement('td', rowNumber));
      continue;
    }

    let columnValue = config.columns[i-1].value;
    //якщо значення колонки це функція то в комірку розміщуємо результат виконання цієї функції
    if(typeof columnValue === 'function'){
      row.appendChild(createElement('td', columnValue(rowValues)))
    } else {
      row.appendChild(createElement('td', rowValues[columnValue]))
    }
  }
  //створюємо кнопки "Видалити" та "Редагувати" в останній комірці
  addActionCell(row, rowId, config);
  return row;
}

function addActionCell(row, rowId, config){
  let actionCell = createElement('td',"");
  let buttonDelete = createElement('button', "Видалити");
  buttonDelete.setAttribute('class', 'btn-delete');
  buttonDelete.onclick = () => {deleteItem(rowId, config)};
  actionCell.appendChild(buttonDelete);

  let buttonEdit = createElement('button', "Редагувати");
  buttonEdit.setAttribute('class', 'btn-edit');
  buttonEdit.onclick = () => {editItem(row, rowId, config)};
  actionCell.appendChild(buttonEdit);

  row.appendChild(actionCell);
}

function createModalInput(config){
  let modalOverlay = createElement("div", "");
  modalOverlay.setAttribute("class", "modal-overlay");

  let modal = createElement("div","");
  modal.setAttribute("class", "modal");
  
  modal.appendChild(createModalForm(modalOverlay, config));
  modalOverlay.appendChild(modal);
  return modalOverlay;
}

function createModalForm(modalOverlay, config){
  let form = createElement('form',"");

  for(let i = 0; i < config.columns.length; i++){
    let columnInput = config.columns[i].input;
    let columnTitle = config.columns[i].title;
    let columnValue = config.columns[i].value;

    if(!Array.isArray(columnInput)){
      let inputElem = createInputElementWithLabel(columnInput, columnTitle, columnValue);
      form.appendChild(inputElem);
      continue;
    }
    for(let j = 0; j < columnInput.length; j++){
      let inputElem = createInputElementWithLabel(columnInput[j], columnTitle, columnValue);
      form.appendChild(inputElem)
    }
  }

  addFormButtons(modalOverlay, form, config);

  form.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); 
      handleSubmitAddItem(modalOverlay, form, config);
    }
  });
  return form;
}

function createInputElementWithLabel(columnInput, columnTitle, columnValue){
  if(columnInput.type === 'select') return addSelectWithLabel(columnInput, columnTitle, columnValue);
  return addInputWithLabel(columnInput, columnTitle, columnValue);
}

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
    inputElement.setAttribute(key, value);
  }

  if(!Object.hasOwn(property, 'name')){inputElement.setAttribute("name", columnValue);}
  if(!Object.hasOwn(property, 'required')){inputElement.setAttribute("required", true);}

  labelElement.appendChild(inputElement);
  labelElement.setAttribute('for', inputElement.getAttribute("name"));
  return labelElement;
}

function addSelectWithLabel(property, columnTitle, columnValue){
  let label = property.label ? property.label : columnTitle;
  let labelElement = createElement("label", label);
  let selectElement = createElement('select', '');

  //Додаємо всі властивості select (окрім options) з інпуту конфігурації
  for(let [key, value] of Object.entries(property)){
    if(key === 'options'){
      continue
    }
    selectElement.setAttribute(key, value);
  }
  if(!Object.hasOwn(property, 'name')){selectElement.setAttribute("name", columnValue);}

  //Додаємо всі варіанти (options) селекту
  for(let i = 0; i < property.options.length; i++){
    let option = createElement('option', property.options[i]);
    option.setAttribute('value', property.options[i]);
    selectElement.appendChild(option);
  }
  addEventListenerForSelect(selectElement);
  labelElement.appendChild(selectElement);
  labelElement.setAttribute('for', selectElement.getAttribute("name"));
  return labelElement;
}

function addEventListenerForSelect(select){
  select.addEventListener('focus', function() {
    this.size = 3; 
  });
  select.addEventListener('blur', function() {
    this.size = 1;
  });
  select.addEventListener('change', function() {
    this.size = 1; 
    this.blur()
  });
}

function addFormButtons(modalOverlay, form, config){
  let btnContainer = createElement('div', '');
  btnContainer.setAttribute('class', 'form-btn-container');

  let btnCloseModal = createElement('button', 'Закрити');
  btnCloseModal.setAttribute('class', 'btn-close-modal');
  btnCloseModal.onclick = ()=>{
    clearForm(form); 
    modalOverlay.style.display = 'none'
  };
  btnContainer.appendChild(btnCloseModal);

  let btnSendForm = createElement('button', 'Додати');
  btnSendForm.setAttribute('class', 'btn-send-form-modal');
  btnSendForm.onclick = (event)=>{
    event.preventDefault(); 
    handleSubmitAddItem(modalOverlay, form, config)
  };
  btnContainer.appendChild(btnSendForm);

  form.appendChild(btnContainer);
}

async function handleSubmitAddItem(modalOverlay, form, config) {
  const formData = new FormData(form);
  const dataForSend = {};

  let hasEmptyFields = false; 

  //проходимо по всіх полях форми, якщо якесь не заповнене, робимо колір бордеру червоним
  formData.forEach((value, key) => {
    const inputElement = form.querySelector(`[name="${key}"]`);
    if(!value){
      inputElement.style.borderColor = 'red';
      hasEmptyFields = true; 
    } else if (inputElement.type === 'number') {
      inputElement.style.borderColor = 'black';
      dataForSend[key] = parseFloat(value); 
    } else {
      inputElement.style.borderColor = 'black';
      dataForSend[key] = value; 
    }
  });

  if (hasEmptyFields) {
    console.log('Please fill in all required fields.');
    return;
  }

  await sendPOSTRequest(config.apiUrl, dataForSend)

  clearForm(form);

  modalOverlay.style.display = 'none'
  DataTable(config)
}

function clearForm(form){
  form.querySelectorAll('input, select, textarea').forEach(input => {
    if (input.type === 'color') {
      input.value = '#000000'; 
    } else {
      input.value = ''; 
    }
  });
}

async function deleteItem(itemId, config){
  let deleteResponse = await sendDELETERequest(`${config.apiUrl}/${itemId}`)
  if(!deleteResponse) return;
  await DataTable(config)
}

function editItem(row, itemId, config){
  let cells = row.querySelectorAll('td');
  for(let i = 0; i < config.columns.length; i++){
    let currentCell = cells[i+1];
    let currentCellValue = currentCell.innerHTML;
    currentCell.innerHTML = '';

    let input = config.columns[i].input;
    if(!Array.isArray(input)){
      let inputElem = createInputElementWithoutLabel(input, config.columns[i].value, currentCellValue);
      currentCell.appendChild(inputElem);
      continue;
    }
    currentCellValue = currentCellValue.split(' ');
    for(let j = 0; j < input.length; j++){
      let inputElem = createInputElementWithoutLabel(input[j], config.columns[i].value, currentCellValue[j]);
      currentCell.appendChild(inputElem)
    }
  }

  addEditBtns(cells[cells.length-1], row, itemId, config);
}

function createInputElementWithoutLabel(columnInput, columnValue, currentCellValue){
  switch(columnInput.type){
    case 'select': 
                  return addSelectWithoutLabel(columnInput, columnValue, currentCellValue);
    case 'color': currentCellValue = currentCellValue.match(/#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g);
                  break;
    case 'date': currentCellValue = getBirthday(currentCellValue);
                  break;
    case 'url': currentCellValue = extractUrlFromHtml(currentCellValue);
                  break;
  }
  let inputElement = addInputWithoutLabel(columnInput, columnValue);
  inputElement.value = currentCellValue;
  return  inputElement;
}

function extractUrlFromHtml(htmlString) {
  const urlMatch = htmlString.match(/(?:href|src)="([^"]*)"/);
  return urlMatch ? urlMatch[1] : null;
}

function addEditBtns(cell, row, rowId, config){
  let lastCells = cell;
  lastCells.querySelector('.btn-delete').style.display = 'none';
  lastCells.querySelector('.btn-edit').style.display = 'none';
  let buttonClose = createElement('button', "Закрити");
  buttonClose.setAttribute('class', 'btn-delete');
  buttonClose.onclick = () => {DataTable(config)};
  lastCells.appendChild(buttonClose);

  let buttonEdit = createElement('button', "Зберегти");
  buttonEdit.setAttribute('class', 'btn-save-edit');
  buttonEdit.onclick = (event) => {event.preventDefault(); handleSubmitEditItem(row, rowId, config)};
  lastCells.appendChild(buttonEdit);
}

function addInputWithoutLabel(property, columnValue){
  let inputElement;
  if(property.type === 'textarea'){
    inputElement = createElement('textarea', '');
  } else {
    inputElement = createElement('input', '');
  }
  for(let [key, value] of Object.entries(property)){
    inputElement.setAttribute(key, value);
  }
  if(!Object.hasOwn(property, 'name')){inputElement.setAttribute("name", columnValue);}
  if(!Object.hasOwn(property, 'required')){inputElement.setAttribute("required", true);}
  return inputElement;
}

function addSelectWithoutLabel(property,columnValue, selectedOptions){
  let selectElement = createElement('select', '');

  //Додаємо атрибути до селект елемента
  for(let [key, value] of Object.entries(property)){
    if(key === 'options'){
      continue
    }
    selectElement.setAttribute(key, value);
  }
  if(!Object.hasOwn(property, 'name')){selectElement.setAttribute("name", columnValue);}

  //додаємо варіанти відповідей
  for(let i = 0; i < property.options.length; i++){
    let option = createElement('option', property.options[i]);
    option.setAttribute('value', property.options[i]);
    if (property.options[i] === selectedOptions) {
      option.setAttribute('selected', 'selected');
    }

    selectElement.appendChild(option);
  }

  addEventListenerForSelect(selectElement);

  return selectElement;
}

async function handleSubmitEditItem(row, itemId, config) {
  let inputs = row.querySelectorAll('input');
  let selects = row.querySelectorAll('select');
  let texareas = row.querySelectorAll('textarea');
  let allInputs = [...inputs, ...selects, ...texareas];
  const dataForSend = {};

  let hasEmptyFields = false; 

  //проходимо по всіх інпутах, якщо якийсь не заповненний, його межі стають червоними
  allInputs.forEach((item) => {
    const itemValue = item.value;
    if(!itemValue){
      item.style.borderColor = 'red';
      hasEmptyFields = true; 
    } else if (item.type === 'number') {
      item.style.borderColor = 'black';
      dataForSend[item.name] = parseFloat(itemValue);
    } else {
      item.style.borderColor = 'black';
      dataForSend[item.name] = itemValue;
    }
  });

  if (hasEmptyFields) {
    alert('Please fill in all required fields.');
    return; 
  }

  await sendPUTRequest(`${config.apiUrl}/${itemId}`, dataForSend);

  DataTable(config)
}

function getBirthday(diffDate){
  let yearMonthDayDiff = diffDate.split(' ').filter((item) => {return !isNaN(+item)});
  let birthday = new Date();

  birthday.setDate(birthday.getDate()- yearMonthDayDiff[2]);
  birthday.setMonth(birthday.getMonth()-yearMonthDayDiff[1]);
  birthday.setFullYear(birthday.getFullYear()-yearMonthDayDiff[0]);

  let birthdayYear = birthday.getFullYear();
  let birthdayMonth = birthday.getMonth()+1 < 10 ? `0${birthday.getMonth()+1}` : birthday.getMonth()+1;
  let birthdayDay = birthday.getDate() < 10 ? `0${birthday.getDate()}` : birthday.getDate();


  let resultString =  `${birthdayYear}-${birthdayMonth}-${birthdayDay}`;
  return resultString;
}




DataTable(config1);
DataTable(config2);
