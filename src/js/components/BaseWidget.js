export class BaseWidget {
  constructor(wrapperElement, initialValue){
    const thisWidget =  this;
    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }

  get value(){
    const thisWidget = this;
    return thisWidget.correctValue;
  }


  set value(value) {
    const thisWidget = this;
    const newValue = thisWidget.parseValue(value);
    // console.log(newValue);
    //ADD :validation
    if (newValue != thisWidget.correctValue && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;
      thisWidget.annoumce();
    }
    thisWidget.renderValue();
  }
  setValue(value){
    const thisWidget =this;

    thisWidget.value = value;
  }
  parseValue(value) {
    return parseInt(value);
  }

  isValid(value) {
    return !isNaN(value);
  }

  renderValue(){
    const thisWidget = this;
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;

  }
  annoumce() {
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
    // console.log('thiswidget', thisWidget);
  }

}
export default BaseWidget;