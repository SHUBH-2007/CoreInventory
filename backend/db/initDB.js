const db = require("./database");
db.serialize(() => {
  db.run(
    `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`,
  );

  db.run(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name TEXT NOT NULL,
  sku TEXT UNIQUE,
  category TEXT,
  unit_of_measure TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

  db.run(`
CREATE TABLE IF NOT EXISTS stock_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  type TEXT CHECK(type IN ('IN','OUT','TRANSFER')),
  quantity INTEGER NOT NULL,
  from_location INTEGER,
  to_location INTEGER,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(product_id) REFERENCES products(id),
  FOREIGN KEY(from_location) REFERENCES locations(id),
  FOREIGN KEY(to_location) REFERENCES locations(id)

)
`);

  db.run(`
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location_name TEXT NOT NULL UNIQUE
)
`);

  db.run(`
CREATE TABLE IF NOT EXISTS product_locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER,
  location_id INTEGER,
  quantity INTEGER DEFAULT 0,
  UNIQUE(product_id, location_id),
  FOREIGN KEY(product_id) REFERENCES products(id),
  FOREIGN KEY(location_id) REFERENCES locations(id)
)
`);
});
