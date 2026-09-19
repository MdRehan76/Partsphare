const vehiclesService = require('./vehicles.service');
const { sendSuccess, sendCreated } = require('../../utils/response');

// Master data
const getMakes = async (req, res, next) => {
  try {
    const { type } = req.query;
    const makes = await vehiclesService.getMakes(type);
    return sendSuccess(res, { data: makes });
  } catch (err) { next(err); }
};

const getModels = async (req, res, next) => {
  try {
    const models = await vehiclesService.getModels(req.params.makeId);
    return sendSuccess(res, { data: models });
  } catch (err) { next(err); }
};

const getVariants = async (req, res, next) => {
  try {
    const variants = await vehiclesService.getVariants(req.params.modelId);
    return sendSuccess(res, { data: variants });
  } catch (err) { next(err); }
};

// Garage
const getMyGarage = async (req, res, next) => {
  try {
    const vehicles = await vehiclesService.getMyGarage(req.user.id);
    return sendSuccess(res, { data: vehicles });
  } catch (err) { next(err); }
};

const addVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehiclesService.addVehicle(req.user.id, req.body);
    return sendCreated(res, { message: 'Vehicle added to your garage.', data: vehicle });
  } catch (err) { next(err); }
};

const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehiclesService.updateVehicle(req.user.id, req.params.id, req.body);
    return sendSuccess(res, { message: 'Vehicle updated.', data: vehicle });
  } catch (err) { next(err); }
};

const removeVehicle = async (req, res, next) => {
  try {
    await vehiclesService.removeVehicle(req.user.id, req.params.id);
    return sendSuccess(res, { message: 'Vehicle removed from your garage.' });
  } catch (err) { next(err); }
};

module.exports = { getMakes, getModels, getVariants, getMyGarage, addVehicle, updateVehicle, removeVehicle };
