const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1):(8081|19006)$/.test(origin) || /^https?:\/\/192\.168\.\d+\.\d+:(8081|19006)$/.test(origin)) return callback(null, true);
    return callback(new Error('Origem não permitida pelo CORS.'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
const pool = mysql.createPool({
  host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, waitForConnections: true, connectionLimit: 10, queueLimit: 0
});
app.locals.db = pool;
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, async () => {
    try { const conn = await pool.getConnection(); conn.release(); console.log('MySQL conectado!'); }
    catch (err) { console.error('Erro ao conectar ao MySQL:', err.message); }
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}
module.exports = app;
