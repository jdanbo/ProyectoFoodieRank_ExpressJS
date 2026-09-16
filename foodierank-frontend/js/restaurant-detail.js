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

  function showAlert(msg, type = 'error') {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';
  }

  async function loadRestaurant() {
    try {
      const res = await apiRequest(`/restaurants/${restaurantId}`);
      if (res.ok && res.data) {
        renderRestaurant(res.data);
      }
    } catch (err) {
      showAlert(err.message || 'Error cargando información');
    }
  }

  function renderRestaurant(r) {
    const f1 = r.imagenUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
    const f2 = r.imagenFachada2 || f1;

    infoContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <img src="${f1}" alt="${r.nombre}" class="detail-img">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <img src="${f1}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 6px;">
          <img src="${f2}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 6px;">
        </div>
      </div>
      <div>
        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 12px;">
          <span class="badge badge-green">Aprobado</span>
          <span class="badge badge-gold">★ ${Number(r.ranking || 0).toFixed(1)} Ponderado</span>
          <span style="color: var(--text-muted); font-size: 0.85rem;">(${r.totalResenas || 0} reseñas)</span>
        </div>
        <h1 style="font-size: 2.3rem; margin-bottom: 15px; color: var(--text-primary);">${r.nombre}</h1>
        <p style="color: var(--text-secondary); font-size: 1.05rem; line-height: 1.7; margin-bottom: 20px;">${r.descripcion}</p>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 6px;">📍 <strong>Ubicación:</strong> ${r.ubicacion}</p>
        <p style="color: var(--text-muted); font-size: 0.95rem;">🕒 <strong>Horario:</strong> ${r.horario || 'Lunes a Domingo'}</p>
      </div>
    `;

    // Renderizar menú de platillos con fotos de fondo blanco
    dishesContainer.innerHTML = '';
    if (!r.platos || r.platos.length === 0) {
      dishesContainer.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">No hay platillos disponibles aún.</p>';
    } else {
      r.platos.forEach(dish => {
        const d = document.createElement('div');
        d.className = 'card';
        d.style.padding = '14px';
        d.innerHTML = `
          <div style="background-color: #FFFFFF; border-radius: 8px; padding: 8px; margin-bottom: 12px; display: flex; justify-content: center; align-items: center; height: 160px;">
            <img src="${dish.imagenUrl}" alt="${dish.nombre}" style="max-height: 100%; max-width: 100%; object-fit: contain;">
          </div>
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
            <h3 style="font-size: 1.05rem; color: var(--text-primary);">${dish.nombre}</h3>
            <span style="color: var(--accent-gold); font-weight: 700; font-size: 1.1rem;">Q ${Number(dish.precio).toFixed(2)}</span>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">${dish.descripcion}</p>
        `;
        dishesContainer.appendChild(d);
      });
    }
  }

  async function loadReviews() {
    try {
      const res = await apiRequest(`/reviews/restaurant/${restaurantId}`);
      if (res.ok) {
        renderReviews(res.data);
      }
    } catch (err) {
      console.error(err);
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
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background-color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700;">
              ${rev.autor.nombre.charAt(0)}
            </div>
            <div>
              <strong style="color: var(--text-primary); font-size: 0.95rem;">${rev.autor.nombre}</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${new Date(rev.fechaCreacion).toLocaleDateString()}</div>
            </div>
          </div>
          <span style="color: var(--accent-gold); font-size: 1.1rem;">${stars}</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 12px;">${rev.comentario}</p>
        <div style="display: flex; gap: 8px;">
          <button class="vote-btn" onclick="handleVote('${rev._id}', 'like')" ${isAuthor ? 'disabled' : ''}>
            👍 ${rev.likesCount || 0}
          </button>
          <button class="vote-btn" onclick="handleVote('${rev._id}', 'dislike')" ${isAuthor ? 'disabled' : ''}>
            👎 ${rev.dislikesCount || 0}
          </button>
        </div>
      `;
      reviewsContainer.appendChild(div);
    });
  }

  window.handleVote = async (reviewId, tipo) => {
    if (!Auth.getToken()) {
      window.location.href = 'login.html';
      return;
    }
    try {
      await apiRequest(`/reviews/${reviewId}/vote`, 'POST', { tipo }, true);
      loadReviews();
      loadRestaurant();
    } catch (err) {
      showAlert(err.message || 'Error al procesar voto');
    }
  };

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

        showAlert('¡Reseña registrada con éxito!', 'success');
        reviewForm.reset();
        loadRestaurant();
        loadReviews();
      } catch (err) {
        showAlert(err.message || 'Error al enviar reseña');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Publicar Reseña';
      }
    });
  } else {
    loginPrompt.style.display = 'block';
  }

  loadRestaurant();
  loadReviews();
});