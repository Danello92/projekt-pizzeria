/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
{
  'use strict';
  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };
  class Product{
    constructor ( id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initOrderForm();
      thisProduct.initAmountWigdet();
      thisProduct.processOrder();
      thisProduct.initAccordion();
      // console.log('new Product:', thisProduct);
      // console.log(settings);
    }
    getElements(){
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      // console.log(thisProduct.accordionTrigger);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      // console.log(thisProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      // console.log(thisProduct.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      // console.log(thisProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      // console.log(thisProduct.priceElem);
      thisProduct.innerWapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      //console.log(thisProduct.innerWapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      //console.log(thisProduct.amountWidgetElem);
    }
    renderInMenu(){
      const thisProduct = this;
      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      // console.log(thisProduct.data);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }
    initAccordion() {
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clicking) */
      /* START: click event listener to trigger */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');
        /* find all active products */
        const aProducts = document.querySelectorAll('.product.' + classNames.menuProduct.wrapperActive);
        /* START LOOP: for each active product */
        for (let active of aProducts) {
          /* START: if the active product isn't the element of thisProduct */
          if (active != thisProduct.element) {
            /* remove class active for the active product */
            active.classList.remove('active');
            /* END: if the active product isn't the element of thisProduct */
          }
          /* END LOOP: for each active product */
        }
        /* END: click event listener to trigger */
      });
    }
    initOrderForm(){
      const thisProduct = this;
      // console.log('initOrderFrom', thisProduct);
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    initAmountWigdet(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        // thisProduct.amountWidgetElem.addEventListener('updated', thisProduct.processOrder());
        thisProduct.processOrder();
      });
    }
    processOrder(){
      const thisProduct = this;
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);
      // console.log(formData);
      /* set variable price to equal thisProduct.data.price */
      thisProduct.params = {};
      let price = thisProduct.data.price;
      // console.log(price);
      const dataParams = thisProduct.data.params;
      /* START LOOP: for each paramId in thisProduct.data.params */
      for (let paramId in dataParams) {
        /* save the element in thisProduct.data.params with key paramId as const param */
        const param = dataParams[paramId];
        // console.log('param', param);
        /* START LOOP: for each optionId in param.options */
        for (let optionId in param.options) {
          // console.log('optionId', optionId);
          /* save the element in param.options with key optionId as const option */
          const option = param.options[optionId];
          // console.log('option', option);
          /* START IF: if option is selected and option is not default */
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          // console.log('optionSelected', optionSelected);
          if (optionSelected && !option.default) {
            /* add price of option to variable price */
            // console.log('!option.default', !option.default);
            price += option.price;
            // console.log('price', price);
            /* END IF: if option is selected and option is not default */
          }	  
          /* START ELSE IF: if option is not selected and option is default */
          else if (option.default && !optionSelected) {
            /* deduct price of option from price */
            // console.log('!optionSelected', !optionSelected);
            // console.log('option.default', option.default);
            price -= option.price;
            // console.log('price', price);
          }
          const imageSel = thisProduct.innerWapper.querySelectorAll('.'+ paramId +'-'+ optionId);
          // console.log(imageSel);
          if (optionSelected){
            if(!thisProduct.params[paramId]){
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label;
            for(let img of imageSel){
              img.classList.add(classNames.menuProduct.imageVisible);
              // console.log(img);
            }
          }
          else{
            for(let img of imageSel)
            {
              img.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        /* END ELSE IF: if option is not selected and option is default */
        }
        /* END LOOP: for each optionId in param.options */
      }
      /* END LOOP: for each paramId in thisProduct.data.params */
      /* multiply price by amount */
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
      // price *= thisProduct.amountWidget.value;
      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = thisProduct.price;
      // thisProduct.priceElem.innerHTML =  price;
      // console.log(thisProduct.params);
    }
    addToCart(){
      const thisProduct = this;
      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value ;
      app.cart.add(thisProduct);
    }
  }
  class AmountWidget {
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initAction();
      // console.log('amount widget', thisWidget);
      // console.log('arg element', element); 
    }
    getElements(element){
      const thisWidget = this;
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);
      // console.log(newValue);
      //ADD :validation
      if(newValue!=false && newValue!=thisWidget.value && newValue<=settings.amountWidget.defaultMax &&  newValue>=settings.amountWidget.defaultMin){
        thisWidget.value = newValue;
        thisWidget.annoumce();
      } 
      thisWidget.input.value = thisWidget.value;
    }
    initAction(){
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue((thisWidget.value)-1);
      });
      thisWidget.linkIncrease.addEventListener('click',function(){
        thisWidget.setValue((thisWidget.value)+1);
      });
    }
    annoumce(){
      const thisWidget = this;
      const event = new CustomEvent('updated',{
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }
  class Cart {
    constructor(element){
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initAction();
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      // console.log('new cart', thisCart);
    }
    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
      for(let key of thisCart.renderTotalsKeys){
        thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      }
    }
    initAction(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(){
        thisCart.remove(event.detail.cartProduct);
      });
    }
    add(menuProduct){
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      // console.log(generatedHTML);
      const generateDOM  = utils.createDOMFromHTML(generatedHTML);
      // console.log(generateDOM);
      const elemCart = document.querySelector(select.cart.productList);
      elemCart.appendChild(generateDOM);
      // console.log('menuProduct',menuProduct);
      thisCart.products.push(new CartProduct(menuProduct, generateDOM));
      // console.log('thisCart.Products', thisCart.products);
      thisCart.update();
    }
    update(){
      const thisCart = this;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      for (let cartPrice of thisCart.products){
        thisCart.totalNumber += cartPrice.amount;
        thisCart.subtotalPrice += cartPrice.price;
      }
      thisCart.totalPrice= thisCart.deliveryFee + thisCart.subtotalPrice;
      // console.log(this.totalNumber,this.totalPrice,this.subtotalPrice);
      for(let key of thisCart.renderTotalsKeys){
        for(let elem of thisCart.dom[key]){
          elem.innerHTML = thisCart[key];
        }
      }
    }
    remove(cartProduct){
      const thisCart = this;
      const index = thisCart.products.indexOf(cartProduct);
      thisCart.products.slice(index);
      cartProduct.dom.wrapper.remove();
      // index.pop(cartProduct.dom.wrapper);
      thisCart.update();
    }
  }
  class CartProduct{
    constructor(menuProduct,element){
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWigdet();
      thisCartProduct.initAction();
      // console.log('cart produkt', thisCartProduct);
      // console.log('menuProduct',menuProduct);
      // console.log(thisCartProduct.dom.price);
    }
    getElements(element){
      const thisCartProduct = this;
      thisCartProduct.dom ={};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }
    initAmountWigdet(){
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }
    initAction(){
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', function(){
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function(){
        event.preventDefault();
        thisCartProduct.remove();
      });
    }
    remove(){
      const thisCartProduct = this;
      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
      console.log('remove', thisCartProduct);
    }
  }
  const app = {
    cart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart =new Cart(cartElem);
      // console.log(this);
    },
    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
      // console.log('thisApp.data:', thisApp.data);
      for(let productData in thisApp.data.products){
        new Product (productData, thisApp.data.products[productData]);
      }
    },
    initMenu: function(){
      //const testProduct = new Product();
      //console.log ('testProduct:' , testProduct);
    },
    init: function(){
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  };
  app.cart();
  app.init();
}