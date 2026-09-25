import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { EventTypes, DEFAULT_EVENT_TYPE } from '../const.js';
import { capitalize } from '../utils.js';
import dayjs from 'dayjs';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const DateFormat = {
  EDIT: 'DD/MM/YY HH:mm',
  FLATPICKR: 'd/m/y H:i',
};

function humanizeDateTime(date) {
  return date ? dayjs(date).format(DateFormat.EDIT) : '';
}

function createEventTypeTemplate(eventType, currentType, pointId) {
  const isChecked = eventType === currentType ? 'checked' : '';

  return (
    `<div class="event__type-item">
      <input id="event-type-${eventType}-${pointId}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${eventType}" ${isChecked}>
      <label class="event__type-label  event__type-label--${eventType}" for="event-type-${eventType}-${pointId}">${capitalize(eventType)}</label>
    </div>`
  );
}

function createDestinationOptionTemplate(destination) {
  return `<option value="${destination.name}"></option>`;
}

function createOfferTemplate(offer, selectedOffers, pointId) {
  const isChecked = selectedOffers.some((selectedOffer) => selectedOffer.id === offer.id) ? 'checked' : '';

  return (
    `<div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.id}-${pointId}" type="checkbox" name="event-offer-${offer.id}" ${isChecked}>
      <label class="event__offer-label" for="event-offer-${offer.id}-${pointId}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>`
  );
}

function createOffersTemplate(type, offers, selectedOffers, pointId) {
  const offersByType = offers.find((offerItem) => offerItem.type === type);

  if (!offersByType) {
    return '';
  }

  if (offersByType.offers.length === 0) {
    return '';
  }

  const offersTemplate = offersByType.offers
    .map((offer) => createOfferTemplate(offer, selectedOffers, pointId))
    .join('');

  return (
    `<section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>

      <div class="event__available-offers">
        ${offersTemplate}
      </div>
    </section>`
  );
}

function createPhotosTemplate(photos) {
  if (photos.length === 0) {
    return '';
  }

  const photosTemplate = photos
    .map((photo) => `<img class="event__photo" src="${photo}" alt="Event photo">`)
    .join('');

  return (
    `<div class="event__photos-container">
      <div class="event__photos-tape">
        ${photosTemplate}
      </div>
    </div>`
  );
}

function createDestinationTemplate(destination) {
  if (!destination) {
    return '';
  }

  const photosTemplate = createPhotosTemplate(destination.photos);

  return (
    `<section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${destination.description}</p>

      ${photosTemplate}
    </section>`
  );
}

