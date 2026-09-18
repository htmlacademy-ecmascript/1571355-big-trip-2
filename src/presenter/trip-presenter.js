import { render, remove, RenderPosition } from '../framework/render.js';
import { FilterType, NoPointTextType, SortType } from '../const.js';
import { filterPoints } from '../utils.js';
import MessageView from '../view/message-view.js';
import PointPresenter from './point-presenter.js';
import SortView from '../view/sort-view.js';
import TripListView from '../view/trip-list-view.js';

const DEFAULT_SORT_TYPE = SortType.DAY;

const sortPointsByDay = (pointA, pointB) => pointA.dateFrom - pointB.dateFrom;
const sortPointsByTime = (pointA, pointB) =>
  (pointB.dateTo - pointB.dateFrom) - (pointA.dateTo - pointA.dateFrom);
const sortPointsByPrice = (pointA, pointB) => pointB.price - pointA.price;

export default class TripPresenter {
  sortComponent = null;
  tripListComponent = null;
  noPointComponent = null;

  constructor({ tripEventsContainer, pointsModel }) {
    this.tripEventsContainer = tripEventsContainer; // куда tripEventsContainer = document.querySelector('.trip-events');<section class="trip-events">
    this.pointsModel = pointsModel; //что import PointsModel from './model/points-model.js';класс с тремя рандомными точками
    this.destinations = [];
    this.offers = [];
    this.pointPresenters = new Map();
    this.currentFilterType = FilterType.EVERYTHING;
    this.currentSortType = DEFAULT_SORT_TYPE;
  }

  init(filterType = this.currentFilterType) {
    this.currentFilterType = filterType;
    this.destinations = [...this.pointsModel.destinations];
    this.offers = [...this.pointsModel.offers];
    this.clearEventsList();
    this.renderEventsList();
  }

  clearEventsList() {
    remove(this.sortComponent);
    remove(this.tripListComponent);
    remove(this.noPointComponent);

    this.pointPresenters.forEach((pointPresenter) => pointPresenter.destroy());
    this.pointPresenters.clear();
  }

  getSortedPoints(points) {
    switch (this.currentSortType) {
      case SortType.TIME:
        return points.slice().sort(sortPointsByTime);
      case SortType.PRICE:
        return points.slice().sort(sortPointsByPrice);
      case SortType.DAY:
        return points.slice().sort(sortPointsByDay);
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

  renderEventsList() {
    const points = this.getSortedPoints(filterPoints(this.pointsModel.points, this.currentFilterType));

    if (points.length === 0) {
      this.noPointComponent = new MessageView({
        message: NoPointTextType[this.currentFilterType],
      });
      render(this.noPointComponent, this.tripEventsContainer);
      return;
    }

    this.renderSort();
    this.tripListComponent = new TripListView();
    render(this.tripListComponent, this.tripEventsContainer);//отрисовывает ul с классом trip-events__list в section class="trip-events"

    for (const point of points) {
      const pointPresenter = new PointPresenter({
        pointListContainer: this.tripListComponent.element,
        point,
        destinations: this.destinations,
        offers: this.offers,
        onDataChange: this.handlePointChange,
        onModeChange: this.resetView,
      });

      pointPresenter.init();
      this.pointPresenters.set(point.id, pointPresenter);
    }
  }

  handlePointChange = (updatedPoint) => {
    this.pointsModel.points = this.pointsModel.points.map((point) =>
      point.id === updatedPoint.id ? updatedPoint : point
    );

    this.pointPresenters.get(updatedPoint.id).init(updatedPoint);
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
    this.pointPresenters.forEach((pointPresenter) => pointPresenter.resetView());
  };
}
