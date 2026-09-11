const { body, param, query, validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, errors: errors.array() });
  }
  next();
};

const validateRestaurantBody = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria'),
  body('categoriaId')
    .notEmpty().withMessage('La categoría es obligatoria')
    .custom((val) => ObjectId.isValid(val)).withMessage('El ID de categoría no es válido'),
  body('ubicacion').trim().notEmpty().withMessage('La ubicación es obligatoria'),
  body('imagenUrl').optional().isURL().withMessage('La URL de la imagen no es válida'),
  validateResult
];

const validateDishBody = [
  body('nombre').trim().notEmpty().withMessage('El nombre del plato es obligatorio'),
  body('descripcion').trim().notEmpty().withMessage('La descripción del plato es obligatoria'),
  body('precio')
    .isFloat({ min: 0.01 }).withMessage('El precio debe ser un número positivo'),
  validateResult
];

const validateId = (paramName) => [
  param(paramName).custom((val) => ObjectId.isValid(val)).withMessage(`El ${paramName} no es válido`),
  validateResult
];

module.exports = {
  validateRestaurantBody,
  validateDishBody,
  validateId
};