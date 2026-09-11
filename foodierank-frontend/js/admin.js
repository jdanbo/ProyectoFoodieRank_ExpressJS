document.addEventListener('DOMContentLoaded', () => {
  // 1. Guardián de ruta: solo admin con token
  if (!Auth.getToken() || !Auth.isAdmin()) {
    alert('Acceso restringido a administradores.');
    window.location.href = 'login.html';
    return;
  }

  const alertBox = document.getElementById('admin-alert');
  const catForm = document.getElementById('create-category-form');
  const catSummary = document.getElementById('categories-summary');
  const pendingTbody = document.getElementById('pending-restaurants-tbody');
  const btnRefresh = document.getElementById('btn-refresh');

  function showAlert(msg, type = 'error') {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';
  }

  // 2. Cargar Categorías
  async function loadCategories() {
    try {
      const res = await apiRequest('/categories');
      if (res.ok && res.data) {
        catSummary.innerHTML = '';
        if (res.data.length === 0) {
          catSummary.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">No hay categorías creadas.</span>';
          return;
        }
        res.data.forEach(cat => {
          const badge = document.createElement('span');
          badge.className = 'badge badge-green';
          badge.textContent = cat.nombre;
          catSummary.appendChild(badge);
        });
      }
    } catch (err) {
      console.error('Error cargando categorías:', err.message);
    }
  }

  // 3. Crear Categoría (POST /categories con token)
  catForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-cat');
    const nombre = document.getElementById('cat-nombre').value.trim();
    const descripcion = document.getElementById('cat-desc').value.trim();

    try {
      btn.disabled = true;
      btn.textContent = 'Guardando...';

      await apiRequest('/categories', 'POST', { nombre, descripcion }, true);

      showAlert('Categoría creada exitosamente', 'success');
      catForm.reset();
      loadCategories();
    } catch (err) {
      showAlert(err.message || 'Error al crear categoría');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Guardar Categoría';
    }
  });

  // 4. Cargar Restaurantes Pendientes
  // Consumimos directamente la colección buscando los no aprobados
  async function loadPendingRestaurants() {
    pendingTbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Consultando solicitudes...</td></tr>';
    try {
      // Usamos el endpoint con filtro de estado o consultamos los registrados
      const res = await apiRequest('/restaurants');
      // En un endpoint real con vista admin se listan los pendientes. 
      // Si el endpoint público solo trae aprobados, el admin aprueba mediante su ID:
      renderPendingList(res.data || []);
    } catch (err) {
      pendingTbody.innerHTML = `<tr><td colspan="4" style="color: #f87171;">${err.message}</td></tr>`;
    }
  }

  function renderPendingList(restaurants) {
    pendingTbody.innerHTML = '';
    const pending = restaurants.filter(r => r.estado === 'pendiente');

    if (pending.length === 0) {
      pendingTbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 20px;">No hay restaurantes pendientes de moderación.</td></tr>';
      return;
    }

    pending.forEach(rest => {
      const tr = document.createElement('tr');
      const fecha = new Date(rest.fechaCreacion).toLocaleDateString('es-GT');
      tr.innerHTML = `
        <td><strong>${rest.nombre}</strong></td>
        <td style="color: var(--text-secondary);">${rest.ubicacion}</td>
        <td style="color: var(--text-muted);">${fecha}</td>
        <td>
          <button class="btn btn-primary action-btn" onclick="approve('${rest._id}')">
            Aprobar
          </button>
        </td>
      `;
      pendingTbody.appendChild(tr);
    });
  }

  // 5. Aprobar Restaurante (PATCH /restaurants/:id/approve)
  window.approve = async (id) => {
    try {
      await apiRequest(`/restaurants/${id}/approve`, 'PATCH', null, true);
      showAlert('Restaurante aprobado con éxito', 'success');
      loadPendingRestaurants();
    } catch (err) {
      showAlert(err.message || 'Error al aprobar restaurante');
    }
  };

  btnRefresh.addEventListener('click', loadPendingRestaurants);

  // Carga inicial
  loadCategories();
  loadPendingRestaurants();
});