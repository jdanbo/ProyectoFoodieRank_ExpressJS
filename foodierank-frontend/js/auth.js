document.addEventListener('DOMContentLoaded', () => {
  // Si ya hay sesión activa, redirigir directo al listado de restaurantes
  if (Auth.getToken()) {
    window.location.href = 'restaurants.html';
    return;
  }

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const alertBox = document.getElementById('auth-alert');

  // Helper para pintar alertas visuales
  function showAlert(message, type = 'error') {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';
  }

  // 1. Manejador de Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-submit');
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      try {
        btn.disabled = true;
        btn.textContent = 'Verificando...';

        const response = await apiRequest('/auth/login', 'POST', { email, password });

        if (response.ok && response.token) {
          // Guardar token JWT y datos de usuario en localStorage
          Auth.setSession(response.token, response.user);
          showAlert('Ingreso exitoso. Redirigiendo...', 'success');

          setTimeout(() => {
            // Si es administrador, redirigir al panel; si no, al catálogo
            window.location.href = response.user.rol === 'admin' ? 'admin.html' : 'restaurants.html';
          }, 1000);
        }
      } catch (error) {
        showAlert(error.message || 'Error al iniciar sesión');
        btn.disabled = false;
        btn.textContent = 'Ingresar';
      }
    });
  }

  // 2. Manejador de Registro
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-submit');
      const nombre = document.getElementById('nombre').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const rol = document.getElementById('rol').value;

      try {
        btn.disabled = true;
        btn.textContent = 'Registrando...';

        const response = await apiRequest('/auth/register', 'POST', {
          nombre,
          email,
          password,
          rol
        });

        if (response.ok) {
          showAlert('¡Cuenta creada con éxito! Redirigiendo al login...', 'success');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1500);
        }
      } catch (error) {
        showAlert(error.message || 'Error al procesar registro');
        btn.disabled = false;
        btn.textContent = 'Crear Cuenta';
      }
    });
  }
});