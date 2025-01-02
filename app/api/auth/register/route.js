const { dbHelper } = require('../../../lib/db');
const { hash } = require('bcryptjs');

export async function POST(req) {
  try {
    const body = await req.json();
    
    // E-posta kontrolü
    const existingUser = dbHelper.getUserByEmail.get(body.email);
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Bu e-posta adresi zaten kullanımda' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const password_hash = await hash(body.password, 12);

    const result = dbHelper.createUser.run({
      name: body.name,
      email: body.email.toLowerCase(),
      password_hash,
      company: body.company || null,
      security_question: body.securityQuestion,
      security_answer: body.securityAnswer.toLowerCase()
    });

    return new Response(JSON.stringify({ 
      success: true, 
      userId: result.lastInsertRowid 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Register error:', error);
    return new Response(JSON.stringify({ 
      error: 'Kayıt işlemi başarısız',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 