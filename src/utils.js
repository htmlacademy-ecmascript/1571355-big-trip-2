import { FilterType } from './const.js';

function getRandomArrayElement(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function capitalize(value) {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function filterPoints(points, filterType) {
  const currentDate = new Date();

  switch (filterType) {
    case FilterType.FUTURE:
      return points.filter((point) => point.dateFrom > currentDate);

    case FilterType.PRESENT:
      return points.filter((point) => point.dateFrom <= currentDate && point.dateTo >= currentDate);

    case FilterType.PAST:
      return points.filter((point) => point.dateTo < currentDate);

    case FilterType.EVERYTHING:
      return points;
  }
}

function generateFilters(points) {
  return Object.values(FilterType).map((filterType) => ({
    type: filterType,
    isDisabled: filterType !== FilterType.EVERYTHING && filterPoints(points, filterType).length === 0,
  }));
}

export { getRandomArrayElement, capitalize, filterPoints, generateFilters };
