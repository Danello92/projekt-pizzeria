import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

export class Product {
  constructor(id, data) {
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
  getElements() {
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
  renderInMenu() {
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
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
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
  initOrderForm() {
    const thisProduct = this;
    // console.log('initOrderFrom', thisProduct);
    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });
    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }
    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
    
  }
  initAmountWigdet() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      // thisProduct.amountWidgetElem.addEventListener('updated', thisProduct.processOrder());
      thisProduct.processOrder();
    });
  }
  processOrder() {
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
        const imageSel = thisProduct.innerWapper.querySelectorAll('.' + paramId + '-' + optionId);
        // console.log(imageSel);
        if (optionSelected) {
          if (!thisProduct.params[paramId]) {
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;
          for (let img of imageSel) {
            img.classList.add(classNames.menuProduct.imageVisible);
            // console.log(img);
          }
        } else {
          for (let img of imageSel) {
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
  addToCart() {
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    // app.cart.add(thisProduct);
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct
      }
      
    });
    thisProduct.element.dispatchEvent(event);
  }
}
export default Product;
