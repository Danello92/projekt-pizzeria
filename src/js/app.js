import {select, settings} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
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
    console.log(thisApp.product);
    thisApp.productList.addEventListnser('add-to-cart', function(event){
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
        console.log('prasedResponse', prasedResponse);
        //save prasedResponse as thisApp.data.products
        thisApp.data.products = prasedResponse;
        //execute init.Menu metod
        thisApp.initMenu();
      });
    console.log('thisApp.data:', JSON.stringify(thisApp.data));
  },

  init: function () {
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);
    thisApp.initData();
    // thisApp.initMenu();
  },
};
app.initCart();
app.init();
