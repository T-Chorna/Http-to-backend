"use strict"

/**
 * DataTable is a constructor function that creates a dynamic HTML table based on the provided configuration.
 * 
 * @param {Object} config - The configuration object for setting up the table.
 * 
 * The configuration object should have the following structure:
 * 
 * @param {string} config.parent - A CSS selector that points to the HTML element where the table will be rendered.
 * 
 * @param {Array} config.columns - An array of objects, each defining a column in the table. 
 *     Each object should contain:
 *     - {string} title: The title of the column, which will be displayed as the header.
 *     - {string|function} value: The key or a function to retrieve the value for each cell in this column.
 *         - If a string is provided, it will be used as the key to extract the value from the data object.
 *         - If a function is provided, it will be called with the data object as its argument and should return the 
 *           content for the cell.
 * 
 * @param {string} config.apiUrl - The URL of the API endpoint to fetch the data for populating the table.
 * 
 * The DataTable function will render an HTML table inside the element specified by `parent`, with columns as defined 
 * in `columns`, and will populate the rows with data fetched from `apiUrl`.
 */
async function DataTable(config) {
  let parentElement = document.querySelector(config.parent);
  if(!parentElement){
    console.error("Parent element not found");
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
  table.appendChild(createHeadRow(config.columns));
  table.appendChild(await createBodyRow(config));
  parentElement.appendChild(table);
  parentElement.appendChild(modal);
}

/**
 * createElement is a utility function that creates a new HTML element of the specified type and sets its inner HTML content.
 *
 * @param {string} typeElement - The type of HTML element to create (e.g., 'div', 'span', 'td', 'button').
 * @param {string} content - The HTML content to set as the innerHTML of the created element.
 *
 * The function performs the following tasks:
 * 1. Creates a new HTML element using `document.createElement()` with the specified `typeElement`.
 * 2. Sets the `innerHTML` of the created element to the provided `content`.
 * 3. Returns the newly created element.
 *
 * @returns {HTMLElement} - The created HTML element with the specified content.
 */
function createElement(typeElement, content){
  let elem = document.createElement(typeElement);
  elem.innerHTML = content;
  return elem;
}


/**
 * Function createHeadRow generates a table header (`<thead>`) element with a row of column titles based on the 
 * provided configuration.
 *
 * @param {Array} columns - An array of objects that define the columns for the table.
 *     Each object in the array should have the following structure:
 *     - {string} title: The title of the column, which will be used as the header text.
 *     - {string|function} value: The key or a function to retrieve the value for each cell in the corresponding 
 *       column (not used in this function, but included for context).
 *
 * The function performs the following actions:
 * 1. Creates a `<thead>` element to represent the table header.
 * 2. Creates a `<tr>` element to represent a row within the header.
 * 3. Adds a column with the title "№" as the first header cell, representing a row number.
 * 4. Iterates over the `columns` array and adds a `<th>` element for each column's title.
 * 5. Adds an additional column with the title "Actions" ("Дії" in Ukrainian) as the last header cell.
 * 6. Appends the completed row to the `<thead>` element and returns it.
 *
 * @returns {HTMLElement} - The generated `<thead>` element with the column titles.
 */
function createHeadRow(columns){
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

/**
 * createBodyRow is an asynchronous function that generates the table body (`<tbody>`) based on the provided 
 * configuration and fetched data.
 *
 * @param {Object} config - The configuration object that defines how the table should be created.
 * 
 * The `config` object should have the following structure:
 * @param {string} config.parent - A CSS selector for the HTML element where the table is rendered.
 * @param {Array} config.columns - An array of objects, each defining a column in the table. 
 *     Each object should contain:
 *     - {string} title: The title of the column.
 *     - {string|function} value: The key or a function to retrieve the value for each cell in this column.
 * @param {string} config.apiUrl - The URL of the API endpoint to fetch data for populating the table.
 * 
 * The function performs the following tasks:
 * 1. Sends an HTTP GET request to the API URL specified in `config.apiUrl` to fetch the data.
 * 2. Creates a `<tbody>` element to hold the rows of the table.
 * 3. Iterates over the fetched data, generating a row (`<tr>`) for each item in the data set.
 * 4. Adds a sequential number (row index) as the first cell (`<td>`) of each row.
 * 5. For each column defined in `config.columns`, retrieves the appropriate value:
 *     - If `value` is a string, it extracts the corresponding property from the data object.
 *     - If `value` is a function, it calls the function with the data object to generate the cell content.
 * 6. Adds an "Actions" column with "Delete" and "Edit" buttons:
 *     - The "Delete" button calls the `deleteItem` function when clicked, passing the item's key and configuration.
 *     - The "Edit" button calls the `editItem` function when clicked, passing the row, key, and configuration.
 * 7. Appends each completed row to the `<tbody>` element.
 * 
 * @returns {HTMLElement} - The generated `<tbody>` element with all the data rows.
 */

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

/**
 * createModalInput is a function that generates a modal dialog with an input form based on the provided configuration.
 * 
 * @param {Object} config - The configuration object that defines the structure of the form and its inputs.
 * 
 * The `config` object should have the following structure:
 * @param {string} config.parent - A CSS selector for the HTML element where the modal might be appended (not directly 
 *                              used here).
 * @param {Array} config.columns - An array of objects, each defining a column in the table and the corresponding input 
 *                              elements for the form. 
 *     Each object in `columns` should contain:
 *     - {string} title: The label for the form input, corresponding to the column title.
 *     - {string|function} value: The key or function to retrieve the value for this input (not used directly in this function).
 *     - {Object|Array} input: An object or array defining the input fields:
 *         - If an object, it defines a single input field (e.g., text, number, select, color).
 *         - If an array, it defines multiple input fields associated with the same column.
 * 
 * The function performs the following tasks:
 * 1. Creates the modal overlay and modal container elements.
 * 2. Iterates over the `config.columns` array to create form input elements based on the specified `input` configuration:
 *     - If `input` is an object, a single input field is created (either a standard input or a select element).
 *     - If `input` is an array, multiple input fields are created.
 * 3. Adds the generated input elements to the form.
 * 4. Appends form buttons (e.g., Submit, Cancel) to the form.
 * 5. Adds an event listener to the form to handle form submission via the Enter key, triggering `handleSubmitAddItem`.
 * 6. Assembles the modal structure and returns the complete modal overlay element.
 * 
 * @returns {HTMLElement} - The generated modal overlay element containing the form.
 */
function createModalInput(config){
  let modalOverlay = createElement("div", "");
  modalOverlay.setAttribute("class", "modal-overlay");
  let modal = createElement("div","");
  modal.setAttribute("class", "modal");
  let form = createElement('form',"");

  for(let i = 0; i < config.columns.length; i++){
    let input = config.columns[i].input;
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

  form.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); 
      handleSubmitAddItem(modalOverlay, form, config);
    }
  });

  modal.appendChild(form);
  modalOverlay.appendChild(modal);
  return modalOverlay;
}

