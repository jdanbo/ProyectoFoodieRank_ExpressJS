const express = require('express');
const router = express.Router();

const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  approveRestaurant,
  createDish,
  approveDish,
  getAllRestaurantsAdmin,
  updateRestaurant,
  deleteRestaurant,
  getPendingDishes
} = require('../../controllers/restaurant.controller');

const { requireAuth, requireRole } = require('../../middlewares/auth.middleware');
const {
  validateRestaurantBody,
  validateDishBody,
  validateId
} = require('../../middlewares/restaurantValidators');

// Rutas Públicas
router.get('/', getRestaurants);

// Rutas Administrativas (Declaradas ANTES de /:id para evitar colisiones de rutas)
router.get('/admin/all', requireAuth, requireRole('admin'), getAllRestaurantsAdmin);
router.get('/admin/dishes/pending', requireAuth, requireRole('admin'), getPendingDishes);
router.patch('/:id/approve', requireAuth, requireRole('admin'), validateId('id'), approveRestaurant);
router.patch('/dishes/:dishId/approve', requireAuth, requireRole('admin'), validateId('dishId'), approveDish);
router.put('/:id', requireAuth, requireRole('admin'), validateId('id'), updateRestaurant);
router.delete('/:id', requireAuth, requireRole('admin'), validateId('id'), deleteRestaurant);

// Rutas de Detalle y Creación
router.get('/:id', validateId('id'), getRestaurantById);
router.post('/', requireAuth, validateRestaurantBody, createRestaurant);
router.post('/:id/dishes', requireAuth, validateId('id'), validateDishBody, createDish);

module.exports = router;