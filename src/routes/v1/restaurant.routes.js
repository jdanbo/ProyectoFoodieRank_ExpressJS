const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  approveRestaurant,
  createDish,
  approveDish
} = require('../../controllers/restaurant.controller');
const { requireAuth, requireRole } = require('../../middlewares/auth.middleware');
const {
  validateRestaurantBody,
  validateDishBody,
  validateId
} = require('../../middlewares/restaurantValidators');

// Rutas Públicas
router.get('/', getRestaurants);
router.get('/:id', validateId('id'), getRestaurantById);

// Rutas de Usuario Autenticado
router.post('/', requireAuth, validateRestaurantBody, createRestaurant);
router.post('/:id/dishes', requireAuth, validateId('id'), validateDishBody, createDish);

// Rutas Administrativas
router.patch('/:id/approve', requireAuth, requireRole('admin'), validateId('id'), approveRestaurant);
router.patch('/dishes/:dishId/approve', requireAuth, requireRole('admin'), validateId('dishId'), approveDish);

module.exports = router;
