import { render } from '../framework/render.js';
import FilterView from '../view/filter-view.js';
import { FilterType } from '../const.js';
import { generateFilters } from '../utils.js';

const DEFAULT_FILTER_TYPE = FilterType.EVERYTHING;

//  создание класса FilterPresenter, который будет отвечать за отображение фильтров на странице.
export default class FilterPresenter {
  constructor({ filtersContainer, pointsModel, onFilterTypeChange }) {
    this.filtersContainer = filtersContainer;
    this.pointsModel = pointsModel;
    this.onFilterTypeChange = onFilterTypeChange;
    this.currentFilterType = DEFAULT_FILTER_TYPE;
  }

  init() {
    const filters = generateFilters(this.pointsModel.points);

    render(new FilterView({
      filters,
      currentFilterType: this.currentFilterType,
      onFilterTypeChange: this.handleFilterTypeChange,
    }), this.filtersContainer);
  }

  handleFilterTypeChange = (filterType) => {
    this.currentFilterType = filterType;
    this.onFilterTypeChange(filterType);
  };
}
