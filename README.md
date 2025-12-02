# Sonrisas y Colores Kids - Sistema de Gestión de Alquileres

## Requisitos Previos

- Node.js 18+ instalado
- PostgreSQL 12+ instalado y ejecutándose
- npm o yarn

## Configuración Local

### 1. Clonar el proyecto

\`\`\`bash
git clone <repository-url>
cd <project-name>
\`\`\`

### 2. Instalar dependencias

\`\`\`bash
npm install
\`\`\`

### 3. Configurar Base de Datos PostgreSQL

**Crear la base de datos (si no existe):**

\`\`\`bash
psql -U postgres -c "CREATE DATABASE dbSck;"
\`\`\`

**Ejecutar el script de inicialización:**

\`\`\`bash
psql -U postgres -d dbSck -f scripts/init-database.sql
\`\`\`

O si PostgreSQL solicita contraseña, ejecuta:

\`\`\`bash
psql -U postgres -W -d dbSck -f scripts/init-database.sql
# Contraseña: 1234
\`\`\`

### 4. Verificar la conexión

Para verificar que la base de datos está correctamente configurada:

\`\`\`bash
psql -U postgres -d dbSck -c "SELECT * FROM products;"
\`\`\`

### 5. Levantar el servidor de desarrollo

\`\`\`bash
npm run dev
\`\`\`

El servidor estará disponible en: \`http://localhost:3000\`

### 6. Acceder a la aplicación

Abre tu navegador y ve a \`http://localhost:3000\`

## Estructura de Carpetas

\`\`\`
.
├── app/
│   ├── api/                    # Rutas API
│   │   ├── products/           # CRUD de productos
│   │   └── rentals/            # CRUD de alquileres
│   ├── page.tsx               # Página principal
│   ├── layout.tsx             # Layout global
│   └── globals.css            # Estilos globales
├── components/
│   ├── dashboard.tsx          # Dashboard principal
│   ├── products/              # Componentes de productos
│   ├── rentals/               # Componentes de alquileres
│   ├── reports/               # Componentes de reportes
│   └── ui/                    # Componentes UI reutilizables
├── lib/
│   ├── db.ts                  # Conexión a PostgreSQL
│   └── types.ts               # TypeScript types
├── scripts/
│   └── init-database.sql      # Script de inicialización
├── .env.local                 # Variables de entorno
└── package.json               # Dependencias
\`\`\`

## Variables de Entorno

El archivo \`.env.local\` contiene:

\`\`\`
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=dbSck
DATABASE_USER=postgres
DATABASE_PASSWORD=1234
NEXT_PUBLIC_API_URL=http://localhost:3000
\`\`\`

## Scripts Disponibles

- \`npm run dev\` - Inicia el servidor de desarrollo
- \`npm run build\` - Construye la aplicación para producción
- \`npm start\` - Inicia el servidor de producción
- \`npm run lint\` - Ejecuta el linter

## Solución de Problemas

### "Error: connect ECONNREFUSED 127.0.0.1:5432"

PostgreSQL no está corriendo. En Linux/Mac:
\`\`\`bash
# Iniciar PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
\`\`\`

En Windows, abre PostgreSQL desde Services.

### "Error: database dbSck does not exist"

Crea la base de datos:
\`\`\`bash
psql -U postgres -c "CREATE DATABASE dbSck;"
\`\`\`

### "Error: La contraseña es incorrecta"

Verifica que la contraseña en \`.env.local\` coincida con tu configuración de PostgreSQL.

## API Endpoints

### Productos
- \`GET /api/products\` - Obtener todos los productos
- \`POST /api/products\` - Crear un producto
- \`GET /api/products/[id]\` - Obtener un producto
- \`PUT /api/products/[id]\` - Actualizar un producto
- \`DELETE /api/products/[id]\` - Eliminar un producto

### Alquileres
- \`GET /api/rentals\` - Obtener todos los alquileres
- \`POST /api/rentals\` - Crear un alquiler
- \`GET /api/rentals/reports?period=daily&days=30\` - Obtener reportes

## Características

- ✅ Gestión de productos con CRUD completo
- ✅ Sistema de alquileres con precios dinámicos
- ✅ Descuento para grupos (5+ niños = 4 × 1 hora)
- ✅ Reportes de ingresos diarios y semanales
- ✅ Dashboard con estadísticas
- ✅ Interfaz responsive
- ✅ Base de datos PostgreSQL integrada

## Contribuciones

Para reportar problemas o sugerencias, abre un issue o contacta al equipo.

## Licencia

Privado - Sonrisas y Colores Kids
