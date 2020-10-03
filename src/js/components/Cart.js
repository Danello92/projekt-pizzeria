import {select, settings, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {CartProduct} from './CartProduct.js';

export class Cart {
  constructor(element) {
    const thisCart = this;
    thisCart.products = [];
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.getElements(element);
    thisCart.initAction();
    // console.log('new cart', thisCart);
  }

  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.address = 'wrocław';
    thisCart.phone = '123456789';
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    for (let key of thisCart.renderTotalsKeys) {
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
  } 
  initAction() {
    const thisCart = this;
    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault(); 
      thisCart.sendOrder();
    });
    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });
    thisCart.dom.wrapper.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });
  }
  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;
    const payload = {
      address: thisCart.address,
      phone: thisCart.phone,
      totalNumber: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: settings.cart.defaultDeliveryFee,
      totalPrice: thisCart.totalPrice,
      products: [],
    };
    for (let products of thisCart.products) {
      payload.products.push(products.getData());
    }
    // console.log(url);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
      // console.log(options);
    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (prasedResponse) {
        console.log('sendoreder', prasedResponse);
      });
  }
  add(menuProduct) {
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    // console.log(generatedHTML);
    const generateDOM = utils.createDOMFromHTML(generatedHTML);
    // console.log(generateDOM);
    const elemCart = document.querySelector(select.cart.productList);

    elemCart.appendChild(generateDOM);
    console.log('menuProduct',menuProduct);
    thisCart.products.push(new CartProduct(menuProduct, generateDOM));
    console.log('thisCart.Products', menuProduct);
    
  }
  update() {
    const thisCart = this;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    console.log(thisCart.products);
    for (let cartPrice of thisCart.products) {
      thisCart.totalNumber += cartPrice.amount;
      thisCart.subtotalPrice += cartPrice.price;
    }
    thisCart.totalPrice = thisCart.deliveryFee + thisCart.subtotalPrice;
    //console.log(this.totalNumber,this.totalPrice,this.subtotalPrice);
    for (let key of thisCart.renderTotalsKeys) {
      for (let elem of thisCart.dom[key]) {
        elem.innerHTML = thisCart[key];
      }
    }
  }
  remove(cartProduct) {
    const thisCart = this;
    const index = thisCart.products.indexOf(cartProduct);
    // console.log('index', index);
    const elem = thisCart.products.slice(index);
    console.log('elem', elem);
    cartProduct.dom.wrapper.remove();
    // console.log('cart remove', cartProduct.dom.wrapper);
    thisCart.update();
  }
}

export default Cart;