document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const restaurantId = urlParams.get('id');

  const alertBox = document.getElementById('detail-alert');
  const infoContainer = document.getElementById('restaurant-info');
  const dishesContainer = document.getElementById('dishes-container');
  const reviewsContainer = document.getElementById('reviews-list');
  const reviewFormSection = document.getElementById('review-form-section');
  const loginPrompt = document.getElementById('login-prompt');
  const reviewForm = document.getElementById('add-review-form');

  if (!restaurantId) {
    window.location.href = 'restaurants.html';
    return;
  }

  function showAlert(message, type = 'error') {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';
  }

  // 1. Cargar Info de Restaurante y Platos
  async function loadRestaurant() {
    try {
      const response = await apiRequest(`/restaurants/${restaurantId}`);
      if (response.ok && response.data) {
        renderRestaurant(response.data);
      }
    } catch (err) {
      showAlert(err.message || 'Error al cargar el restaurante');
    }
  }

  function renderRestaurant(r) {
    const imgSource = r.imagenUrl && r.imagenUrl.trim() !== ''
      ? r.imagenUrl
      : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80';

    infoContainer.innerHTML = `
      <img src="${imgSource}" alt="${r.nombre}" class="detail-img" onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80'">
      <div>
        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
          <span class="badge badge-green">Aprobado</span>
          <span class="badge badge-gold">★ ${Number(r.ranking || 0).toFixed(1)} Ponderado</span>
        </div>
        <h1 style="font-size: 2.2rem; margin-bottom: 15px;">${r.nombre}</h1>
        <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 1rem;">${r.descripcion}</p>
        <p style="color: var(--text-muted); font-size: 0.9rem;">📍 Ubicación: <strong style="color: var(--text-primary);">${r.ubicacion}</strong></p>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 5px;">Total de Reseñas: <strong>${r.totalResenas || 0}</strong></p>
      </div>
    `;

    // Platos
    dishesContainer.innerHTML = '';
    if (!r.platos || r.platos.length === 0) {
      dishesContainer.innerHTML = '<p style="color: var(--text-muted); grid-column: 1 / -1;">No hay platos registrados aún en este restaurante.</p>';
    } else {
      r.platos.forEach(dish => {
        const dishEl = document.createElement('div');
        dishEl.className = 'dish-card';
        dishEl.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="font-size: 1.05rem;">${dish.nombre}</strong>
            <span style="color: var(--accent-gold); font-weight: 600;">$${Number(dish.precio).toFixed(2)}</span>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.85rem;">${dish.descripcion}</p>
        `;
        dishesContainer.appendChild(dishEl);
      });
    }
  }

  // 2. Cargar Reseñas del Restaurante
  async function loadReviews() {
    try {
      const response = await apiRequest(`/reviews/restaurant/${restaurantId}`);
      if (response.ok) {
        renderReviews(response.data);
      }
    } catch (err) {
      console.error('Error cargando reseñas:', err.message);
    }
  }

  function renderReviews(reviews) {
    reviewsContainer.innerHTML = '';
    if (!reviews || reviews.length === 0) {
      reviewsContainer.innerHTML = '<p style="color: var(--text-secondary); padding: 15px 0;">Sé el primero en calificar este restaurante.</p>';
      return;
    }

    const currentUser = Auth.getUser();

    reviews.forEach(rev => {
      const div = document.createElement('div');
      div.className = 'review-item';

      const stars = '★'.repeat(rev.calificacion) + '☆'.repeat(5 - rev.calificacion);
      const isAuthor = currentUser && currentUser.id === rev.autor._id;

      div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong>${rev.autor.nombre}</strong>
          <span style="color: var(--accent-gold);">${stars}</span>
        </div>
        <p style="color: var(--text-primary); margin-bottom: 12px; font-size: 0.95rem;">${rev.comentario}</p>
        <div style="display: flex; gap: 10px; align-items: center;">
          <button class="vote-btn" onclick="handleVote('${rev._id}', 'like')" ${isAuthor ? 'disabled title="No puedes votar tu propia reseña"' : ''}>
            👍 ${rev.likesCount || 0}
          </button>
          <button class="vote-btn" onclick="handleVote('${rev._id}', 'dislike')" ${isAuthor ? 'disabled title="No puedes votar tu propia reseña"' : ''}>
            👎 ${rev.dislikesCount || 0}
          </button>
        </div>
      `;
      reviewsContainer.appendChild(div);
    });
  }

  // 3. Manejador de Votos (Like/Dislike)
  window.handleVote = async (reviewId, tipo) => {
    if (!Auth.getToken()) {
      window.location.href = 'login.html';
      return;
    }
    try {
      await apiRequest(`/reviews/${reviewId}/vote`, 'POST', { tipo }, true);
      // Recargar datos tras la transacción
      loadReviews();
      loadRestaurant();
    } catch (err) {
      showAlert(err.message || 'Error al procesar voto');
    }
  };

  // 4. Formulario de Publicación de Reseña
  if (Auth.getToken()) {
    reviewFormSection.style.display = 'block';
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-submit-review');
      const calificacion = document.getElementById('calificacion').value;
      const comentario = document.getElementById('comentario').value.trim();

      try {
        btn.disabled = true;
        btn.textContent = 'Enviando...';

        await apiRequest('/reviews', 'POST', {
          restauranteId,
          calificacion,
          comentario
        }, true);

        showAlert('Reseña registrada con éxito', 'success');
        reviewForm.reset();
        loadRestaurant();
        loadReviews();
      } catch (err) {
        showAlert(err.message || 'Error al guardar la reseña');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Publicar Reseña';
      }
    });
  } else {
    loginPrompt.style.display = 'block';
  }

  // Arranque
  loadRestaurant();
  loadReviews();
});