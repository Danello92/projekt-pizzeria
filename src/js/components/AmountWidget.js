import {settings, select} from '../settings.js';

export class AmountWidget {
  constructor(element) {
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initAction();
    // console.log('amount widget', thisWidget);
    // console.log('arg element', element); 
  }
  getElements(element) {
    const thisWidget = this;
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }
  setValue(value) {
    const thisWidget = this;
    const newValue = parseInt(value);
    // console.log(newValue);
    //ADD :validation
    if ( newValue != thisWidget.value && newValue <= settings.amountWidget.defaultMax && newValue >= settings.amountWidget.defaultMin) {
      thisWidget.value = newValue;
      thisWidget.annoumce();
    }
    thisWidget.input.value = thisWidget.value;
  }
  initAction() {
    const thisWidget = this;
    thisWidget.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.input.value);
    });
    thisWidget.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue((thisWidget.value) - 1);
    });
    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue((thisWidget.value) + 1);
    });
  }
  annoumce() {
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
    // console.log('thiswidget', thisWidget);
  }
}

export default AmountWidget;