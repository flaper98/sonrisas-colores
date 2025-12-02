-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  product_type VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Rentals Table
CREATE TABLE IF NOT EXISTS rentals (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  num_children INT NOT NULL,
  duration_minutes INT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  discount_applied BOOLEAN DEFAULT FALSE,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Sales Table (for product sales)
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL, -- 'rental' or 'sale'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rentals_created_at ON rentals(created_at);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_start_time ON rentals(start_time);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Insert Sample Categories
INSERT INTO categories (name, type) VALUES
  ('Juegos Inflables', 'rental'),
  ('Entretenimiento', 'rental'),
  ('Equipos', 'rental'),
  ('Golosinas', 'sale'),
  ('Galletas', 'sale'),
  ('Bebidas', 'sale'),
  ('Libros', 'sale'),
  ('Juguetes', 'sale')
ON CONFLICT (name) DO NOTHING;


ALTER TABLE products
    ADD COLUMN min_stock INT DEFAULT 0;



-- Insert Sample Products
INSERT INTO products (name, category, price, quantity, product_type, description)
VALUES 
  ('Parque de Trampolines', 'Entretenimiento', 25.00, 1, 'rental', 'Zona de trampolines para saltar y divertirse'),
  ('Castillo Inflable', 'Juegos Inflables', 25.00, 1, 'rental', 'Castillo inflable gigante'),
  ('Piscina de Pelotas', 'Entretenimiento', 20.00, 2, 'rental', 'Piscina llena de pelotas de colores'),
  ('Bolsa de Golosinas Mix', 'Golosinas', 15.00, 50, 'sale', 'Variedad de caramelos y chocolates'),
  ('Paquete de Galletas', 'Galletas', 8.00, 30, 'sale', 'Galletas surtidas'),
  ('Libro Infantil - Aventuras', 'Libros', 25.00, 10, 'sale', 'Libro de aventuras para niños'),
  ('Jugo Natural', 'Bebidas', 5.00, 40, 'sale', 'Jugo natural de frutas'),
  ('Peluche de Personaje', 'Juguetes', 35.00, 15, 'sale', 'Peluche coleccionable')
ON CONFLICT DO NOTHING;
