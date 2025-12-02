# Guía de Configuración - Sonrisas y Colores Kids

## Paso 1: Instalación de Dependencias

Added --legacy-peer-deps flag to avoid npm conflicts with React 19 and vaul package

\`\`\`bash
npm install --legacy-peer-deps
\`\`\`

## Paso 2: Crear Base de Datos PostgreSQL

Abre una terminal y ejecuta:

\`\`\`bash
# Crear la base de datos
psql -U postgres -c "CREATE DATABASE dbSck;"
\`\`\`

Si PostgreSQL te pide contraseña, usa: `1234`

## Paso 3: Ejecutar Script de Inicialización

\`\`\`bash
# Ejecutar el script SQL para crear las tablas
psql -U postgres -d dbSck -f scripts/init-database.sql
\`\`\`

Si necesita contraseña:
\`\`\`bash
psql -U postgres -W -d dbSck -f scripts/init-database.sql
# Contraseña: 1234
\`\`\`

## Paso 4: Verificar Conexión

\`\`\`bash
# Verificar que las tablas fueron creadas
psql -U postgres -d dbSck -c "SELECT * FROM products;"
\`\`\`

Deberías ver la tabla con los 3 productos de ejemplo.

## Paso 5: Iniciar el Servidor

\`\`\`bash
npm run dev
\`\`\`

Abre tu navegador en: **http://localhost:3000**

## Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
PostgreSQL no está ejecutándose.

**En Windows:**
- Abre Servicios (Services) y busca "PostgreSQL"
- Haz clic derecho > Iniciar

**En macOS:**
\`\`\`bash
brew services start postgresql
\`\`\`

**En Linux:**
\`\`\`bash
sudo systemctl start postgresql
\`\`\`

### Error: "database dbSck does not exist"
Crea la base de datos:
\`\`\`bash
psql -U postgres -c "CREATE DATABASE dbSck;"
\`\`\`

### Error: "La contraseña es incorrecta"
Verifica que \`.env.local\` tenga:
\`\`\`
DATABASE_PASSWORD=1234
\`\`\`

## Principales Funcionalidades

✅ **Gestión de Categorías** - Crear categorías de productos y alquileres  
✅ **Gestión de Productos** - CRUD completo con categorías  
✅ **Sistema de Alquileres** - Crear y gestionar alquileres  
✅ **Descuentos Automáticos** - 5+ niños = 4 × 1 hora = S/ 100  
✅ **Ventas de Productos** - Registrar ventas de golosinas, libros, etc.  
✅ **Alquileres por Día** - Ver alquileres de un día específico  
✅ **Reportes** - Ingresos diarios y semanales, descargar Excel/PDF  
✅ **Dashboard** - Estadísticas en tiempo real  
✅ **API REST** - Endpoints para todas las operaciones  

## API Endpoints

\`\`\`
GET    /api/categories             - Listar categorías
POST   /api/categories             - Crear categoría
PUT    /api/categories/[id]        - Actualizar categoría
DELETE /api/categories/[id]        - Eliminar categoría

GET    /api/products               - Listar productos
POST   /api/products               - Crear producto
GET    /api/products/[id]          - Obtener producto
PUT    /api/products/[id]          - Actualizar producto
DELETE /api/products/[id]          - Eliminar producto

GET    /api/rentals                - Listar alquileres
POST   /api/rentals                - Crear alquiler
PUT    /api/rentals/[id]           - Actualizar alquiler
DELETE /api/rentals/[id]           - Eliminar alquiler
GET    /api/rentals/by-date        - Alquileres por fecha
GET    /api/rentals/reports        - Reportes de ingresos

GET    /api/sales                  - Listar ventas
POST   /api/sales                  - Crear venta
PUT    /api/sales/[id]             - Actualizar venta
DELETE /api/sales/[id]             - Eliminar venta
\`\`\`

## Variables de Entorno

El archivo \`.env.local\` ya está configurado:
\`\`\`
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=dbSck
DATABASE_USER=postgres
DATABASE_PASSWORD=1234
NEXT_PUBLIC_API_URL=http://localhost:3000
\`\`\`

## Próximos Pasos

1. **Crear Categorías** - Ve a "Gestionar Categorías" para crear tus propias categorías
2. **Agregar Productos** - Ve a "Gestión de Productos" y crea productos
3. **Registrar Alquileres** - Ve a "Alquileres" y haz clic en "Nuevo Alquiler"
4. **Vender Productos** - Ve a "Ventas de Productos" para registrar ventas
5. **Ver Alquileres del Día** - Ve a "Alquileres por Día" para ver actividad diaria
6. **Generar Reportes** - Ve a "Reportes" para descargar en Excel o PDF

¡Listo! Tu aplicación está lista para usar.
