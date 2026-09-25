import { render, remove, RenderPosition } from '../framework/render.js';
import { FilterType, NoPointTextType, SortType, UserAction } from '../const.js';
import { filterPoints } from '../utils.js';
import MessageView from '../view/message-view.js';
import NewPointPresenter from './new-point-presenter.js';
import PointPresenter from './point-presenter.js';
import SortView from '../view/sort-view.js';
import TripListView from '../view/trip-list-view.js';

const DEFAULT_SORT_TYPE = SortType.DAY;

export default class TripPresenter {
  sortComponent = null;
  tripListComponent = null;
  noPointComponent = null;
  newPointPresenter = null;

  constructor({
    tripEventsContainer,
    pointsModel,
    filterModel,
    onDataChange = () => {},
    onNewPointDestroy = () => {},
  }) {
    this.tripEventsContainer = tripEventsContainer; // куда tripEventsContainer = document.querySelector('.trip-events');<section class="trip-events">
    this.pointsModel = pointsModel; //что import PointsModel from './model/points-model.js';класс с тремя рандомными точками
    this.filterModel = filterModel;
    this.onDataChange = onDataChange;
    this.onNewPointDestroy = onNewPointDestroy;
    this.destinations = [];
    this.offers = [];
    this.pointPresenters = new Map();
    this.currentFilterType = this.filterModel.getFilter();
    this.currentSortType = DEFAULT_SORT_TYPE;
  }

  init() {
    const filterType = this.filterModel.getFilter();

    if (this.currentFilterType !== filterType) {
      this.currentSortType = DEFAULT_SORT_TYPE;
    }

    this.currentFilterType = filterType;
    this.destinations = [...this.pointsModel.destinations];
    this.offers = [...this.pointsModel.offers];
    this.clearEventsList();
    this.renderEventsList();
  }

  clearEventsList() {
    if (this.newPointPresenter !== null) {
      this.newPointPresenter.destroy();
      this.newPointPresenter = null;
      this.onNewPointDestroy();
    }

    remove(this.sortComponent);
    remove(this.tripListComponent);
    remove(this.noPointComponent);

    this.pointPresenters.forEach((pointPresenter) => pointPresenter.destroy());
    this.pointPresenters.clear();
  }

  getSortedPoints(points) {
    switch (this.currentSortType) {
      case SortType.TIME:
        return points.slice().sort((pointA, pointB) =>
          (pointB.dateTo - pointB.dateFrom) - (pointA.dateTo - pointA.dateFrom)
        );
      case SortType.PRICE:
        return points.slice().sort((pointA, pointB) => pointB.price - pointA.price);
      case SortType.DAY:
        return points.slice().sort((pointA, pointB) => pointA.dateFrom - pointB.dateFrom);
    }
  }

  renderSort() {
    this.sortComponent = new SortView({
      sortItems: Object.values(SortType),
      currentSortType: this.currentSortType,
      onSortTypeChange: this.handleSortTypeChange,
    });

    render(this.sortComponent, this.tripEventsContainer, RenderPosition.AFTERBEGIN);
  }

  renderTripList() {
    this.tripListComponent = new TripListView();
    render(this.tripListComponent, this.tripEventsContainer);//отрисовывает ul с классом trip-events__list в section class="trip-events"
  }

  renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.tripListComponent.element,
      point,
      destinations: this.destinations,
      offers: this.offers,
      onDataChange: this.handleUserAction,
      onModeChange: this.resetView,
    });

    pointPresenter.init();
    this.pointPresenters.set(point.id, pointPresenter);
  }

  renderNewPoint() {
    this.newPointPresenter = new NewPointPresenter({
      pointListContainer: this.tripListComponent.element,
      destinations: this.destinations,
      offers: this.offers,
      onDataChange: this.handleUserAction,
      onDestroy: this.handleNewPointDestroy,
    });

    this.newPointPresenter.init();
  }

  renderEventsList() {
    const points = this.getSortedPoints(filterPoints(this.pointsModel.getPoints(), this.currentFilterType));

    if (points.length === 0) {
      this.noPointComponent = new MessageView({
        message: NoPointTextType[this.currentFilterType],
      });
      render(this.noPointComponent, this.tripEventsContainer);
      return;
    }

    this.renderSort();
    this.renderTripList();

    for (const point of points) {
      this.renderPoint(point);
    }
  }

  createPoint() {
    this.filterModel.setFilter(FilterType.EVERYTHING);
    this.currentFilterType = this.filterModel.getFilter();
    this.currentSortType = DEFAULT_SORT_TYPE;
    this.destinations = [...this.pointsModel.destinations];
    this.offers = [...this.pointsModel.offers];

    this.clearEventsList();
    this.renderSort();
    this.renderTripList();
    this.renderNewPoint();

    const points = this.getSortedPoints(filterPoints(this.pointsModel.getPoints(), this.currentFilterType));

    for (const point of points) {
      this.renderPoint(point);
    }
  }

  handleUserAction = (actionType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.pointsModel.updatePoint(update);
        break;
      case UserAction.ADD_POINT:
        this.pointsModel.addPoint(update);
        this.currentSortType = DEFAULT_SORT_TYPE;
        break;
      case UserAction.DELETE_POINT:
        this.pointsModel.deletePoint(update.id);
        break;
    }

    this.onDataChange();
    this.clearEventsList();
    this.renderEventsList();
  };

  handleNewPointDestroy = () => {
    this.newPointPresenter = null;
    this.onNewPointDestroy();

    if (this.pointsModel.getPoints().length === 0) {
      this.clearEventsList();
      this.renderEventsList();
    }
  };

  handleSortTypeChange = (sortType) => {
    if (this.currentSortType === sortType) {
      return;
    }

    this.currentSortType = sortType;
    this.clearEventsList();
    this.renderEventsList();
  };

  resetView = () => {
    if (this.newPointPresenter !== null) {
      this.newPointPresenter.destroy();
      this.newPointPresenter = null;
      this.onNewPointDestroy();
    }

    this.pointPresenters.forEach((pointPresenter) => pointPresenter.resetView());
  };
}
