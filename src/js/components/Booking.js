import {
  classNames,
  select,
  settings,
  templates
} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
export class Booking {
  constructor(wrapper) {
    const thisBooking = this;
    thisBooking.render(wrapper);
    thisBooking.initWidget();
    thisBooking.getData();
    thisBooking.selectTable();
    thisBooking.orderTable();
  }

  getData() {

    const thisBooking = this;
    // console.log(thisBooking);
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);

    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {

      booking: [
        startDateParam,
        endDateParam
      ],

      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam
      ],

      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam
      ],

    };

    // console.log('wyświetlanie funkcji getData tablicy params', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking +
                                       '?' + params.booking.join('&'),

      eventsCurrent: settings.db.url + '/' + settings.db.event +
                                       '?' + params.eventsCurrent.join('&'),

      eventsRepeat: settings.db.url + '/' + settings.db.event +
                                      '?' + params.eventsRepeat.join('&'),

    };
    // console.log('wyświetlanie funkcji getData tablicy urls', urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
      
  }
  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};
    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    // console.log('thisbooking makebooke', thisBooking.booked);
    thisBooking.updateDOM();
  }
  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);
    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      // console.log('loop', hourBlock);
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }
  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    console.log(thisBooking);
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    console.log('hour', thisBooking.hour);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined' 
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }
    for(let table of thisBooking.dom.tables){
      console.log(settings.booking.tableIdAttribute);
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      }else{
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

  }
  selectTable(){
    const thisBooking = this;

    for(let table of thisBooking.dom.tables)
    {
      table.addEventListener('click',function(){
        table.classList.add(classNames.booking.tableBooked);
        thisBooking.selectedTable = table.getAttribute(settings.booking.tableIdAttribute);

        console.log('selectedTable:', thisBooking.selectedTable);
      });
    }
    // thisBooking.getData();
  }
  orderTable() {
    const thisBooking = this;

    thisBooking.dom.form.addEventListener('submit', function(event) {
      event.preventDefault(event);
      
      thisBooking.sentReservation();
    });
  }
  removeSelected() {
    const thisBooking = this;

    const selectedTables = document.querySelectorAll('.selected');
    for(let selected of selectedTables){
      selected.classList.remove(classNames.booking.tableBooked);
    }
    thisBooking.bookedTable;
  }
  sentReservation() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const order = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: parseInt(thisBooking.tableId),
      peopleAmount: thisBooking.widgetPeople.value,
      duration: thisBooking.widgethoursAmount.value,
      starters: [],
      address: thisBooking.dom.address.value,
      phone: thisBooking.dom.phone.value,
    };

    for (let starter of thisBooking.dom.starters) {
      if (starter.checked === true) {
        order.starters.push(starter.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        thisBooking.parsedResponse = {};
        // thisBooking.getData();
        console.log(parsedResponse);
     
        thisBooking.makeBooked(parsedResponse.date, parsedResponse.hour, parsedResponse.duration, parsedResponse.table);
        
        
      });
  }
  render(wrapper) {
    const thisBooking = this;

    const generateHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = wrapper;
    thisBooking.dom.wrapper.innerHTML = generateHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.cart.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.cart.address);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.formSubmit = thisBooking.dom.wrapper.querySelector(select.booking.formSubmit);
  }
  initWidget() {
    const thisBooking = this;

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    // console.log(thisBooking.hourPicker);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    // console.log(thisBooking.datePicker);
    thisBooking.widgetPeople = new AmountWidget(thisBooking.dom.peopleAmount);
    // console.log(thisBooking.widgetPeople);
    thisBooking.widgethoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    // console.log(thisBooking.widgethoursAmount);
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
  }
}
export default Booking;
