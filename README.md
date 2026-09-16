# 🍽️ FoodieRank — Plataforma de Calificación y Rankings Gastronómicos

FoodieRank es una aplicación web full-stack construida con una arquitectura desacoplada para la exploración, registro, calificación y clasificación ponderada de restaurantes y platillos típicos e internacionales en Guatemala.

El sistema cuenta con un backend modular desarrollado en Node.js y Express conectado de forma directa mediante el driver nativo oficial de MongoDB (sin ORM/ODM como Mongoose), garantizando transacciones multi-documento reales (ACID), autenticación basada en JSON Web Tokens (JWT) y documentación interactiva con Swagger UI bajo versionado SemVer v1. La interfaz de usuario es un cliente web estático e independiente desarrollado en HTML5, CSS3 puro (diseño Dark Mode gastronómico) y JavaScript Vanilla, optimizado para el consumo asíncrono de APIs REST.

---

## 📋 Tabla de Contenidos

1. Características Principales
2. Stack Tecnológico
3. Estructura del Repositorio
4. Requisitos Previos
5. Instalación y Configuración
6. Población de Datos (Seeding)
7. Ejecución del Proyecto
8. Documentación de la API (Swagger & Endpoints)
9. Reglas de Negocio y Algoritmo de Ranking
10. Metodología SCRUM y Entregables

---

## ✨ Características Principales

* Transacciones ACID Reales: Procesamiento atómico en la creación de opiniones y emisión de votos con sesiones de MongoDB (session.withTransaction()), asegurando consistencia multi-documento.
* Seguridad y Control de Acceso (RBAC): Autenticación mediante tokens JWT y Passport.js, distinguiendo entre roles de usuario (crítico gastronómico) y admin (moderador).
* Catálogo Gastronómico Completo: Filtros dinámicos por categoría, vistas de menú con imágenes en fondo blanco, horarios y fotos de fachadas.
* Sistema de Votación y Moderación: Registro de likes y dislikes comunitarios (con bloqueo anti-autovoto) y panel de control administrativo por pestañas para moderación de propuestas.
* Protección de API: Limitador de tasa de peticiones (express-rate-limit), validaciones de entrada con express-validator y manejo de CORS.

---

## 🛠️ Stack Tecnológico

### Backend
* Entorno de Ejecución: Node.js (v20+ / v24+)
* Framework Web: Express.js (v4.x)
* Base de Datos: MongoDB Server / MongoDB Atlas (Driver oficial mongodb nativo)
* Autenticación y Criptografía: Passport.js, passport-jwt, jsonwebtoken, bcrypt
* Validación y Seguridad: express-validator, express-rate-limit, cors, dotenv
* Documentación: Swagger UI (swagger-ui-express)

### Frontend
* Estructura y Marcado: HTML5 semántico
* Estilos y Layout: CSS3 moderno (Variables CSS :root, CSS Grid, Flexbox, Soft Shadows)
* Lógica del Cliente: JavaScript puro (ES6+, Fetch API, almacenamiento local/sesión)

---

## 📁 Estructura del Repositorio

ProyectoFoodieRank/
├── foodierank-backend/
│   ├── src/
│   │   ├── config/             (Conexión nativa a Mongo y estrategias de Passport)
│   │   ├── controllers/        (Controladores: Auth, Categorías, Restaurantes, Reseñas)
│   │   ├── docs/               (Especificación OpenAPI 3.0: swagger.json)
│   │   ├── middlewares/        (Validadores de express-validator y guardián JWT/roles)
│   │   ├── routes/v1/          (Enrutadores versionados SemVer v1)
│   │   └── utils/              (Algoritmo matemático de ranking ponderado)
│   ├── .env                    (Variables de entorno - no versionado)
│   ├── .env.example            (Plantilla pública de variables)
│   ├── package.json            (Dependencias y scripts de Node.js)
│   ├── seed.js                 (Script de población de datos iniciales)
│   └── server.js               (Punto de entrada de la aplicación Express)
│
├── foodierank-frontend/
│   ├── assets/
│   │   └── css/
│   │       └── styles.css      (Sistema de diseño global: Dark Mode Gastronómico)
│   ├── js/
│   │   ├── admin.js            (Lógica del panel administrativo: Tabs, modales, CRUD)
│   │   ├── api.js              (Cliente HTTP fetch centralizado y guardián de sesión)
│   │   ├── auth.js             (Lógica de registro e inicio de sesión)
│   │   ├── index.js            (Renderizado dinámico de la Landing Page)
│   │   ├── restaurant-detail.js(Vista de detalle, menú de platos, votos y reseñas)
│   │   └── restaurants.js      (Catálogo, filtros y ordenamiento en memoria)
│   ├── admin.html              (Panel administrativo exclusivo)
│   ├── index.html              (Landing page principal)
│   ├── login.html              (Inicio de sesión)
│   ├── register.html           (Registro de usuarios)
│   ├── restaurant-detail.html  (Detalle de restaurante)
│   └── restaurants.html        (Catálogo general de restaurantes)
│
├── docs/                       (Documentación formal de arquitectura y planeación)
│   └── SCRUM_Planeacion.pdf    (Historias de usuario, roles y planeación de Sprints)
└── README.md                   (Documentación general del repositorio)

