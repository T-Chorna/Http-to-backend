# Dynamic Table Project

##Project Overview
This project is a simple web application that dynamically generates an HTML table based on a given configuration object. The table allows users to view, add, edit, and delete rows of data. The data is fetched from an API, and the structure of the table (including columns and input types) is defined in the configuration object.

## Project Structure
The project consists of the following files:

* index.html: The main HTML file that contains the structure of the webpage and the element where the dynamic table will be rendered.
* main.js: The JavaScript file that contains the logic for dynamically creating the table, handling user interactions (like adding, editing, and deleting rows), and communicating with the API.
* style.css: The CSS file that defines the styling for the webpage, including the table and form elements.
* README.md: This README file provides an overview of the project, its structure, and usage instructions.

## How to Use the Project
1. Clone the Repository:
```
git clone https://github.com/<your-username>/dynamic-table-project.git
cd dynamic-table-project
```
2. Open the Project:
Open the index.html file in your web browser. This file is the main entry point of the application.
3. Configuration:
The table is generated based on a configuration object in main.js. The configuration defines:
* Parent: The CSS selector of the HTML element where the table will be inserted.
* Columns: An array of column definitions, including the title, value, and input properties.
* API URL: The URL where the table data is fetched from.
Example configuration:
```
const config = {
  parent: '#productsTable',
  columns: [
    {
      title: 'Name',
      value: 'title',
      input: { type: 'text' }
    },
    {
      title: 'Price',
      value: (product) => `${product.price} ${product.currency}`,
      input: [
        { type: 'number', name: 'price', label: 'Price' },
        { type: 'select', name: 'currency', label: 'Currency', options: ['$', '€', '₴'], required: false }
      ]
    },
    {
      title: 'Color',
      value: (product) => getColorLabel(product.color),
      input: { type: 'color', name: 'color' }
    }
  ],
  apiUrl: "https://mock-api.shpp.me/<nsurname>/products"
};

```

4. Interactions:

* View Data: The table automatically fetches data from the API and displays it.
* Add New Row: Click the Add button and fill out the form to add a new row to the table.
* Edit Row: Click on the edit button to modify an existing row.
* Delete Row: Click on the delete button to remove a row from the table.

5. Styling:

The table and form are styled using style.css. You can customize the look and feel by modifying this file.

6. Deployment:

You can deploy this project using GitHub Pages. To do so, push the repository to GitHub and enable GitHub Pages in the repository settings.
Example URL: https://<your-username>.github.io/dynamic-table-project/

## Live Demo
A live demo of the project can be viewed here.

## Author

- **Tatyana Chorna** - [GitHub](https://github.com/T-Chorna)
