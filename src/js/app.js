import {
  classNames,
  select,
  settings
} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';


const app = {
  initBooking: function () {

    const thisApp = this;

    thisApp.containerBooking = document.querySelector(select.containerOf.booking);

    thisApp.booking = new Booking(thisApp.containerBooking);
  },
  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;

    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clikcElement = this;
        event.preventDefault();

        //get page id form attribute href
        const id = clikcElement.getAttribute('href').replace('#', '');


        //run thisApp.activePage with that id
        thisApp.activePage(id);

        //change URL hash
        window.location.hash = '#/' + id;

      });
    }
  },
  initMenu: function () {
    //const testProduct = new Product();
    const thisApp = this;
    // console.log('thisApp.data:', thisApp.data);
    for (let productData in thisApp.data.products) {
      // new Product (productData, thisApp.data.products[productData]);
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
    //console.log ('testProduct:' , testProduct);
  },
  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    // console.log(this);
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },
  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;
    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (prasedResponse) {
        // console.log('prasedResponse', prasedResponse);
        //save prasedResponse as thisApp.data.products
        thisApp.data.products = prasedResponse;
        //execute init.Menu metod
        thisApp.initMenu();
      });
  // console.log('thisApp.data:', JSON.stringify(thisApp.data));
  },
  activePage: function (pagesId) {
    const thisApp = this;

    // add class "active" to matching pages, remove form non-matchning
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pagesId);
    }
    // add class "active" to matching link, remove form non-matchning
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pagesId
      );
    }


  },
  init: function () {
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);
    thisApp.initPages();
    thisApp.initData();
    // thisApp.initMenu();
    thisApp.initCart();
    thisApp.initBooking();
  },
};
// app.initCart();
app.init();
