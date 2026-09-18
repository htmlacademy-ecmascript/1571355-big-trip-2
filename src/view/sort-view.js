import AbstractView from '../framework/view/abstract-view.js';
import { SortType } from '../const.js';
import { capitalize } from '../utils.js';

function getSortName(sortType) {
  return sortType === SortType.OFFER ? 'Offers' : capitalize(sortType);
}

function createSortItemTemplate(sortType, currentSortType) {
  const isChecked = sortType === currentSortType ? 'checked' : '';
  const isDisabled = sortType === SortType.EVENT || sortType === SortType.OFFER ? 'disabled' : '';

  return (
    `<div class="trip-sort__item trip-sort__item--${sortType}">
      <input id="sort-${sortType}" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="${sortType}" data-sort-type="${sortType}" ${isChecked} ${isDisabled}>
      <label class="trip-sort__btn" for="sort-${sortType}" data-sort-type="${sortType}">${getSortName(sortType)}</label>
    </div>`
  );
}

function createSortTemplate(sortItems, currentSortType) {
  const sortItemsTemplate = sortItems
    .map((sortType) => createSortItemTemplate(sortType, currentSortType))
    .join('');

  return (
    `<form class="trip-events__trip-sort trip-sort" action="#" method="get">
      ${sortItemsTemplate}
    </form>`
  );
}

export default class SortView extends AbstractView {
  #sortItems = null;
  #currentSortType = null;
  #onSortTypeChange = null;

  constructor({ sortItems, currentSortType, onSortTypeChange }) {
    super();
    this.#sortItems = sortItems;
    this.#currentSortType = currentSortType;
    this.#onSortTypeChange = onSortTypeChange;

    this.element.addEventListener('click', this.#sortTypeClickHandler);
  }

  get template() {
    return createSortTemplate(this.#sortItems, this.#currentSortType);
  }

  #sortTypeClickHandler = (evt) => {
    const sortElement = evt.target.closest('.trip-sort__btn');

    if (!sortElement) {
      return;
    }

    evt.preventDefault();

    const input = this.element.querySelector(`#sort-${sortElement.dataset.sortType}`);

    if (input.disabled) {
      return;
    }

    this.#onSortTypeChange(sortElement.dataset.sortType);
  };
}
