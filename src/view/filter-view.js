import AbstractView from '../framework/view/abstract-view.js';
import { capitalize } from '../utils.js';

function createFilterItemTemplate(filterItem, currentFilterType) { //берет один тип фильтра и превращает его в один кусочек HTML с radio-кнопкой и label.
  const { type, isDisabled } = filterItem;
  const isChecked = type === currentFilterType ? 'checked' : '';
  const isDisabledAttribute = isDisabled ? 'disabled' : '';

  return (
    `<div class="trip-filters__filter">
      <input id="filter-${type}" class="trip-filters__filter-input visually-hidden" type="radio" name="trip-filter" value="${type}" ${isChecked} ${isDisabledAttribute}>
      <label class="trip-filters__filter-label" for="filter-${type}">${capitalize(type)}</label>
    </div>`
  ) ;
}

function createFilterTemplate(filters, currentFilterType) { //создает полный шаблон формы фильтров, используя массив фильтров и активный фильтр.
  const filterItemsTemplate = filters
    .map((filter) => createFilterItemTemplate(filter, currentFilterType))
    .join('');

  return (
    `<form class="trip-filters" action="#" method="get">
      ${filterItemsTemplate}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>`
  );
}
//  создание класса FilterView, который будет отвечать за отображение фильтров на странице.
//   Класс содержит методы для получения шаблона фильтров, создания элемента DOM и удаления элемента из памяти.
export default class FilterView extends AbstractView {
  #filters = null;
  #currentFilterType = null;
  #onFilterTypeChange = null;

  constructor({ filters, currentFilterType, onFilterTypeChange }) {
    super();
    this.#filters = filters;
    this.#currentFilterType = currentFilterType;
    this.#onFilterTypeChange = onFilterTypeChange;

    this.element.addEventListener('change', this.filterTypeChangeHandler);
  }

  get template() {
    return createFilterTemplate(this.#filters, this.#currentFilterType);
  }

  filterTypeChangeHandler = (evt) => {
    evt.preventDefault();
    this.#onFilterTypeChange(evt.target.value);
  };
}
