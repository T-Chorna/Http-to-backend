export const config1 = {
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

export const config2 = {
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
let square = `<div style="width:100px; height:100px; background-color:${color};"></div>`;
return square;
}