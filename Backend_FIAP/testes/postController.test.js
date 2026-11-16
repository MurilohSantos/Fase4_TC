const request = require('supertest');
const app = require('../app');
const { createToken } = require('../middleware');
const token = createToken({ id: 1, name: 'professor', tipo: 'p' });

beforeEach(() => {
  app.locals.db = {
    query: jest.fn(async (sql) => sql.includes('SELECT * FROM posts') ? [[{ id: 1, materia: 'Historia', assunto: 'Teste', descricao: 'Conteudo', habilitado: 1, autor: 'professor' }]] : [[]]),
    execute: jest.fn(async () => [{ insertId: 7, affectedRows: 1 }]),
  };
});

describe('Posts', () => {
  it('cria um post quando o professor está autenticado', async () => {
    const postData = { materia: 'Historia', assunto: 'Teste', descricao: 'Conteudo', habilitado: 1, autor: 'professor' };
    const response = await request(app).post('/api/posts').set('Authorization', `Bearer ${token}`).send(postData);
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(expect.objectContaining(postData));
    expect(response.body).toHaveProperty('id');
  });
  it('lista posts publicamente', async () => {
    const response = await request(app).get('/api/posts');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
  it('impede que aluno crie post', async () => {
    const alunoToken = createToken({ id: 2, name: 'aluno', tipo: 'a' });
    const response = await request(app).post('/api/posts').set('Authorization', `Bearer ${alunoToken}`).send({});
    expect(response.statusCode).toBe(403);
  });
});