/**
 * Creates a labeled input or textarea element.
 * 
 * @param {Object} property - An object defining the attributes of the input element.
 *                             Required property: `type` (e.g., 'text', 'number', 'textarea').
 *                             Optional properties: `label`, `name`, `required`, etc.
 * @param {string} columnTitle - The title of the column that the input belongs to. Used for labeling.
 * @param {string} columnValue - The value associated with the column. Used as the `name` attribute of the input if not 
 *                            provided in `property`.
 * 
 * @returns {HTMLElement} - A `label` element containing the input element.
 * 
 * This function generates a `label` element with a nested input or textarea element. It sets attributes based on the 
 * `property` object.
 * If `label` is provided in `property`, it uses that; otherwise, it uses `columnTitle`. If `name` or `required` is not 
 * provided in `property`, they are set based on `columnValue` and default to `true`, respectively.
 */
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
  if(!property.hasOwnProperty("name")){inputElement.setAttribute("name", columnValue);}
  if(!property.hasOwnProperty("required")){inputElement.setAttribute("required", true);}

  labelElement.appendChild(inputElement);
  labelElement.setAttribute('for', inputElement.getAttribute("name"));
  return labelElement;
}

/**
 * Creates a labeled select element with options.
 * 
 * @param {Object} property - An object defining the attributes of the select element.
 *                             Required properties: `type` (should be 'select'), `options` (an array of option values).
 *                             Optional properties: `label`, `name`, etc.
 * @param {string} columnTitle - The title of the column that the select belongs to. Used for labeling.
 * @param {string} columnValue - The value associated with the column. Used as the `name` attribute of the select if not 
 *                            provided in `property`.
 * 
 * @returns {HTMLElement} - A `label` element containing the select element.
 * 
 * This function generates a `label` element with a nested `select` element. It sets attributes and options based on the 
 * `property` object.
 * If `label` is provided in `property`, it uses that; otherwise, it uses `columnTitle`. If `name` is not provided in 
 * `property`,
 * it is set based on `columnValue`. The `select` element is enhanced with event listeners to adjust its size on focus 
 * and blur.
 */
