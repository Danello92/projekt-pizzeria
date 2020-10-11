import BaseWidget from './BaseWidget.js';
import settings from '../settings.js';
import utils from '../utils.js';

export class HourPicker extends BaseWidget {
  constructor(element) {
    super(element, settings.hours.open);
    const thisWidget = this;
    thisWidget.dom.input;
    thisWidget.dom.output;
    thisWidget.initPlugin();
  }
  initPlugin() {
    // const thisWidget= this;

  }
  parseValue(value) {
    return utils.numberToHour(value);
  }


}
export default HourPicker;
