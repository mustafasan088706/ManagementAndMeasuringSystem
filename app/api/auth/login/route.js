const { dbHelper } = require('../../../lib/db');
const { compare } = require('bcryptjs');
const { sign } = require('jsonwebtoken');

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Kullanıcıyı bul
    const user = dbHelper.getUserByEmail.get(email);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Kullanıcı bulunamadı' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Şifreyi kontrol et
    const isValid = await compare(password, user.password_hash);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Geçersiz şifre' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Son giriş zamanını güncelle
    dbHelper.updateUserLastLogin.run(user.id);

    // JWT token oluştur
    const token = sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return new Response(JSON.stringify({ 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Giriş işlemi başarısız' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 