function addSelectWithLabel(property, columnTitle, columnValue){
  let label = property.label ? property.label : columnTitle;
  let labelElement = createElement("label", label);
  let selectElement = createElement('select', '');

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
    selectElement.appendChild(option);
  }

  selectElement.addEventListener('focus', function() {
    this.size = 3; 
  });
  selectElement.addEventListener('blur', function() {
    this.size = 1;
  });
  selectElement.addEventListener('change', function() {
    this.size = 1; 
    this.blur()
  });

  labelElement.appendChild(selectElement);
  labelElement.setAttribute('for', selectElement.getAttribute("name"));
  return labelElement;
}

/**
 * createFormButtons is a function that generates a container with form action buttons for a modal dialog.
 * 
 * @param {HTMLElement} modalOverlay - The modal overlay element that contains the form and other modal elements.
 * @param {HTMLFormElement} form - The form element inside the modal that is used for data input.
 * @param {Object} config - The configuration object that defines the structure of the form and table.
 * 
 * The `config` object should have the following structure:
 * @param {string} config.parent - A CSS selector for the HTML element where the table is rendered (not directly used here).
 * @param {Array} config.columns - An array of objects, each defining a column in the table and the corresponding form inputs.
 * @param {string} config.apiUrl - The URL of the API endpoint to send data when the form is submitted (not directly used here).
 * 
 * The function performs the following tasks:
 * 1. Creates a container (`<div>`) for the buttons and sets its class to `form-btn-container`.
 * 2. Creates a "Close" button (`<button>`) that, when clicked, hides the modal by setting its `display` style to `none`.
 * 3. Creates a "Submit" button (`<button>`) that, when clicked, prevents the default form submission, 
 *    and instead calls the `handleSubmitAddItem` function to handle form submission logic.
 * 4. Appends both buttons to the button container.
 * 5. Returns the button container element, which can be appended to the form or modal.
 * 
 * @returns {HTMLElement} - The container with the "Close" and "Submit" buttons.
 */
function createFormButtons(modalOverlay, form, config){
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
  return btnContainer
}

