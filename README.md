# 👟 PuntoZapas Backend - Guía para el Frontend

Este documento contiene todo lo necesario para inicializar el proyecto en local y entender cómo consumir los principales módulos de la API.

---

## 🚀 1. ¿Cómo inicializar el proyecto?

Sigue estos pasos si acabas de clonar el repositorio o si la base de datos se ha desincronizado:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```
2. **Variables de entorno:**
   Asegúrate de tener tu archivo `.env` en la raíz del proyecto con tu cadena de conexión a PostgreSQL (variable `DATABASE_URL`).
3. **Generar Cliente de Prisma:**
   Este comando lee el `schema.prisma` y genera el cliente tipado necesario para que el backend compile sin errores.
   ```bash
   npx prisma generate
   ```
4. **Resetear Base de Datos y ejecutar el Seeder:**
   Este comando borrará la BD actual, recreará las tablas e insertará datos de prueba.
   ```bash
   npx prisma migrate reset
   ```
5. **Levantar el servidor en desarrollo:**
   ```bash
   npm run start:dev
   ```

---

## 🏗️ 2. Arquitectura del Proyecto

El backend está construido con **NestJS** y **Prisma ORM**. Para garantizar escalabilidad, utilizamos el **Patrón de Arquitectura de 3 Capas**:
1. **Controladores:** Reciben las peticiones HTTP (GET, POST), validan los DTOs y retornan las respuestas.
2. **Servicios:** Contienen toda la lógica de negocio (reglas, validaciones, encriptación).
3. **Repositorios:** Se encargan exclusivamente de la comunicación con la base de datos a través de Prisma.

---

## 🔌 3. Módulos y Endpoints Disponibles

### 🛒 A. Módulo de Carrito (Público)
Este módulo se utiliza para validar si hay stock suficiente en inventario **antes** de que el cliente finalice una compra.
- `POST /carrito/agregar`
  - **Auth:** No requiere (Público).
  - **Body esperado:**
    ```json
    {
      "varianteId": 1,
      "cantidad": 2
    }
    ```
  - **Comportamiento:** Si hay stock devuelve `200 OK`. Si la cantidad supera el inventario (o si el stock es 0), devuelve `400 Bad Request` ("Stock insuficiente").

### 📦 B. Módulo de Productos (Catálogo)
Maneja el catálogo completo. Las lecturas son públicas (para los clientes), pero las modificaciones son exclusivas para administradores.
- `GET /productos` **(Público)**
  - Retorna la lista de productos. 
  - **Filtros Soportados (Query Params):** `?category=Running&maxPrice=50000&marca=Nike`
- `GET /productos/:id` **(Público)**
  - Retorna el detalle de un producto específico, incluyendo sus variantes e inventario.
- `POST /productos` | `PATCH /productos/:id` | `DELETE /productos/:id`
  - **Auth:** Requiere JWT (`Authorization: Bearer <token>`).
  - **Rol:** Solo para usuarios `ADMIN`. 

### 🔐 C. Módulo de Auth (Seguridad)
Gestiona el inicio de sesión y la generación de Tokens JWT.
- `POST /auth/login`
  - **Body esperado:** `{ "email": "...", "password": "..." }`
  - **Retorno:** Un JWT que el frontend debe guardar (ej. LocalStorage o Cookies) para enviarlo en las peticiones protegidas.

### 👥 D. Módulo de Usuarios (Staff)
Maneja a los empleados del sistema (Administradores y Vendedores).
- **Endpoints CRUD:** `GET /users`, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id`.
- **Comportamiento:** La contraseña (`password_hash`) se encripta automáticamente en el backend utilizando `bcrypt`. Nunca se devuelve la contraseña en los endpoints GET.
- **Roles:** El modelo admite roles como `ADMIN` y `VENDEDOR`.

---

## 🛠️ Notas Adicionales para el Frontend

- **Validación de Datos (DTOs):** Si envías un campo que no existe en el JSON, o si omites un campo obligatorio, el backend arrojará automáticamente un Error `400 Bad Request` indicando exactamente qué campo falló (gracias a `class-validator`). Revisa siempre las respuestas de error en la consola del navegador.
- **CamelCase:** Asegúrate de enviar siempre los JSONs utilizando CamelCase (ej. `varianteId`, no `variante_id`).
