document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.getToken() || !Auth.isAdmin()) {
    alert('Acceso exclusivo para administradores.');
    window.location.href = 'login.html';
    return;
  }

  const alertBox = document.getElementById('admin-alert');
  let cacheCategories = [];
  let cacheRestaurants = [];
  let cacheReviews = [];

  function showAlert(msg, type = 'error') {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';
    setTimeout(() => { alertBox.style.display = 'none'; }, 4000);
  }

  // Control de Tabs
  window.switchTab = (tabId) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');

    if (tabId === 'tab-moderacion') loadPending();
    if (tabId === 'tab-restaurantes') loadRestaurants();
    if (tabId === 'tab-categorias') loadCategories();
    if (tabId === 'tab-resenas') loadReviews();
  };

  // Modales
  window.closeModal = (id) => document.getElementById(id).classList.remove('show');
  window.openCategoryModal = (cat = null) => {
    document.getElementById('edit-cat-id').value = cat ? cat._id : '';
    document.getElementById('cat-name-input').value = cat ? cat.nombre : '';
    document.getElementById('cat-desc-input').value = cat ? cat.descripcion : '';
    document.getElementById('modal-cat-title').textContent = cat ? 'Editar Categoría' : 'Nueva Categoría';
    document.getElementById('modal-category').classList.add('show');
  };

  window.openRestaurantModal = (r = null) => {
    document.getElementById('edit-rest-id').value = r ? r._id : '';
    document.getElementById('rest-name').value = r ? r.nombre : '';
    document.getElementById('rest-address').value = r ? r.ubicacion : '';
    document.getElementById('rest-schedule').value = r ? (r.horario || '') : '';
    document.getElementById('rest-img').value = r ? (r.imagenUrl || '') : '';
    document.getElementById('rest-desc').value = r ? r.descripcion : '';
    document.getElementById('rest-category-select').value = r ? r.categoriaId : (cacheCategories[0]?._id || '');
    document.getElementById('modal-rest-title').textContent = r ? 'Editar Restaurante' : 'Nuevo Restaurante';
    document.getElementById('modal-restaurant').classList.add('show');
  };

  // 1. CARGAR PENDIENTES
  async function loadPending() {
    const tbodyRest = document.getElementById('tbody-pending-restaurants');
    const tbodyDish = document.getElementById('tbody-pending-dishes');
    tbodyRest.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';
    tbodyDish.innerHTML = '<tr><td colspan="3">Cargando...</td></tr>';

    try {
      const resR = await apiRequest('/restaurants/admin/all', 'GET', null, true);
      const pendingRest = (resR.data || []).filter(r => r.estado === 'pendiente');
      tbodyRest.innerHTML = pendingRest.length ? '' : '<tr><td colspan="4" style="color: var(--text-muted);">No hay restaurantes pendientes.</td></tr>';
      pendingRest.forEach(r => {
        tbodyRest.innerHTML += `
          <tr>
            <td><strong>${r.nombre}</strong></td>
            <td>${r.ubicacion}</td>
            <td>${new Date(r.fechaCreacion).toLocaleDateString()}</td>
            <td>
              <button class="btn btn-primary btn-sm" onclick="approveRest('${r._id}')">Aprobar</button>
            </td>
          </tr>
        `;
      });

      const resD = await apiRequest('/restaurants/admin/dishes/pending', 'GET', null, true);
      const pendingDishes = resD.data || [];
      tbodyDish.innerHTML = pendingDishes.length ? '' : '<tr><td colspan="3" style="color: var(--text-muted);">No hay platillos pendientes.</td></tr>';
      pendingDishes.forEach(d => {
        tbodyDish.innerHTML += `
          <tr>
            <td><strong>${d.nombre}</strong></td>
            <td>Q ${Number(d.precio).toFixed(2)}</td>
            <td>
              <button class="btn btn-primary btn-sm" onclick="approveDish('${d._id}')">Aprobar</button>
            </td>
          </tr>
        `;
      });
    } catch (err) {
      showAlert(err.message);
    }
  }

  window.approveRest = async (id) => {
    await apiRequest(`/restaurants/${id}/approve`, 'PATCH', null, true);
    showAlert('Restaurante aprobado', 'success');
    loadPending();
  };

  window.approveDish = async (dishId) => {
    await apiRequest(`/restaurants/dishes/${dishId}/approve`, 'PATCH', null, true);
    showAlert('Plato aprobado', 'success');
    loadPending();
  };

  // 2. CARGAR Y FILTRAR RESTAURANTES (CRUD)
  async function loadRestaurants() {
    const tbody = document.getElementById('tbody-all-restaurants');
    try {
      const res = await apiRequest('/restaurants/admin/all', 'GET', null, true);
      cacheRestaurants = res.data || [];
      renderRestaurantsTable(cacheRestaurants);
    } catch (err) {
      showAlert(err.message);
    }
  }

  function renderRestaurantsTable(list) {
    const tbody = document.getElementById('tbody-all-restaurants');
    tbody.innerHTML = list.length ? '' : '<tr><td colspan="5">No se encontraron restaurantes.</td></tr>';
    list.forEach(r => {
      const catObj = cacheCategories.find(c => c._id === r.categoriaId);
      tbody.innerHTML += `
        <tr>
          <td><strong>${r.nombre}</strong></td>
          <td>${catObj ? catObj.nombre : 'General'}</td>
          <td>★ ${Number(r.ranking || 0).toFixed(1)}</td>
          <td><span class="badge ${r.estado === 'aprobado' ? 'badge-green' : 'badge-gold'}">${r.estado}</span></td>
          <td>
            <div class="action-group">
              <button class="btn btn-secondary btn-sm" onclick='openRestaurantModal(${JSON.stringify(r).replace(/'/g, "&apos;")})'>Editar</button>
              <button class="btn btn-danger btn-sm" onclick="deleteRest('${r._id}')">Eliminar</button>
            </div>
          </td>
        </tr>
      `;
    });
  }

  document.getElementById('form-restaurant').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-rest-id').value;
    const payload = {
      nombre: document.getElementById('rest-name').value,
      categoriaId: document.getElementById('rest-category-select').value,
      ubicacion: document.getElementById('rest-address').value,
      horario: document.getElementById('rest-schedule').value,
      imagenUrl: document.getElementById('rest-img').value,
      descripcion: document.getElementById('rest-desc').value
    };

    try {
      if (id) {
        await apiRequest(`/restaurants/${id}`, 'PUT', payload, true);
        showAlert('Restaurante actualizado', 'success');
      } else {
        await apiRequest('/restaurants', 'POST', payload, true);
        showAlert('Restaurante creado exitosamente', 'success');
      }
      closeModal('modal-restaurant');
      loadRestaurants();
    } catch (err) {
      showAlert(err.message);
    }
  });

  window.deleteRest = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este restaurante y todos sus platos/reseñas?')) return;
    try {
      await apiRequest(`/restaurants/${id}`, 'DELETE', null, true);
      showAlert('Restaurante eliminado', 'success');
      loadRestaurants();
    } catch (err) {
      showAlert(err.message);
    }
  };

  // Filtros de Restaurante
  document.getElementById('rest-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = cacheRestaurants.filter(r => r.nombre.toLowerCase().includes(term) || r.ubicacion.toLowerCase().includes(term));
    renderRestaurantsTable(filtered);
  });

  // 3. CATEGORÍAS (CRUD)
  async function loadCategories() {
    const tbody = document.getElementById('tbody-categories');
    try {
      const res = await apiRequest('/categories');
      cacheCategories = res.data || [];
      
      // Llenar selects
      const catSelect = document.getElementById('rest-category-select');
      const catFilter = document.getElementById('rest-cat-filter');
      catSelect.innerHTML = '';
      catFilter.innerHTML = '<option value="">Todas las categorías</option>';
      cacheCategories.forEach(c => {
        catSelect.innerHTML += `<option value="${c._id}">${c.nombre}</option>`;
        catFilter.innerHTML += `<option value="${c._id}">${c.nombre}</option>`;
      });

      tbody.innerHTML = cacheCategories.length ? '' : '<tr><td colspan="3">No hay categorías.</td></tr>';
      cacheCategories.forEach(c => {
        tbody.innerHTML += `
          <tr>
            <td><strong>${c.nombre}</strong></td>
            <td style="color: var(--text-secondary);">${c.descripcion || '-'}</td>
            <td>
              <div class="action-group">
                <button class="btn btn-secondary btn-sm" onclick='openCategoryModal(${JSON.stringify(c).replace(/'/g, "&apos;")})'>Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCat('${c._id}')">Eliminar</button>
              </div>
            </td>
          </tr>
        `;
      });
    } catch (err) {
      showAlert(err.message);
    }
  }

  document.getElementById('form-category').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-cat-id').value;
    const payload = {
      nombre: document.getElementById('cat-name-input').value,
      descripcion: document.getElementById('cat-desc-input').value
    };
    try {
      if (id) {
        await apiRequest(`/categories/${id}`, 'PUT', payload, true);
        showAlert('Categoría actualizada', 'success');
      } else {
        await apiRequest('/categories', 'POST', payload, true);
        showAlert('Categoría creada', 'success');
      }
      closeModal('modal-category');
      loadCategories();
    } catch (err) {
      showAlert(err.message);
    }
  });

  window.deleteCat = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await apiRequest(`/categories/${id}`, 'DELETE', null, true);
      showAlert('Categoría eliminada', 'success');
      loadCategories();
    } catch (err) {
      showAlert(err.message);
    }
  };

  // 4. MODERACIÓN DE RESEÑAS (CRUD)
  async function loadReviews() {
    const tbody = document.getElementById('tbody-all-reviews');
    try {
      const res = await apiRequest('/reviews/admin/all', 'GET', null, true);
      cacheReviews = res.data || [];
      renderReviewsTable(cacheReviews);
    } catch (err) {
      showAlert(err.message);
    }
  }

  function renderReviewsTable(list) {
    const tbody = document.getElementById('tbody-all-reviews');
    tbody.innerHTML = list.length ? '' : '<tr><td colspan="5">No hay reseñas encontradas.</td></tr>';
    list.forEach(rev => {
      tbody.innerHTML += `
        <tr>
          <td><strong>${rev.restaurante?.nombre || 'Restaurante'}</strong></td>
          <td>${rev.autor?.nombre || 'Anónimo'}</td>
          <td style="color: var(--accent-gold);">★ ${rev.calificacion}</td>
          <td style="max-width: 320px; font-size: 0.85rem;">${rev.comentario}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="deleteRev('${rev._id}')">Eliminar</button>
          </td>
        </tr>
      `;
    });
  }

  window.deleteRev = async (id) => {
    if (!confirm('¿Eliminar esta reseña? Se recalculará automáticamente el ranking del restaurante.')) return;
    try {
      await apiRequest(`/reviews/${id}`, 'DELETE', null, true);
      showAlert('Reseña eliminada y ranking recalculado', 'success');
      loadReviews();
    } catch (err) {
      showAlert(err.message);
    }
  };

  // Filtros de Reseñas
  const filterReviews = () => {
    const term = document.getElementById('review-search').value.toLowerCase();
    const stars = document.getElementById('review-stars-filter').value;
    const filtered = cacheReviews.filter(r => {
      const matchText = (r.restaurante?.nombre || '').toLowerCase().includes(term) ||
                        (r.autor?.nombre || '').toLowerCase().includes(term) ||
                        r.comentario.toLowerCase().includes(term);
      const matchStars = stars ? r.calificacion === parseInt(stars, 10) : true;
      return matchText && matchStars;
    });
    renderReviewsTable(filtered);
  };

  document.getElementById('review-search').addEventListener('input', filterReviews);
  document.getElementById('review-stars-filter').addEventListener('change', filterReviews);

  // Inicialización
  loadCategories();
  loadPending();
});