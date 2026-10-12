# FoodieRank — Plataforma de restaurantes de Guatemala

Aplicación full stack para **explorar, calificar y administrar restaurantes**. Un backend REST en **Node.js + Express + MongoDB** y un cliente web en **HTML5, CSS3 y JavaScript vanilla**, en un solo repositorio.

| Parte | Carpeta | Tecnologías |
| --- | --- | --- |
| API REST | raíz del repo (`server.js`, `src/`) | Node.js, Express 5, MongoDB (driver nativo), JWT, Passport, Swagger UI |
| Cliente web | [`foodierank-frontend/`](foodierank-frontend/) | HTML5 semántico, CSS3 (Dark Mode), JavaScript ES6+ con Fetch API |

---

## Qué hace

**Para comensales y críticos**
- Explorar restaurantes por categoría gastronómica, ordenados por un **ranking ponderado**.
- Ver el detalle de cada restaurante: horarios, dirección, galería y menú de platillos.
- Publicar calificaciones y reseñas, y votar reseñas de la comunidad con likes y dislikes.

**Para administradores**
- Panel protegido por roles (`usuario` / `admin`) para moderar solicitudes y gestionar categorías.

**En el servidor**
- Autenticación con JWT y contraseñas cifradas con bcrypt.
- Validación de datos con `express-validator` y limitación de peticiones con `express-rate-limit`.
- Reseñas guardadas con **transacciones multi-documento** (`session.withTransaction()`), para que la reseña y las métricas del restaurante se actualicen juntas.
- Rutas versionadas bajo `/api/v1/` y documentación interactiva con **Swagger UI** (22 rutas documentadas).

---

## Arquitectura del backend

Cada petición recorre las capas en este orden:

```text
ruta → validadores → controlador → servicio → repositorio → MongoDB
```

```text
.
├── server.js                  # Punto de entrada de Express
├── seed.js                    # Datos de ejemplo
├── .env.example               # Plantilla de variables de entorno
├── src/
│   ├── config/                # Conexión a MongoDB, índices, esquemas y Passport
│   ├── routes/v1/             # auth, categories, restaurants, reviews
│   ├── middlewares/           # Validadores, control de roles y manejo de errores
│   ├── controllers/           # Reciben la petición HTTP y responden
│   ├── services/              # Lógica de negocio
│   ├── repositories/          # Acceso a datos
│   ├── dtos/                  # Objetos de transferencia de datos
│   ├── errors/                # Error de aplicación (AppError)
│   ├── utils/                 # Ranking ponderado y manejo de errores async
│   └── docs/swagger.json      # Especificación OpenAPI para Swagger UI
└── foodierank-frontend/       # Cliente web
    ├── *.html                 # index, restaurants, restaurant-detail, login, register, crear, admin
    ├── js/                    # api.js (cliente HTTP), auth.js y un script por página
    └── assets/css/styles.css
```

**Decisiones técnicas**
- **Driver nativo de MongoDB, sin Mongoose:** las consultas se ejecutan directamente, y los índices y las validaciones de esquema se aplican al arrancar.
- **Ranking ponderado:** el puntaje de un restaurante no es un promedio simple, usa decaimiento temporal y factores de normalización (`src/utils/ranking.js`).
- **Separación de responsabilidades:** las rutas no tocan la base de datos, los controladores no contienen lógica de negocio y los repositorios son la única capa que habla con MongoDB.

---

## Instalación y uso

### Requisitos
- Node.js 20 o superior
- MongoDB local o una base en MongoDB Atlas

### 1. Clonar e instalar

```bash
git clone https://github.com/jdanbo/ProyectoFoodieRank_ExpressJS.git
cd ProyectoFoodieRank_ExpressJS
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Abre `.env` y completa los valores:

| Variable | Para qué sirve |
| --- | --- |
| `PORT` | Puerto del servidor (por defecto `3000`) |
| `MONGO_URI` | Cadena de conexión a MongoDB |
| `DB_NAME` | Nombre de la base de datos |
| `JWT_SECRET` | Secreto para firmar los tokens. **Genera uno propio y no lo compartas.** |

Para generar un `JWT_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> El archivo `.env` está en `.gitignore`: tus credenciales nunca se suben al repositorio.

### 3. Cargar datos de ejemplo

```bash
npm run seed
```

Carga los evaluadores, las categorías, 8 restaurantes de Guatemala, sus 24 platillos y 32 reseñas iniciales.

### 4. Iniciar la API

```bash
npm run dev     # desarrollo, con recarga automática
npm start       # producción
```

La API queda en `http://localhost:3000`:

- Salud del servicio: `http://localhost:3000/api/v1/health`
- Documentación interactiva: `http://localhost:3000/api/v1/docs`

### 5. Abrir el cliente web

```bash
npx serve foodierank-frontend -l 5500
```

Abre `http://127.0.0.1:5500/index.html`. En `localhost` el cliente usa la API local en el puerto `3000`; en otros dominios usa la API desplegada. Para apuntar a tu propia API, cambia `API_BASE_URL` en [`foodierank-frontend/js/api.js`](foodierank-frontend/js/api.js).

---

## Documentación del proyecto

- **Gestión Scrum (historias de usuario y sprints):** [Documento de Google](https://docs.google.com/document/d/1ZdPrpuVyVtcwK9uh6lvDYAOt5dmnCqEglI8vPQoFpfU/edit?usp=sharing)
- **Video de presentación:** [Carpeta de Drive](https://drive.google.com/drive/folders/14NkUhoAEqI5eM32O_M593R8yARzNK0_q?usp=drive_link)

---

## Créditos

Proyecto desarrollado en equipo durante el bootcamp de Desarrollo de Software de **Campuslands**.
Mantenido por **Daniel Borja** · [@jdanbo](https://github.com/jdanbo)
