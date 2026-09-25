import FilterPresenter from './presenter/filter-presenter.js';
import TripPresenter from './presenter/trip-presenter.js';
import FilterModel from './model/filter-model.js';
import PointsModel from './model/points-model.js';

const filtersContainer = document.querySelector('.trip-controls__filters');
const tripEventsContainer = document.querySelector('.trip-events');
const newEventButton = document.querySelector('.trip-main__event-add-btn');

const pointsModel = new PointsModel();
const filterModel = new FilterModel();

let filterPresenter = null;

const tripPresenter = new TripPresenter({
  tripEventsContainer,
  pointsModel,
  filterModel,
  onDataChange: () => {
    filterPresenter.init();
  },
  onNewPointDestroy: () => {
    newEventButton.disabled = false;
  },
});
filterPresenter = new FilterPresenter({
  filtersContainer,
  pointsModel,
  filterModel,
  onFilterTypeChange: () => {
    tripPresenter.init();
  },
});
filterPresenter.init();
tripPresenter.init();

newEventButton.addEventListener('click', () => {
  newEventButton.disabled = true;
  tripPresenter.createPoint();
  filterPresenter.init();
});
