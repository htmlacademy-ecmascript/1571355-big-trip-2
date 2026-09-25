import { render, remove } from '../framework/render.js';
import FilterView from '../view/filter-view.js';
import { generateFilters } from '../utils.js';

//  создание класса FilterPresenter, который будет отвечать за отображение фильтров на странице.
export default class FilterPresenter {
  filterComponent = null;

  constructor({ filtersContainer, pointsModel, filterModel, onFilterTypeChange }) {
    this.filtersContainer = filtersContainer;
    this.pointsModel = pointsModel;
    this.filterModel = filterModel;
    this.onFilterTypeChange = onFilterTypeChange;
  }

  init() {
    const filters = generateFilters(this.pointsModel.getPoints());

    remove(this.filterComponent);

    this.filterComponent = new FilterView({
      filters,
      currentFilterType: this.filterModel.getFilter(),
      onFilterTypeChange: this.handleFilterTypeChange,
    });

    render(this.filterComponent, this.filtersContainer);
  }

  handleFilterTypeChange = (filterType) => {
    if (this.filterModel.getFilter() === filterType) {
      return;
    }

    this.filterModel.setFilter(filterType);
    this.onFilterTypeChange();
  };
}
