const usersService = require('./users.service');
const { sendSuccess } = require('../../utils/response');

// Profile
const getProfile = async (req, res, next) => {
  try {
    const user = await usersService.getProfile(req.user.id);
    return sendSuccess(res, { data: user });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;
    const user = await usersService.updateProfile(req.user.id, { firstName, lastName, phone, avatar });
    return sendSuccess(res, { message: 'Profile updated.', data: user });
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await usersService.changePassword(req.user.id, { currentPassword, newPassword });
    return sendSuccess(res, { message: 'Password changed. Please log in again on other devices.' });
  } catch (err) { next(err); }
};

// Addresses
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await usersService.getAddresses(req.user.id);
    return sendSuccess(res, { data: addresses });
  } catch (err) { next(err); }
};

const createAddress = async (req, res, next) => {
  try {
    const address = await usersService.createAddress(req.user.id, req.body);
    return sendSuccess(res, { message: 'Address added.', data: address, statusCode: 201 });
  } catch (err) { next(err); }
};

const updateAddress = async (req, res, next) => {
  try {
    const address = await usersService.updateAddress(req.user.id, req.params.id, req.body);
    return sendSuccess(res, { message: 'Address updated.', data: address });
  } catch (err) { next(err); }
};

const deleteAddress = async (req, res, next) => {
  try {
    await usersService.deleteAddress(req.user.id, req.params.id);
    return sendSuccess(res, { message: 'Address removed.' });
  } catch (err) { next(err); }
};

const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await usersService.setDefaultAddress(req.user.id, req.params.id);
    return sendSuccess(res, { message: 'Default address updated.', data: address });
  } catch (err) { next(err); }
};

module.exports = {
  getProfile, updateProfile, changePassword,
  getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress,
};
