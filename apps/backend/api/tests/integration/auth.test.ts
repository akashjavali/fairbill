import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../src/app'
import { prisma } from '../../src/config/database'

beforeAll(async () => {
  // Clean up test users before suite
  await prisma.user.deleteMany({ where: { email: { contains: '@test-fairbill.com' } } })
})

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { contains: '@test-fairbill.com' } } })
  await prisma.$disconnect()
})

describe('POST /api/auth/register', () => {
  it('returns 201 and tokens on valid input', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'integration@test-fairbill.com',
      password: 'Integration@1234',
      name: 'Integration User',
    })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.accessToken).toBeDefined()
    expect(res.body.data.refreshToken).toBeDefined()
  })

  it('returns 400 for duplicate email', async () => {
    const payload = {
      email: 'dup@test-fairbill.com',
      password: 'Integration@1234',
      name: 'Dup User',
    }
    await request(app).post('/api/auth/register').send(payload)
    const res = await request(app).post('/api/auth/register').send(payload)

    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
  })

  it('returns 422 for invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      password: 'Integration@1234',
      name: 'Bad Email',
    })
    expect(res.status).toBe(422)
  })
})

describe('POST /api/auth/login', () => {
  const email = 'login-test@test-fairbill.com'
  const password = 'Login@1234!'

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({ email, password, name: 'Login Test' })
  })

  it('returns 200 and tokens on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password })
    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toBeDefined()
  })

  it('returns 401 on wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password: 'WrongPass' })
    expect(res.status).toBe(401)
  })

  it('returns 401 for unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@test-fairbill.com', password })
    expect(res.status).toBe(401)
  })
})

describe('GET /api/auth/me', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('returns user profile with valid token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login-test@test-fairbill.com', password: 'Login@1234!' })
    const { accessToken } = loginRes.body.data

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.email).toBe('login-test@test-fairbill.com')
  })
})

describe('POST /api/auth/refresh', () => {
  it('issues new access token with valid refresh token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      email: 'refresh-test@test-fairbill.com',
      password: 'Refresh@1234!',
      name: 'Refresh Test',
    })
    const { refreshToken } = registerRes.body.data

    const res = await request(app).post('/api/auth/refresh').send({ refreshToken })
    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toBeDefined()
  })

  it('returns 401 for invalid refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'bad_token' })
    expect(res.status).toBe(401)
  })
})
