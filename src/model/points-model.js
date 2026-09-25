import { getRandomPoint } from '../mock/point.js';
import { getDestinationsList } from '../mock/destination.js';
import { getOffersList } from '../mock/offer.js';
import { POINTS_COUNT } from '../const.js';

export default class PointsModel {
  #points = Array.from({ length: POINTS_COUNT }, getRandomPoint);

  destinations = getDestinationsList();
  offers = getOffersList();

  getPoints() {
    return this.#points;
  }

  setPoints(points) {
    this.#points = points;
  }

  updatePoint(updatedPoint) {
    this.#points = this.#points.map((point) =>
      point.id === updatedPoint.id ? updatedPoint : point
    );
  }

  addPoint(point) {
    this.#points = [
      point,
      ...this.#points,
    ];
  }

  deletePoint(pointId) {
    this.#points = this.#points.filter((point) => point.id !== pointId);
  }
}
