const express = require('express');
const router = express.Router();
const {
  createReview,
  voteReview,
  getRestaurantReviews,
  deleteReview
} = require('../../controllers/review.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');
const {
  validateCreateReview,
  validateVote,
  validateReviewId
} = require('../../middlewares/reviewValidators');

// Rutas Públicas: Listar reseñas por ID de restaurante
router.get('/restaurant/:id', getRestaurantReviews);

// Rutas Autenticadas
router.post('/', requireAuth, validateCreateReview, createReview);
router.post('/:id/vote', requireAuth, validateVote, voteReview);
router.delete('/:id', requireAuth, validateReviewId, deleteReview);

module.exports = router;