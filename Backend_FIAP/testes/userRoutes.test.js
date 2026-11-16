const request = require('supertest');
const app = require('../app');
const { createToken } = require('../middleware');

const professor = { id: 1, name: 'professor', tipo: 'p' };
const aluno = { id: 2, name: 'aluno', tipo: 'a' };
const professorToken = createToken(professor);
const alunoToken = createToken(aluno);

beforeEach(() => {
  app.locals.db = {
    query: jest.fn(async (sql) => {
      if (sql.includes('SELECT id, tipo FROM users WHERE id = ?')) return params[0] === 2 ? [[{id:2,tipo:'a'}]] : [[{id:1,tipo:'p'}]];
      if (sql.includes('COUNT(*)')) return [[{ total: 1 }]];
      if (sql.includes('SELECT id, name, email, tipo FROM users')) return [[{ id: 1, name: 'professor', email: 'p@fiap.com', tipo: 'p' }]];
      return [[]];
    }),
    execute: jest.fn(async () => [{ insertId: 3, affectedRows: 1 }]),
  };
});

describe('Autorização e gerenciamento de usuários', () => {
  it('bloqueia listagem sem token', async () => {
    const response = await request(app).get('/api/users?tipo=p');
    expect(response.status).toBe(401);
  });
  it('bloqueia aluno nas rotas administrativas', async () => {
    const response = await request(app).get('/api/users?tipo=p').set('Authorization', `Bearer ${alunoToken}`);
    expect(response.status).toBe(403);
  });
  it('permite listagem paginada para professor', async () => {
    const response = await request(app).get('/api/users?tipo=p&page=1&limit=10').set('Authorization', `Bearer ${professorToken}`);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.totalPages).toBe(1);
  });
  it('permite cadastrar usuário para professor', async () => {
    const response = await request(app).post('/api/users').set('Authorization', `Bearer ${professorToken}`).send({ name: 'novo', email: 'novo@fiap.com', tipo: 'a', senha: '123' });
    expect(response.status).toBe(201);
    expect(response.body.tipo).toBe('a');
  });
});
