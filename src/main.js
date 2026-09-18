import FilterPresenter from './presenter/filter-presenter.js';
import TripPresenter from './presenter/trip-presenter.js';
import PointsModel from './model/points-model.js';

const filtersContainer = document.querySelector('.trip-controls__filters');
const tripEventsContainer = document.querySelector('.trip-events');

const pointsModel = new PointsModel();

const tripPresenter = new TripPresenter({
  tripEventsContainer,
  pointsModel,
});
const filterPresenter = new FilterPresenter({
  filtersContainer,
  pointsModel,
  onFilterTypeChange: (filterType) => {
    tripPresenter.init(filterType);
  },
});
filterPresenter.init();
tripPresenter.init();
