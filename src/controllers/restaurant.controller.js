const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

// 1. Listar restaurantes aprobados (con filtro opcional por categoriaId)
async function getRestaurants(req, res) {
  try {
    const { categoriaId } = req.query;
    const db = getDB();

    const query = { estado: 'aprobado' };
    if (categoriaId && ObjectId.isValid(categoriaId)) {
      query.categoriaId = new ObjectId(categoriaId);
    }

    const restaurants = await db.collection('restaurants').find(query).toArray();
    res.json({ ok: true, data: restaurants });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error al obtener restaurantes', error: error.message });
  }
}

// 2. Detalle de restaurante + Platos aprobados
async function getRestaurantById(req, res) {
  try {
    const { id } = req.params;
    const db = getDB();

    const restaurant = await db.collection('restaurants').findOne({ _id: new ObjectId(id) });
    if (!restaurant) {
      return res.status(404).json({ ok: false, message: 'Restaurante no encontrado' });
    }

    // Buscar platos aprobados vinculados a este restaurante
    const dishes = await db.collection('dishes').find({
      restauranteId: new ObjectId(id),
      estado: 'aprobado'
    }).toArray();

    res.json({
      ok: true,
      data: {
        ...restaurant,
        platos: dishes
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error al consultar restaurante', error: error.message });
  }
}

// 3. Crear restaurante (Entra como 'pendiente' o 'aprobado' si lo crea un admin)
async function createRestaurant(req, res) {
  try {
    const { nombre, descripcion, categoriaId, ubicacion, imagenUrl } = req.body;
    const db = getDB();
    const col = db.collection('restaurants');

    // Validación anti-duplicados por nombre
    const existing = await col.findOne({
      nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') }
    });

    if (existing) {
      return res.status(400).json({ ok: false, message: 'Ya existe un restaurante con este nombre' });
    }

    // Verificar que la categoría exista
    const category = await db.collection('categories').findOne({ _id: new ObjectId(categoriaId) });
    if (!category) {
      return res.status(400).json({ ok: false, message: 'La categoría asignada no existe' });
    }

    const nuevoRestaurante = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      categoriaId: new ObjectId(categoriaId),
      ubicacion: ubicacion.trim(),
      imagenUrl: imagenUrl || '',
      estado: req.user.rol === 'admin' ? 'aprobado' : 'pendiente',
      creadoPor: req.user._id,
      ranking: 0,
      totalResenas: 0,
      fechaCreacion: new Date()
    };

    const result = await col.insertOne(nuevoRestaurante);

    res.status(201).json({
      ok: true,
      message: nuevoRestaurante.estado === 'aprobado' 
        ? 'Restaurante creado y aprobado' 
        : 'Restaurante registrado, pendiente de moderación por un administrador',
      data: { _id: result.insertedId, ...nuevoRestaurante }
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error al registrar restaurante', error: error.message });
  }
}

// 4. Aprobar restaurante (Solo Admin)
async function approveRestaurant(req, res) {
  try {
    const { id } = req.params;
    const db = getDB();

    const result = await db.collection('restaurants').updateOne(
      { _id: new ObjectId(id) },
      { $set: { estado: 'aprobado', fechaAprobacion: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ ok: false, message: 'Restaurante no encontrado' });
    }

    res.json({ ok: true, message: 'Restaurante aprobado con éxito' });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error al aprobar restaurante', error: error.message });
  }
}

// 5. Agregar plato a un restaurante
async function createDish(req, res) {
  try {
    const { id } = req.params; // ID del restaurante
    const { nombre, descripcion, precio } = req.body;
    const db = getDB();

    // Comprobar existencia del restaurante
    const restaurant = await db.collection('restaurants').findOne({ _id: new ObjectId(id) });
    if (!restaurant) {
      return res.status(404).json({ ok: false, message: 'Restaurante no encontrado' });
    }

    // Evitar nombres repetidos dentro del mismo restaurante
    const colDishes = db.collection('dishes');
    const existingDish = await colDishes.findOne({
      restauranteId: new ObjectId(id),
      nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') }
    });

    if (existingDish) {
      return res.status(400).json({ ok: false, message: 'Este restaurante ya tiene un plato con ese nombre' });
    }

    const nuevoPlato = {
      restauranteId: new ObjectId(id),
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio: parseFloat(precio),
      estado: req.user.rol === 'admin' ? 'aprobado' : 'pendiente',
      creadoPor: req.user._id,
      fechaCreacion: new Date()
    };

    const result = await colDishes.insertOne(nuevoPlato);

    res.status(201).json({
      ok: true,
      message: nuevoPlato.estado === 'aprobado' ? 'Plato creado y aprobado' : 'Plato enviado para aprobación',
      data: { _id: result.insertedId, ...nuevoPlato }
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error al crear plato', error: error.message });
  }
}

// 6. Aprobar plato (Solo Admin)
async function approveDish(req, res) {
  try {
    const { dishId } = req.params;
    const db = getDB();

    const result = await db.collection('dishes').updateOne(
      { _id: new ObjectId(dishId) },
      { $set: { estado: 'aprobado' } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ ok: false, message: 'Plato no encontrado' });
    }

    res.json({ ok: true, message: 'Plato aprobado con éxito' });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error al aprobar plato', error: error.message });
  }
}

module.exports = {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  approveRestaurant,
  createDish,
  approveDish
};