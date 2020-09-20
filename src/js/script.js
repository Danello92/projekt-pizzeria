/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  // const settings = {
  //   amountWidget: {
  //     defaultValue: 1,
  //     defaultMin: 1,
  //     defaultMax: 9,
  //   }
  // };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor ( id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initOrderForm();
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
    }
  
    renderInMenu(){
      const thisProduct = this;
  
      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
  
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
      });
    }
    processOrder(){
      const thisProduct = this;
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);
      // console.log(formData);
      /* set variable price to equal thisProduct.data.price */
      let basicPrice = thisProduct.data.price;
      // console.log(basicPrice);
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
            basicPrice += option.price;
            // console.log('price', basicPrice);
            /* END IF: if option is selected and option is not default */
          }	  
          /* START ELSE IF: if option is not selected and option is default */
          else if (option.default && !optionSelected) {
            /* deduct price of option from price */
            // console.log('!optionSelected', !optionSelected);
            // console.log('option.default', option.default);
            basicPrice -= option.price;
            // console.log('price', basicPrice);
          }
          
          const imageSel = thisProduct.innerWapper.querySelectorAll('.'+ paramId +'-'+ optionId);
          // console.log(imageSel);
          if (optionSelected){
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
      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = basicPrice;
    
    }
  }
  
  const app = {

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

  app.init();
}