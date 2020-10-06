import {
  select,
  templates
} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

export class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidget();
  }
  render(element) {
    const thisBooking = this;

    const bookingHTML = templates.bookingWidget(thisBooking);
    // console.log(bookingHtml);
    const bookingDOM = utils.createDOMFromHTML(bookingHTML);

    const elemBooking = document.querySelector(select.containerOf.booking);

    elemBooking.appendChild(bookingDOM);
    // console.log(bookingDOM);
    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    // console.log(thisBooking.dom.peopleAmount);

    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    // console.log(thisBooking.dom.hoursAmount);

    thisBooking.dom.wrapper.innerHtml = elemBooking;
  }
  initWidget() {
    const thisBooking = this;
    const widgetPeople = new AmountWidget(thisBooking.dom.peopleAmount);
    console.log(widgetPeople);
    const widgethoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    console.log(widgethoursAmount);
  }
}
export default Booking;
