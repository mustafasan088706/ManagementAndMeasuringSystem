const Database = require('better-sqlite3');
const path = require('path');

try {
  // Veritabanı bağlantısını oluştur
  const db = new Database(path.join(process.cwd(), 'ManagementSystem.db'), {
    verbose: console.log
  });

  // Foreign key kısıtlamalarını etkinleştir
  db.pragma('foreign_keys = ON');

  // Tabloları oluştur
  db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      company TEXT,
      security_question TEXT NOT NULL,
      security_answer TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      is_active BOOLEAN DEFAULT 1,
      role TEXT DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS UserSessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Users(id)
    );

    CREATE TABLE IF NOT EXISTS PasswordResets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      reset_token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_used BOOLEAN DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES Users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email);
    CREATE INDEX IF NOT EXISTS idx_users_active ON Users(is_active);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON UserSessions(session_token);
    CREATE INDEX IF NOT EXISTS idx_resets_token ON PasswordResets(reset_token);
  `);

  console.log('Database tables created successfully');
  db.close();
} catch (error) {
  console.error('Database initialization error:', error);
  process.exit(1);
} 