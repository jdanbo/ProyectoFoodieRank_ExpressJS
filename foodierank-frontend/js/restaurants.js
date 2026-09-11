document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('restaurants-grid');
  const categoryFilter = document.getElementById('category-filter');
  const sortFilter = document.getElementById('sort-filter');
  const statusMessage = document.getElementById('status-message');

  let currentRestaurants = [];

  function showMessage(msg, type = 'error') {
    if (!statusMessage) return;
    statusMessage.textContent = msg;
    statusMessage.className = `alert alert-${type}`;
    statusMessage.style.display = 'block';
  }

  function clearMessage() {
    if (statusMessage) statusMessage.style.display = 'none';
  }

  // 1. Cargar selector de Categorías
  async function loadCategories() {
    try {
      const response = await apiRequest('/categories');
      if (response.ok && response.data) {
        response.data.forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat._id;
          opt.textContent = cat.nombre;
          categoryFilter.appendChild(opt);
        });
      }
    } catch (err) {
      console.error('Error cargando categorías:', err.message);
    }
  }

  // 2. Obtener Restaurantes (con filtro de categoría opcional)
  async function fetchRestaurants(categoryId = '') {
    clearMessage();
    grid.innerHTML = '<p style="color: var(--text-secondary);">Cargando restaurantes...</p>';

    try {
      const endpoint = categoryId ? `/restaurants?categoriaId=${categoryId}` : '/restaurants';
      const response = await apiRequest(endpoint);

      if (response.ok) {
        currentRestaurants = response.data;
        applySortingAndRender();
      }
    } catch (err) {
      grid.innerHTML = '';
      showMessage(err.message || 'No se pudieron obtener los restaurantes.');
    }
  }

  // 3. Ordenar y Renderizar Cards
  function applySortingAndRender() {
    const sortBy = sortFilter.value;

    let sorted = [...currentRestaurants];

    if (sortBy === 'ranking-desc') {
      sorted.sort((a, b) => (b.ranking || 0) - (a.ranking || 0));
    } else if (sortBy === 'reviews-desc') {
      sorted.sort((a, b) => (b.totalResenas || 0) - (a.totalResenas || 0));
    }

    renderCards(sorted);
  }

  function renderCards(restaurants) {
    grid.innerHTML = '';

    if (!restaurants || restaurants.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
          No se encontraron restaurantes aprobados en esta categoría.
        </div>
      `;
      return;
    }

    restaurants.forEach(rest => {
      const card = document.createElement('article');
      card.className = 'card restaurant-card';

      // Imagen fallback si no tiene URL
      const imgSource = rest.imagenUrl && rest.imagenUrl.trim() !== ''
        ? rest.imagenUrl
        : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80';

      const rankingDisplay = (rest.ranking !== undefined && rest.ranking !== null)
        ? Number(rest.ranking).toFixed(1)
        : '0.0';

      card.innerHTML = `
        <div>
          <img src="${imgSource}" alt="${rest.nombre}" class="restaurant-img" onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80'">
          <div class="card-meta">
            <span class="badge badge-green">Aprobado</span>
            <div class="rating-pill">
              <span>★</span>
              <span>${rankingDisplay}</span>
              <small style="color: var(--text-muted); font-size: 0.75rem;">(${rest.totalResenas || 0})</small>
            </div>
          </div>
          <h2 style="font-size: 1.25rem; margin-bottom: 8px;">${rest.nombre}</h2>
          <p style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${rest.descripcion}
          </p>
          <p style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 20px;">
            📍 ${rest.ubicacion}
          </p>
        </div>
        <a href="restaurant-detail.html?id=${rest._id}" class="btn btn-primary" style="width: 100%;">
          Ver Detalles y Platos
        </a>
      `;

      grid.appendChild(card);
    });
  }

  // Event Listeners para Filtros
  categoryFilter.addEventListener('change', (e) => {
    fetchRestaurants(e.target.value);
  });

  sortFilter.addEventListener('change', () => {
    applySortingAndRender();
  });

  // Inicio
  loadCategories();
  fetchRestaurants();
});