const carsModels = require('../models/carsModels');

async function getAllCars(req, res) {
  const cars = await carsModels.getAllCars();
  res.json(cars);
}

async function getCar(req, res) {
  const carsid = req.params.carsid;
  const car = await carsModels.getCarByCarsId(carsid);
  res.json(car);
}

async function createCar(req, res) {
  const newCar = await carsModels.createCar(req.body);
  res.status(201).json(newCar);
}

module.exports = {
  getAllCars,
  getCar,
  createCar
};
