"use strict"
async function DataTable(config) {
  let parentElement = document.querySelector(config.parent);
  if(!parentElement){
    console.log("Parent element not found");
    return;
  }
  parentElement.innerHTML = "";

  let table = document.createElement('table');
  table.appendChild(createHeadRow(config));
  table.appendChild(await createBodyRow(config));
  parentElement.appendChild(table);
}

function createHeadRow(config){
  let head = document.createElement('thead');
  let titleRow = document.createElement('tr');
  titleRow.appendChild(createCell('th', '№'));
  for(let i = 0; i < config.columns.length; i++){
    titleRow.appendChild(createCell('th', config.columns[i].title));
  }
  titleRow.appendChild(createCell('th', 'Дії'));
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
        row.appendChild(createCell('td', ++counterRow));
        continue;
      }
      let column = config.columns[i-1];
      if(typeof config.columns[i-1].value === 'string'){
        row.appendChild(createCell('td', value[column.value]));
      } else{
        row.appendChild(createCell('td', column.value(value)))
      }
    }
    let actionCell = createCell('td',"");
    let button = createCell('button', "Видалити");
    button.onclick = () => {deleteItem(key, config)};
    actionCell.appendChild(button);
    row.appendChild(actionCell);
    body.appendChild(row);
  }
  return body;
}

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

function createCell(typeCell, content){
  let cell = document.createElement(typeCell);
  cell.innerHTML = content;
  return cell;
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

DataTable(config1);