/**
 * handleSubmitAddItem is an asynchronous function that handles the submission of a form within a modal dialog.
 * It validates the input data, sends it to the specified API endpoint, clears the form, and updates the table.
 * 
 * @param {HTMLElement} modalOverlay - The modal overlay element that contains the form.
 * @param {HTMLFormElement} form - The form element containing the user input data to be submitted.
 * @param {Object} config - The configuration object that defines the structure of the form and table.
 * 
 * The `config` object should have the following structure:
 * @param {string} config.parent - A CSS selector for the HTML element where the table is rendered.
 * @param {Array} config.columns - An array of objects, each defining a column in the table and corresponding form inputs.
 * @param {string} config.apiUrl - The URL of the API endpoint where the form data will be sent.
 * 
 * The function performs the following tasks:
 * 1. Collects data from the form using the `FormData` API.
 * 2. Initializes an empty object `dataForSend` to store the formatted data for submission.
 * 3. Iterates over the form data:
 *    - Checks for empty fields; if any are found, highlights them with a red border and prevents submission.
 *    - If the field is filled, removes the red border and adds the value to `dataForSend`.
 *    - Converts numeric inputs to floats before storing them in `dataForSend`.
 * 4. If any required fields are empty, the function logs a message to the console and stops the submission process.
 * 5. Sends the collected data to the specified API endpoint using a POST request via the `sendRequest` function.
 * 6. Clears the form fields by calling the `clearForm` function.
 * 7. Hides the modal dialog by setting `modalOverlay.style.display` to 'none'.
 * 8. Calls the `DataTable` function to refresh the table with the updated data.
 * 
 * @returns {void}
 */
async function handleSubmitAddItem(modalOverlay, form, config) {
  const formData = new FormData(form);
  const dataForSend = {};

  let hasEmptyFields = false; 

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

  await sendRequest(config.apiUrl, "POST", dataForSend);

  clearForm(form);

  modalOverlay.style.display = 'none'
  DataTable(config)
}

/**
 * clearForm is a function that resets all input fields within a given form to their default values.
 * 
 * @param {HTMLFormElement} form - The form element containing the input fields to be cleared.
 * 
 * The function performs the following tasks:
 * 1. Selects all input, select, and textarea elements within the form.
 * 2. Iterates over each element:
 *    - If the element is of type 'color', it resets its value to `#000000`.
 *    - For all other input types, as well as select and textarea elements, it clears the value by setting it to an 
 *      empty string.
 * 
 * This function is useful for resetting the form after submission or when the user cancels their input.
 */
function clearForm(form){
  form.querySelectorAll('input, select, textarea').forEach(input => {
    if (input.type === 'color') {
      input.value = '#000000'; 
    } else {
      input.value = ''; 
    }
  });
}

/**
 * sendRequest is an asynchronous function that sends an HTTP request to a specified URL using the Fetch API.
 * It supports various HTTP methods, including GET, POST, PUT, and DELETE, with the option to include a request body for 
 * methods like POST and PUT.
 * 
 * @param {string} url - The URL to which the request is sent.
 * @param {string} method - The HTTP method to use for the request (e.g., 'GET', 'POST', 'PUT', 'DELETE').
 * @param {Object} [body] - An optional object containing the data to be sent in the body of the request (used with POST 
 *                        and PUT).
 * 
 * @returns {Object|undefined} - The function returns the parsed JSON response from the server if the request is successful.
 *                               If the request fails, it logs an error message to the console and returns `undefined`.
 * 
 * The function performs the following tasks:
 * 1. Constructs a fetch request based on whether a `body` is provided:
 *    - If `body` is provided, the request is sent with JSON-encoded data in the body.
 *    - If no `body` is provided, the request is sent without a body (typically used with GET, DELETE).
 * 2. Awaits the server's response and checks if it is successful (status code 200-299):
 *    - If successful, the response is parsed as JSON and returned.
 *    - If unsuccessful, an error message with the response status text is logged to the console.
 * 3. Catches and logs any errors that occur during the request, such as network issues.
 */
async function sendRequest(url, method, body){
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
      let data = await response.json(); 
      return data;
    } else {
      console.error('Помилка при обробці запиту:', response.statusText);
    }
  } catch (error) {
    console.error('Помилка при відправці запиту:', error);
  }
}

