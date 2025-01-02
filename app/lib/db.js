const Database = require('better-sqlite3');
const path = require('path');

let db;
let dbHelper;

try {
  db = new Database(path.join(process.cwd(), 'ManagementSystem.db'), {
    verbose: process.env.NODE_ENV === 'development' ? console.log : null
  });

  db.pragma('foreign_keys = ON');

  // Veritabanı işlemleri için yardımcı fonksiyonlar
  dbHelper = {
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

    createSession: db.prepare(`
      INSERT INTO UserSessions (user_id, session_token, expires_at)
      VALUES (@user_id, @session_token, @expires_at)
    `),

    getSessionByToken: db.prepare(`
      SELECT * FROM UserSessions WHERE session_token = ? AND expires_at > CURRENT_TIMESTAMP
    `),

    createPasswordReset: db.prepare(`
      INSERT INTO PasswordResets (user_id, reset_token, expires_at)
      VALUES (@user_id, @reset_token, @expires_at)
    `),

    getPasswordResetByToken: db.prepare(`
      SELECT * FROM PasswordResets 
      WHERE reset_token = ? 
      AND expires_at > CURRENT_TIMESTAMP 
      AND is_used = 0
    `),

    // Kullanıcı güncelleme
    updateUser: db.prepare(`
      UPDATE Users 
      SET name = @name, 
          email = @email, 
          company = @company,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `),

    // Kullanıcı silme (soft delete)
    deactivateUser: db.prepare(`
      UPDATE Users 
      SET is_active = 0,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),

    // Kullanıcı bilgilerini getir
    getUserById: db.prepare(`
      SELECT id, name, email, company, role, created_at, last_login 
      FROM Users 
      WHERE id = ? AND is_active = 1
    `),

    // Şifre güncelleme
    updatePassword: db.prepare(`
      UPDATE Users 
      SET password_hash = @password_hash,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `)
  };

} catch (error) {
  console.error('Database connection error:', error);
  throw error;
}

// Process sonlandığında veritabanını kapat
process.on('exit', () => {
  if (db) {
    console.log('Closing database connection');
    db.close();
  }
});

module.exports = {
  db,
  dbHelper
}; 