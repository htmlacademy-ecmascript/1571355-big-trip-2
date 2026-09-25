import { render, remove, RenderPosition } from '../framework/render.js';
import { UserAction } from '../const.js';
import EventCreateView from '../view/event-create-view.js';

export default class NewPointPresenter {
  #pointListContainer = null;
  #destinations = null;
  #offers = null;
  #onDataChange = null;
  #onDestroy = null;

  #eventCreateComponent = null;

  constructor({ pointListContainer, destinations, offers, onDataChange, onDestroy }) {
    this.#pointListContainer = pointListContainer;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#onDataChange = onDataChange;
    this.#onDestroy = onDestroy;
  }

  init() {
    if (this.#eventCreateComponent !== null) {
      return;
    }

    this.#eventCreateComponent = new EventCreateView({
      pointId: crypto.randomUUID(),
      destinations: this.#destinations,
      offers: this.#offers,
      onFormSubmit: this.#formSubmitHandler,
      onCancelClick: this.#cancelClickHandler,
    });

    render(this.#eventCreateComponent, this.#pointListContainer, RenderPosition.AFTERBEGIN);
    this.#eventCreateComponent.initDatepickers();
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#eventCreateComponent === null) {
      return;
    }

    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#eventCreateComponent.destroyDatepickers();
    remove(this.#eventCreateComponent);
    this.#eventCreateComponent = null;
  }

  #formSubmitHandler = (point) => {
    this.#onDataChange(UserAction.ADD_POINT, point);
    this.destroy();
    this.#onDestroy();
  };

  #cancelClickHandler = () => {
    this.destroy();
    this.#onDestroy();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#cancelClickHandler();
    }
  };
}