function createEventCreateTemplate({ state, destinations, offers }) {
  const {
    id,
    type,
    price,
    destination,
    dateFrom,
    dateTo,
    offers: selectedOffers,
  } = state;
  const eventTypesTemplate = EventTypes
    .map((eventType) => createEventTypeTemplate(eventType, type, id))
    .join('');
  const destinationsTemplate = destinations
    .map((destinationItem) => createDestinationOptionTemplate(destinationItem))
    .join('');
  const offersTemplate = createOffersTemplate(type, offers, selectedOffers, id);
  const destinationTemplate = createDestinationTemplate(destination);

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-${id}">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${id}" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${eventTypesTemplate}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-${id}">
              ${capitalize(type)}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-${id}" type="text" name="event-destination" value="${destination?.name ?? ''}" list="destination-list-${id}">
            <datalist id="destination-list-${id}">
              ${destinationsTemplate}
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-${id}">From</label>
            <input class="event__input  event__input--time" id="event-start-time-${id}" type="text" name="event-start-time" value="${humanizeDateTime(dateFrom)}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-${id}">To</label>
            <input class="event__input  event__input--time" id="event-end-time-${id}" type="text" name="event-end-time" value="${humanizeDateTime(dateTo)}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-${id}">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-${id}" type="text" inputmode="numeric" pattern="[0-9]*" name="event-price" value="${price}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Cancel</button>
        </header>

        <section class="event__details">
          ${offersTemplate}

          ${destinationTemplate}
        </section>
      </form>
    </li>`
  );
}

export default class EventCreateView extends AbstractStatefulView {
  #destinations = null;
  #offers = null;
  #onFormSubmit = null;
  #onCancelClick = null;
  #datepickerFrom = null;
  #datepickerTo = null;
  #isDatepickerActive = false;

  constructor({ destinations, offers, pointId, onFormSubmit, onCancelClick }) {
    super();
    this._setState(EventCreateView.parsePointToState(pointId));
    this.#destinations = destinations;
    this.#offers = offers;
    this.#onFormSubmit = onFormSubmit;
    this.#onCancelClick = onCancelClick;

    this._restoreHandlers();
  }

  get template() {
    return createEventCreateTemplate({
      state: this._state,
      destinations: this.#destinations,
      offers: this.#offers,
    });
  }

  _restoreHandlers() {
    this.element.querySelector('form')
      .addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__reset-btn')
      .addEventListener('click', this.#cancelClickHandler);
    this.element.querySelector('.event__type-group')
      .addEventListener('change', this.#eventTypeChangeHandler);
    this.element.querySelector('.event__input--destination')
      .addEventListener('input', this.#destinationInputHandler);
    this.element.querySelector('.event__input--price')
      .addEventListener('input', this.#priceInputHandler);
    this.element.querySelectorAll('.event__offer-checkbox')
      .forEach((offerElement) => offerElement.addEventListener('change', this.#offerChangeHandler));

    if (this.#isDatepickerActive) {
      this.#setDatepickers();
    }
  }

  static parsePointToState(pointId) {
    return {
      id: pointId,
      type: DEFAULT_EVENT_TYPE,
      price: 0,
      destination: null,
      dateFrom: null,
      dateTo: null,
      offers: [],
      isFavorite: false,
    };
  }

  static parseStateToPoint(state) {
    return {
      ...structuredClone(state),
      price: Number(state.price),
    };
  }

  removeElement() {
    this.#destroyDatepickers();
    super.removeElement();
  }

  initDatepickers() {
    this.#isDatepickerActive = true;
    this.#setDatepickers();
  }

  destroyDatepickers() {
    this.#isDatepickerActive = false;
    this.#destroyDatepickers();
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();

    if (!this.#isDestinationValid() || !this._state.dateFrom || !this._state.dateTo) {
      this.shake();
      return;
    }

    this.#onFormSubmit(EventCreateView.parseStateToPoint(this._state));
  };

  #cancelClickHandler = (evt) => {
    evt.preventDefault();
    this.#onCancelClick();
  };

  #eventTypeChangeHandler = (evt) => {
    evt.preventDefault();

    this.updateElement({
      type: evt.target.value,
      offers: [],
    });
  };

  #destinationInputHandler = (evt) => {
    evt.preventDefault();

    const selectedDestination = this.#destinations.find((destination) => destination.name === evt.target.value);

    if (!selectedDestination) {
      this._setState({
        destination: null,
      });
      return;
    }

    this.updateElement({
      destination: selectedDestination,
    });
  };

  #priceInputHandler = (evt) => {
    evt.preventDefault();
    const price = evt.target.value.replace(/\D/g, '');

    evt.target.value = price;

    this._setState({
      price: Number(price),
    });
  };

  #isDestinationValid() {
    const destinationValue = this.element.querySelector('.event__input--destination').value;

    return this.#destinations.some((destination) => destination.name === destinationValue);
  }

  #offerChangeHandler = () => {
    const availableOffers = this.#offers.find((offerItem) => offerItem.type === this._state.type)?.offers ?? [];
    const checkedOfferIds = Array.from(this.element.querySelectorAll('.event__offer-checkbox:checked'))
      .map((offerElement) => Number(offerElement.name.replace('event-offer-', '')));

    this._setState({
      offers: availableOffers.filter((offer) => checkedOfferIds.includes(offer.id)),
    });
  };

  #setDatepickers() {
    this.#destroyDatepickers();

    this.#datepickerFrom = flatpickr(
      this.element.querySelector('[name="event-start-time"]'),
      {
        dateFormat: DateFormat.FLATPICKR,
        defaultDate: this._state.dateFrom,
        enableTime: true,
        'time_24hr': true,
        onChange: this.#dateFromChangeHandler,
      },
    );

    this.#datepickerTo = flatpickr(
      this.element.querySelector('[name="event-end-time"]'),
      {
        dateFormat: DateFormat.FLATPICKR,
        defaultDate: this._state.dateTo,
        enableTime: true,
        minDate: this._state.dateFrom,
        'time_24hr': true,
        onChange: this.#dateToChangeHandler,
      },
    );
  }

  #destroyDatepickers() {
    this.#datepickerFrom?.destroy();
    this.#datepickerFrom = null;

    this.#datepickerTo?.destroy();
    this.#datepickerTo = null;
  }

  #dateFromChangeHandler = ([userDate]) => {
    const dateTo = !this._state.dateTo || userDate > this._state.dateTo ? userDate : this._state.dateTo;

    this._setState({
      dateFrom: userDate,
      dateTo,
    });

    this.#datepickerTo.set('minDate', userDate);
    this.#datepickerTo.setDate(dateTo);
  };

  #dateToChangeHandler = ([userDate]) => {
    this._setState({
      dateTo: userDate,
    });
  };

}