/**
 * deleteItem is an asynchronous function that handles the deletion of a specific item identified by its ID.
 * It sends a DELETE request to the specified API endpoint to remove the item and then refreshes the data table.
 * 
 * @param {string} itemId - The unique identifier of the item to be deleted.
 * @param {Object} config - The configuration object that defines how the data table is structured and where to fetch 
 *                          the data.
 * 
 * The `config` object should have the following structure:
 * @param {string} config.parent - A CSS selector for the HTML element where the table is rendered.
 * @param {Array} config.columns - An array of objects, each defining a column in the table.
 * @param {string} config.apiUrl - The base URL of the API endpoint used for fetching and manipulating data.
 * 
 * The function performs the following tasks:
 * 1. Constructs the full URL for the DELETE request by appending the `itemId` to the `config.apiUrl`.
 * 2. Calls the `sendRequest` function with the DELETE method to remove the item from the server.
 * 3. Checks if the DELETE request was successful:
 *    - If the request fails (i.e., `deleteResponse` is `undefined` or falsey), it exits the function early.
 *    - If the request succeeds, it proceeds to refresh the data table.
 * 4. Calls the `DataTable` function to update the table with the latest data from the API.
 */
async function deleteItem(itemId, config){
  let deleteResponse = await sendRequest(`${config.apiUrl}/${itemId}`, 'DELETE');
  if(!deleteResponse) return;
  await DataTable(config)
}

/**
 * Converts a table row into editable form elements for updating the item details.
 * 
 * @param {HTMLElement} row - The HTML table row element (`<tr>`) that contains the item to be edited.
 * @param {string} itemId - The unique identifier for the item being edited.
 * @param {Object} config - Configuration object that defines the structure of the table and the form fields.
 * 
 * This function replaces the content of each cell in the specified row with appropriate input elements for editing.
 * It handles different types of inputs, including text, number, color, and date, based on the column configuration.
 * If the column has multiple inputs (e.g., for selecting options), it splits the current cell value and creates multiple 
 * input elements accordingly.
 * 
 * After replacing the cell contents with inputs, it calls `addEditBtns` to add "Save" and "Close" buttons to the last cell of the row.
 */
