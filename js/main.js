'use strict';

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const logInForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const restaurantTitle = document.querySelector('.restaurant-title');
const rating = document.querySelector('.rating');
const minPrice = document.querySelector('.price');
const category = document.querySelector('.category');
const inputSearch = document.querySelector('.input-search');

let login = localStorage.getItem('deliveryFood');

const getData = async function(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response.status}!`);
  }

  return await (await response).json();
};


const valid = function(str) {
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return nameReg.test(str);
};

const toggleModal = function() {
  modal.classList.toggle("is-open");
}

//Авторизация
function toggleModalAuth() {
  loginInput.style.borderColor = '';  //очищаем бордер в поле ввода
  modalAuth.classList.toggle('is-open');
}

function authorized() {

  function logOut() {
    login = null;
    localStorage.removeItem('deliveryFood');
    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    buttonOut.removeEventListener('click', logOut);
    checkAuth();
    returnMain();
  }

  userName.textContent = login;

  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'block';

  buttonOut.addEventListener('click', logOut);
}

function notAuthorized() {
  // console.log('Не авторизован');

  function logIn(event) {
    event.preventDefault();

    if (valid(loginInput.value)) {
      login = loginInput.value;
      localStorage.setItem('deliveryFood', login);
      toggleModalAuth();
      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);
      logInForm.removeEventListener('submit', logIn);
      logInForm.reset();
      checkAuth();
    } else {
      loginInput.style.borderColor = 'red';
      // loginInput.value = '';
    }
  }

  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
}

function checkAuth () {
  if (login) {
    authorized();
  } else {
    notAuthorized();
  }
}

//карточки

function createCardsRestaurants({ image, kitchen, name, price, stars, products, 
  time_of_delivery: timeOfDelivery }) {

  const card = `
    <a class="card card-restaurant" 
      data-products="${products}"
      data-info="${[ name, price, stars, kitchen ]}"
      >
      <img src="${image}" alt="${name}" class="card-image"/>
      <div class="card-text">
        <div class="card-heading">
          <h3 class="card-title">${name}</h3>
          <span class="card-tag tag">${timeOfDelivery}</span>
        </div>

        <div class="card-info">
          <div class="rating">${stars}</div>
          <div class="price">От ${price}₽</div>
          <div class="category">${kitchen}</div>
        </div>
      </div>
    </a>
`;

cardsRestaurants.insertAdjacentHTML('beforeend', card);

}

function createCardGood({ description, id, image, name, price }) {

  const card = document.createElement('div');
  card.className = 'card';

  card.insertAdjacentHTML('beforeend', `
  
      <img src="${image}" alt="${name}" class="card-image"/>
      <div class="card-text">
        <div class="card-heading">
          <h3 class="card-title card-title-reg">${name}</h3>
        </div>

        <div class="card-info">
          <div class="ingredients">${description}</div>
        </div>

        <div class="card-buttons">
          <button class="button button-primary button-add-cart">
            <span class="button-card-text">В корзину</span>
            <span class="button-cart-svg"></span>
          </button>
          <strong class="card-price-bold">${price} ₽</strong>
        </div>
      </div>

  `);

  cardsMenu.insertAdjacentElement('beforeend', card);
}

//Открывает меню ресторана
function openGoods(event) {
  const target = event.target;
  if(login) {

    const restaurant = target.closest('.card-restaurant');
    if (restaurant) {

      const info = restaurant.dataset.info.split(',');
      const [ name, price, stars, kitchen ] = info;

      cardsMenu.textContent = '';
      containerPromo.classList.add('hide');
      restaurants.classList.add('hide');
      menu.classList.remove('hide');

      restaurantTitle.textContent = name;
      rating.textContent = stars;
      minPrice.textContent = `От  ${price} ₽`;
      category.textContent = kitchen;


      getData(`./db/${restaurant.dataset.products}`).then(function(data){
        data.forEach(createCardGood);
      });
    }
  } else {
    toggleModalAuth();
  }
}

function init() {
  getData('./db/partners.json').then(function(data){
    data.forEach(createCardsRestaurants);
  });
  
  cartButton.addEventListener("click", toggleModal);
  
  close.addEventListener("click", toggleModal);
  
  cardsRestaurants.addEventListener('click', openGoods);

  // logo.addEventListener('click', returnMain);
  logo.addEventListener('click', function(){
    containerPromo.classList.remove('hide');
    restaurants.classList.remove('hide');
    menu.classList.add('hide');
  });
  
  inputSearch.addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
      const target = event.target;
      const value = target.value.toLowerCase();
      target.value = '';
      const goods = [];

      getData('./db/partners.json').then(function(data) {
        const products = data.map(function(item){
          return item.products;
        });

        products.forEach(function(products){
          getData(`./db/${products}`).then(function(data){
            goods.push(...data);

            const searchGoods = goods.filter(function(item){
              return item.name.toLowerCase().includes(value);
            })

            cardsMenu.textContent = '';

            containerPromo.classList.add('hide');
            restaurants.classList.add('hide');
            menu.classList.remove('hide');

            restaurantTitle.textContent = 'Результат поиска';
            rating.textContent = '';
            minPrice.textContent = '';
            category.textContent = '';

            return searchGoods;
          })

          .then(function(data){
            data.forEach(createCardGood);
          })
        })
      });
    }
  });

  checkAuth();
  
  //свайпер
  
  new Swiper('.swiper-container', {
    loop: true,
    autoplay: {
      delay: 4000,
    },
    
  })
}

init();