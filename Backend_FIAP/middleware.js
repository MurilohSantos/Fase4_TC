require('dotenv').config();
const crypto = require('crypto');
const SECRET = process.env.AUTH_SECRET || 'fiap-dev-secret-change-this-before-deploying';

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${signature}`;
}
function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [body, signature] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest();
  let received;
  try { received = Buffer.from(signature, 'base64url'); } catch { return null; }
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (!payload.exp || payload.exp < Date.now() || !payload.id) return null;
    return payload;
  } catch { return null; }
}
exports.createToken = (user) => sign({ id: user.id, name: user.name, tipo: user.tipo, exp: Date.now() + 8 * 60 * 60 * 1000 });
exports.authenticate = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const user = verify(header.startsWith('Bearer ') ? header.slice(7) : '');
  if (!user) return res.status(401).json({ message: 'Sessão inválida ou expirada. Faça login novamente.' });
  try {
    // Confere o papel atual no banco para que alterações de tipo revoguem permissões antigas.
    const [rows] = await req.app.locals.db.query('SELECT id, tipo FROM users WHERE id = ?', [user.id]);
    if (!rows.length) return res.status(401).json({ message: 'Usuário não encontrado. Faça login novamente.' });
    req.user = { ...user, tipo: rows[0].tipo };
    return next();
  } catch (err) {
    return res.status(500).json({ message: 'Não foi possível validar a sessão.' });
  }
};
exports.requireProfessor = (req, res, next) => {
  if (!req.user || req.user.tipo !== 'p') return res.status(403).json({ message: 'Acesso permitido somente para professores.' });
  next();
};