function editItem(row, itemId, config){
  let cells = row.querySelectorAll('td');
  for(let i = 0; i < config.columns.length; i++){
    let currentCell = cells[i+1];
    let currentCellValue = currentCell.innerHTML;
    currentCell.innerHTML = '';

    let input = config.columns[i].input;
    if(!Array.isArray(input)){
      let inputElem = input.type === 'select' ? addSelectWithoutLabel(input, config.columns[i].value, currentCellValue) 
                      : addInputWithoutLabel(input, config.columns[i].value);
      if(input.type === 'color'){currentCellValue = currentCellValue.match(/#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g)};
      if(input.type === 'date'){currentCellValue = getBirthday(currentCellValue)};
      if(input.type === 'url'){currentCellValue = extractUrlFromHtml(currentCellValue)};
      inputElem.value = currentCellValue;
      currentCell.appendChild(inputElem);
      continue;
    }
    currentCellValue = currentCellValue.split(' ');
    for(let j = 0; j < input.length; j++){
      let inputElem = input[j].type === 'select' ? addSelectWithoutLabel(input[j], config.columns[i].value, currentCellValue[j]) 
                      : addInputWithoutLabel(input[j], config.columns[i].value);
      if(input.type === 'color'){currentCellValue[j] = currentCellValue[j].match(/#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g)};
      if(input.type === 'date'){currentCellValue = getBirthday(currentCellValue)};
      if(input.type === 'url'){currentCellValue = extractUrlFromHtml(currentCellValue)};
      inputElem.value = currentCellValue[j];
      currentCell.appendChild(inputElem)
    }
  }

  addEditBtns(cells[cells.length-1], row, itemId, config);
}

/**
 * Extracts the first URL found in an HTML string.
 *
 * This function searches the provided HTML string for the first occurrence of 
 * an `href` or `src` attribute and extracts its URL value.
 *
 * @param {string} htmlString - The HTML string to search for a URL.
 * @returns {string|null} - The extracted URL as a string, or null if no URL is found.
 */
function extractUrlFromHtml(htmlString) {
  const urlMatch = htmlString.match(/(?:href|src)="([^"]*)"/);
  return urlMatch ? urlMatch[1] : null;
}

/**
 * Adds "Save" and "Close" buttons to the specified cell for editing functionality.
 * 
 * @param {HTMLElement} cell - The HTML table cell element (`<td>`) where the buttons will be added.
 * @param {HTMLElement} row - The HTML table row element (`<tr>`) that contains the cell.
 * @param {string} rowId - The unique identifier for the row being edited.
 * @param {Object} config - Configuration object that defines the structure of the table and the form fields.
 *                           - Used to refresh the data table after editing.
 * 
 * This function hides the existing "Delete" and "Edit" buttons in the specified cell and adds new "Save" and "Close" buttons.
 * The "Save" button triggers the `handleSubmitEditItem` function to submit the updated item data.
 * The "Close" button triggers a refresh of the data table by calling `DataTable`.
 */
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

/**
 * Creates an input or textarea element without a label.
 * 
 * @param {Object} property - An object defining the attributes of the input element.
 *                             Required property: `type` (e.g., 'text', 'number', 'textarea').
 *                             Optional properties: `name`, `required`, etc.
 * @param {string} columnValue - The value associated with the column. Used as the `name` attribute of the input if not 
 * provided in `property`.
 * 
 * @returns {HTMLElement} - An input or textarea element.
 * 
 * This function generates an input or textarea element based on the `property` object. If `name` or `required` is not 
 * provided in `property`,
 * they are set based on `columnValue` and default to `true`, respectively.
 */
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
  if(!property.hasOwnProperty("name")){inputElement.setAttribute("name", columnValue);}
  if(!property.hasOwnProperty("required")){inputElement.setAttribute("required", true);}
  return inputElement;
}

/**
 * Creates a select element with options but without a label.
 * 
 * @param {Object} property - An object defining the attributes of the select element.
 *                             Required properties: `type` (should be 'select'), `options` (an array of option values).
 *                             Optional properties: `name`, etc.
 * @param {string} columnValue - The value associated with the column. Used as the `name` attribute of the select if not 
 *                               provided in `property`.
 * @param {string} selectedOptions - The value of the option that should be selected by default.
 * 
 * @returns {HTMLElement} - A `select` element with options.
 * 
 * This function generates a `select` element based on the `property` object. It sets attributes and options, with the 
 * ability to set a default selected option. The `select` element is enhanced with event listeners to adjust its size 
 * on focus and blur.
 */
function addSelectWithoutLabel(property,columnValue, selectedOptions){
  let selectElement = createElement('select', '');
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
    if (property.options[i] === selectedOptions) {
      option.setAttribute('selected', 'selected');
    }

    selectElement.appendChild(option);
  }

  selectElement.addEventListener('focus', function() {
    this.size = 3;
  });

  selectElement.addEventListener('blur', function() {
    this.size = 1;
  });
  selectElement.addEventListener('change', function() {
    this.size = 1; 
    this.blur()
  });

  return selectElement;
}

/**
 * Handles the submission of an edited item in the table.
 * 
 * This function collects data from all input elements within a specified table row, validates the input values, 
 * and sends an HTTP PUT request to update the item on the server. It then refreshes the data table to reflect 
 * the updated item details.
 * 
 * @param {HTMLElement} row - The HTML table row element (`<tr>`) containing the editable form fields. 
 *                             Each cell in this row should have been replaced with input elements for editing.
 * @param {string} itemId - The unique identifier for the item being edited. This ID is used to target the specific 
 *                          item on the server for updating.
 * @param {Object} config - Configuration object that defines the structure of the table and the form fields.
 *                           - `config.apiUrl`: The base URL for the API where the PUT request will be sent.
 * 
 * This function performs the following steps:
 * 1. Collects all input, select, and textarea elements from the specified row.
 * 2. Iterates over these elements to validate their values. If any field is empty, it highlights the border in red 
 *    and sets a flag to indicate that there are empty fields.
 * 3. If any fields are empty, it logs a message to the console and aborts the submission process.
 * 4. If all fields are filled, it prepares the data for sending by converting the values of number inputs to floats 
 *    and storing other values as strings.
 * 5. Sends an HTTP PUT request to the API to update the item using the specified `itemId` and `dataForSend`.
 * 6. Refreshes the data table to reflect the updated item by calling `DataTable(config)`.
 */
async function handleSubmitEditItem(row, itemId, config) {
  let inputs = row.querySelectorAll('input');
  let selects = row.querySelectorAll('select');
  let texareas = row.querySelectorAll('textarea');
  let allInputs = [...inputs, ...selects, ...texareas];
  const dataForSend = {};

  let hasEmptyFields = false; 

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
    console.log('Please fill in all required fields.');
    return; 
  }

  await sendRequest(`${config.apiUrl}/${itemId}`, "PUT", dataForSend);

  DataTable(config)
}

