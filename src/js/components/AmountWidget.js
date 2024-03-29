import {
  settings,
  select
} from '../settings.js';
import BaseWidget from './BaseWidget.js';

export class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;
    thisWidget.getElements(element);
    // thisWidget.value = settings.amountWidget.defaultValue;
    // thisWidget.setValue(thisWidget.dom.input.value);
    thisWidget.initAction();
    // console.log('amount widget', thisWidget);
    // console.log('arg element', element); 
  }
  getElements() {
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value) {
    return !isNaN(value)

    && value <= settings.amountWidget.defaultMax
    && value >= settings.amountWidget.defaultMin;
  }

  renderValue(){
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }

  initAction() {
    const thisWidget = this;
    thisWidget.value = thisWidget.dom.input.value;

    thisWidget.dom.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.dom.input.value);
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue((thisWidget.value) - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue((thisWidget.value) + 1);
    });
  }
 
}

export default AmountWidget;
