const carsModels = require('../models/carsModels.js');

async function getAllCars(req, res) {
  const cars = await carsModels.getAllCars();
  res.json(cars);
}

async function getCarByProductId(req, res) {
  const productId = req.params.productId;
  const car = await carsModels.getCarByProductId(productId);
  res.json(car);
}

async function createCar(req, res) {
  const newCar = await carsModels.createCar(req.body);
  res.status(201).json(newCar);
}

module.exports = {
  getAllCars,
  getCarByProductId,
  createCar
};
