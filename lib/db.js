const Database = require('better-sqlite3');
const path = require('path');

// Veritabanı yolunu process.env'den al
const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'ManagementSystem.db');

let db;

try {
  db = new Database(dbPath, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : null
  });
  
  // Foreign key kısıtlamalarını etkinleştir
  db.pragma('foreign_keys = ON');
  
} catch (error) {
  console.error('Database connection error:', error);
  process.exit(1);
}

// Tabloları oluştur
function initializeDatabase() {
  // Users tablosu
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

    CREATE TABLE IF NOT EXISTS Projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      start_date DATE,
      end_date DATE,
      status TEXT DEFAULT 'active',
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES Users(id)
    );

    CREATE TABLE IF NOT EXISTS Tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      assigned_to INTEGER,
      due_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES Projects(id),
      FOREIGN KEY (assigned_to) REFERENCES Users(id)
    );

    CREATE TABLE IF NOT EXISTS Measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      metric_name TEXT NOT NULL,
      metric_value REAL NOT NULL,
      unit TEXT,
      measured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      recorded_by INTEGER NOT NULL,
      notes TEXT,
      FOREIGN KEY (project_id) REFERENCES Projects(id),
      FOREIGN KEY (recorded_by) REFERENCES Users(id)
    );

    CREATE TABLE IF NOT EXISTS Reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      report_type TEXT NOT NULL,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES Projects(id),
      FOREIGN KEY (created_by) REFERENCES Users(id)
    );

    -- İndeksler
    CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email);
    CREATE INDEX IF NOT EXISTS idx_projects_status ON Projects(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON Tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_priority ON Tasks(priority);
    CREATE INDEX IF NOT EXISTS idx_measurements_project ON Measurements(project_id);
  `);
}

// Veritabanı işlemleri için yardımcı fonksiyonlar
const dbHelper = {
  // Kullanıcı işlemleri
  createUser: db.prepare(`
    INSERT INTO Users (name, email, password_hash, company, security_question, security_answer)
    VALUES (@name, @email, @password_hash, @company, @security_question, @security_answer)
  `),

  getUserByEmail: db.prepare(`
    SELECT * FROM Users WHERE email = ? AND is_active = 1
  `),

  updateUserLastLogin: db.prepare(`
    UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
  `),

  // Proje işlemleri
  createProject: db.prepare(`
    INSERT INTO Projects (name, description, start_date, end_date, created_by)
    VALUES (@name, @description, @start_date, @end_date, @created_by)
  `),

  getProjectsByUser: db.prepare(`
    SELECT * FROM Projects WHERE created_by = ? ORDER BY created_at DESC
  `),

  // Ölçüm işlemleri
  addMeasurement: db.prepare(`
    INSERT INTO Measurements (project_id, metric_name, metric_value, unit, recorded_by, notes)
    VALUES (@project_id, @metric_name, @metric_value, @unit, @recorded_by, @notes)
  `),

  getMeasurementsByProject: db.prepare(`
    SELECT * FROM Measurements WHERE project_id = ? ORDER BY measured_at DESC
  `),

  // Rapor işlemleri
  createReport: db.prepare(`
    INSERT INTO Reports (project_id, title, content, report_type, created_by)
    VALUES (@project_id, @title, @content, @report_type, @created_by)
  `),

  getReportsByProject: db.prepare(`
    SELECT * FROM Reports WHERE project_id = ? ORDER BY created_at DESC
  `)
};

// Veritabanını başlat
initializeDatabase();

module.exports = {
  db,
  dbHelper
}; 