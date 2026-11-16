const { createToken } = require('../middleware');

exports.loginUser = async (req, res) => {
  const { name, senha } = req.body || {};
  if (!name || !senha) return res.status(400).json({ message: 'Informe usuário e senha.' });
  try {
    const db = req.app.locals.db;
    const [users] = await db.query(
      'SELECT id, name, email, tipo FROM users WHERE name = ? AND senha = ?',
      [name.trim(), senha]
    );
    if (!users.length) return res.status(401).json({ message: 'Nome ou senha incorretos.' });
    const user = users[0];
    if (!['p', 'a'].includes(user.tipo)) return res.status(400).json({ message: 'Tipo de usuário inválido.' });
    return res.json({ message: 'Login realizado com sucesso', tipo: user.tipo === 'p' ? 'professor' : 'aluno', user, token: createToken(user) });
  } catch (err) {
    console.error('Erro no login:', err.message);
    return res.status(500).json({ message: 'Não foi possível realizar o login.' });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const tipo = req.query.tipo;
    if (tipo && !['p', 'a'].includes(tipo)) return res.status(400).json({ message: 'Tipo deve ser p ou a.' });
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;
    const db = req.app.locals.db;
    const where = tipo ? 'WHERE tipo = ?' : '';
    const params = tipo ? [tipo] : [];
    const [rows] = await db.query(`SELECT id, name, email, tipo FROM users ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
    const [count] = await db.query(`SELECT COUNT(*) AS total FROM users ${where}`, params);
    res.json({ data: rows, page, limit, total: count[0].total, totalPages: Math.ceil(count[0].total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createUser = async (req, res) => {
  const { name, email, tipo, senha } = req.body || {};
  if (!name || !email || !tipo || !senha) return res.status(400).json({ message: 'Preencha nome, e-mail, tipo e senha.' });
  if (!['p', 'a'].includes(tipo)) return res.status(400).json({ message: 'Tipo deve ser p (professor) ou a (aluno).' });
  try {
    const [result] = await req.app.locals.db.execute('INSERT INTO users (name, email, tipo, senha) VALUES (?, ?, ?, ?)', [name.trim(), email.trim(), tipo, senha]);
    res.status(201).json({ id: result.insertId, name: name.trim(), email: email.trim(), tipo });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Já existe um usuário com esses dados.' });
    res.status(400).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { name, email, tipo, senha } = req.body || {};
  if (!name || !email || !tipo) return res.status(400).json({ message: 'Nome, e-mail e tipo são obrigatórios.' });
  if (!['p', 'a'].includes(tipo)) return res.status(400).json({ message: 'Tipo deve ser p ou a.' });
  try {
    const db = req.app.locals.db;
    const [result] = senha
      ? await db.execute('UPDATE users SET name = ?, email = ?, tipo = ?, senha = ? WHERE id = ?', [name.trim(), email.trim(), tipo, senha, req.params.id])
      : await db.execute('UPDATE users SET name = ?, email = ?, tipo = ? WHERE id = ?', [name.trim(), email.trim(), tipo, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json({ id: Number(req.params.id), name: name.trim(), email: email.trim(), tipo });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Já existe um usuário com esses dados.' });
    res.status(400).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  if (Number(req.params.id) === Number(req.user.id)) return res.status(400).json({ message: 'Não é permitido excluir o próprio usuário.' });
  try {
    const [result] = await req.app.locals.db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json({ message: 'Usuário excluído com sucesso.' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};