---

## 📦 Requisitos Previos

* Node.js instalado (versión 18 LTS, 20 LTS o superior).
* NPM (gestor de paquetes incluido con Node).
* Instancia local de MongoDB activa en el puerto 27017 o cluster configurado en MongoDB Atlas.
* Servidor web estático para el frontend (Live Server de VS Code o npx serve).

---

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio
git clone https://github.com/tu-usuario/ProyectoFoodieRank.git
cd ProyectoFoodieRank

### 2. Configurar el Backend
cd foodierank-backend
npm install

Crear el archivo .env en la raíz de foodierank-backend:
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017
DB_NAME=foodierank_db
JWT_SECRET=clave_secreta_para_firmar_jwt_foodierank_2026

---

## 🗄️ Población de Datos (Seeding)

Para cargar los 11 evaluadores iniciales, las categorías temáticas, los 8 restaurantes de Guatemala, los 24 platillos con imágenes y las 32 reseñas iniciales, ejecuta en foodierank-backend:

node seed.js

---

## 🚀 Ejecución del Proyecto

### Iniciar el Backend
En la carpeta foodierank-backend:
npm run dev

El servidor quedará escuchando en http://localhost:3000.

### Iniciar el Frontend
Lanza la extensión Live Server sobre index.html en VS Code o ejecuta en la carpeta foodierank-frontend:
npx serve . -l 5500

Visita la URL en tu navegador (ej. http://127.0.0.1:5500).

---

## 📖 Documentación de la API (Swagger & Endpoints)

La documentación interactiva OpenAPI 3.0 con Swagger UI se encuentra disponible en:
http://localhost:3000/api/v1/docs

### Resumen de Endpoints Principales (SemVer v1)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| POST | /api/v1/auth/register | Público | Registro de usuario o admin |
| POST | /api/v1/auth/login | Público | Autenticación y obtención de Bearer Token JWT |
| GET | /api/v1/categories | Público | Listar todas las categorías |
| POST | /api/v1/categories | Admin | Crear nueva categoría |
| PUT | /api/v1/categories/:id | Admin | Actualizar nombre/descripción de categoría |
| DELETE | /api/v1/categories/:id | Admin | Eliminar categoría |
| GET | /api/v1/restaurants | Público | Listar restaurantes aprobados (filtro categoriaId) |
| GET | /api/v1/restaurants/:id | Público | Detalle de restaurante con platillos aprobados |
| POST | /api/v1/restaurants | Autenticado | Registrar restaurante (pendiente de moderación) |
| GET | /api/v1/restaurants/admin/all | Admin | Listar la totalidad de restaurantes (aprobados y pendientes) |
| PATCH | /api/v1/restaurants/:id/approve | Admin | Aprobar restaurante para su publicación |
| PUT | /api/v1/restaurants/:id | Admin | Editar información de restaurante |
| DELETE | /api/v1/restaurants/:id | Admin | Eliminar restaurante y datos asociados |
| POST | /api/v1/restaurants/:id/dishes | Autenticado | Proponer platillo para un restaurante |
| PATCH | /api/v1/restaurants/dishes/:dishId/approve | Admin | Aprobar platillo propuesto |
| GET | /api/v1/reviews/restaurant/:id | Público | Listar opiniones asociadas a un restaurante |
| POST | /api/v1/reviews | Autenticado | Crear reseña (Transacción ACID con recálculo de ranking) |
| POST | /api/v1/reviews/:id/vote | Autenticado | Votar like / dislike (Transacción atómica, sin autovoto) |
| DELETE | /api/v1/reviews/:id | Autor/Admin | Eliminar reseña con recálculo transaccional |
| GET | /api/v1/reviews/admin/all | Admin | Listado global de reseñas para auditoría |

---

## 🧮 Reglas de Negocio y Algoritmo de Ranking

El ranking mostrado en las tarjetas y detalles utiliza una función ponderada (src/utils/ranking.js):

1. Decaimiento Temporal: Las opiniones recientes poseen mayor peso relativo que las emitidas con anterioridad:
   FactorTiempo = max(0.3, 1 / (1 + dias * 0.05))
2. Balance Comunitario: El peso de cada reseña escala según el respaldo comunitario (likes menos dislikes normalizados entre 0.8 y 1.2).
3. Atomicidad Multi-documento: Cada vez que una reseña se inserta, edita, elimina o recibe un voto, el cálculo del ranking se ejecuta dentro de la sesión activa de MongoDB (session.withTransaction()).

---

## 👥 Metodología SCRUM y Entregables

El proyecto se planificó y ejecutó bajo el marco de trabajo SCRUM, aplicando la convención de Conventional Commits (feat:, fix:, docs:) para el historial de control de versiones.

* Documentación PDF: Encuentra el archivo de planeación en /docs/SCRUM_Planeacion.pdf con el desglose de historias de usuario, roles de equipo y planificación de Sprints.
* Enlace a Video Demostrativo: [Enlace a Video de Presentación en YouTube / Drive](https://enlace-pendiente.com)
'@ | Out-File -FilePath "README.md" -Encoding utf8