/**
 * Calculates the age in years, months, and days based on the given birth date.
 * 
 * This function takes a birth date in ISO 8601 format and computes the age by comparing the birth date 
 * with the current date. The result is returned as a string in the format "X year Y month Z day".
 * 
 * @param {string} birthDateString - The birth date in ISO 8601 format (e.g., "2024-04-11T12:11:19.050Z").
 * @returns {string} - A string representing the age in years, months, and days (e.g., "0 year 11 month 10 day").
 */
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

/**
 * Calculates the birth date from the given age in years, months, and days.
 * 
 * This function takes a string representing the age in years, months, and days (e.g., "0 year 11 month 10 day") 
 * and calculates the birth date based on that information. It returns the birth date in ISO 8601 format.
 * 
 * @param {string} diffDate - A string representing the age in years, months, and days (e.g., "0 year 11 month 10 day").
 * @returns {string} - The calculated birth date in ISO 8601 format (e.g., "2024-04-11").
 */
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

/**
 * Generates an HTML string to display a colored square based on the given color.
 * 
 * This function creates an HTML `div` element styled to display a square with the specified background color. 
 * The size of the square is fixed at 100x100 pixels.
 * 
 * @param {string} color - The color code in HEX format (e.g., "#521222").
 * @returns {string} - An HTML string representing a square with the given background color (e.g., `<div style="width:100px; height:100px; background-color:#521222;"></div>`).
 */
function getColorLabel(color){
  let square = `<div style="width:100px; height:100px; background-color:${color};"></div>`;
  return square;
}


const config1 = {
 parent: '#usersTable',
 columns: [
  {
    title: 'Ім’я', 
    value: 'name',
    input: { type: 'text' }
  },
  {
    title: 'Прізвище', 
    value: 'surname', 
    input: { type: 'text' }
  },
  {
    title: 'Вік', 
    value: (user) => getAge(user.birthday),
    input: { type: 'date', name: "birthday"}
  }, 
  {
    title: 'Фото', 
    value: (user) => `<img src="${user.avatar}" alt="${user.name} ${user.surname}"/>`,
    input: { type: 'url', name: "avatar"}
  } 
 ],
 apiUrl: "https://mock-api.shpp.me/tchorna/users"
};

DataTable(config1);


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
        { type: 'select', name: 'currency', label: 'Валюта', options: ['$', '€', '₴', '£', 'Rp', 'kn', '₨', 'CHF', 
              'kr', 'R$', 'K', 'руб', 'Gs', '﷼', 'Ft', '฿', 'P', 'Db', '₹', 'Rbl', 'Ls', '₩', '₭', '₡', '₺', 'ден', 'C$', 'Q', '₪', 'лв'], required: false }
      ]
    },
    {
      title: 'Колір', 
      value: (product) => getColorLabel(product.color), 
      input: { type: 'color', name: 'color' }
    }, 
  ],
  apiUrl: "https://mock-api.shpp.me/tchorna/products"
};

DataTable(config2);
