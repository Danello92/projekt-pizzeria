import BaseWidget from './BaseWidget.js';
import utils from '../utils.js';
import {
  select,
  settings
} from '../settings.js';

import flatpickr from 'flatpickr';


export class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));
    const thisWidget = this;
    thisWidget.dom.input = wrapper.querySelector(select.widgets.datePicker.input);
    console.log('thisWidget input',thisWidget.dom.input);
    thisWidget.initPlugin();
  }
  initPlugin() {
    
    const thisWidget = this;
    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);
    
    //flatpickr
    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,

      disable: [
        function (date) {
          // return true to disable
          return (date.getDay() === 1);

        }
      ],
      locale: {
      
        firstDayOfWeek: 1 // start week on Monday
      },
      onChange: function(selectedDates,dateStr){
        thisWidget.value = dateStr;
      }

    });
  }

  parseValue() {
    const thisWidget = this;
    return thisWidget.value;
  }

  isValid() {
    return true;
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value;}

}
export default DatePicker;
