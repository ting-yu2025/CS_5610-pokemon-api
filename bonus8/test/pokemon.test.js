import assert from 'node:assert/strict'
import test from 'node:test'
import { app } from '../src/pokemon.js'

const jsonHeaders = { 'content-type': 'application/json' }

function send(path, method, body, cookie) {
  return app.request(path, {
    method,
    headers: { ...jsonHeaders, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}

test('registration, ownership, logout, login, and deletion', async () => {
  const register = await send('/user/register', 'POST', { username: 'student', password: 'pika123' })
  assert.equal(register.status, 201)
  const cookie = register.headers.get('set-cookie').split(';')[0]
  assert.equal(cookie, 'username=student')

  const noCookie = await send('/api/pokemon', 'GET')
  assert.equal(noCookie.status, 401)

  const create = await send('/api/pokemon', 'POST', { species: 'Eevee', owner: 'someone-else' }, cookie)
  assert.equal(create.status, 201)
  const created = await create.json()
  assert.equal(created.owner, 'student')
  assert.equal(created.name, 'Eevee')
  assert.equal(typeof created.id, 'number')
  assert.equal(typeof created.health, 'number')
  assert.equal(typeof created.level, 'number')

  const ownList = await send('/api/pokemon', 'GET', undefined, cookie)
  assert.deepEqual((await ownList.json()).map((item) => item.id), [created.id])

  const otherRegister = await send('/user/register', 'POST', { username: 'other', password: 'secret' })
  const otherCookie = otherRegister.headers.get('set-cookie').split(';')[0]
  const otherList = await send('/api/pokemon', 'GET', undefined, otherCookie)
  assert.deepEqual(await otherList.json(), [])
  assert.equal((await send(`/api/pokemon/${created.id}`, 'DELETE', undefined, otherCookie)).status, 403)

  const logout = await send('/user/logout', 'POST', undefined, cookie)
  assert.equal(logout.status, 200)
  assert.match(logout.headers.get('set-cookie'), /Max-Age=0/i)

  const badLogin = await send('/user/login', 'POST', { username: 'student', password: 'wrong' })
  assert.equal(badLogin.status, 401)
  const login = await send('/user/login', 'POST', { username: 'student', password: 'pika123' })
  assert.equal(login.status, 200)
  assert.equal(login.headers.get('set-cookie').split(';')[0], cookie)

  assert.equal((await send(`/api/pokemon/${created.id}`, 'DELETE', undefined, cookie)).status, 204)
  assert.equal((await send(`/api/pokemon/${created.id}`, 'DELETE', undefined, cookie)).status, 404)
})

test('rejects invalid registration, duplicate usernames, and invalid Pokémon', async () => {
  assert.equal((await send('/user/register', 'POST', { username: '', password: 'x' })).status, 400)
  assert.equal((await send('/user/register', 'POST', { username: 'student', password: 'x' })).status, 409)
  assert.equal((await send('/api/pokemon', 'POST', { species: '' }, 'username=student')).status, 400)
  assert.equal((await send('/api/pokemon', 'POST', { species: 'Mew', id: 2 }, 'username=student')).status, 400)
  assert.equal((await send('/api/pokemon/nope', 'DELETE', undefined, 'username=student')).status, 400)
  assert.equal((await send('/api/pokemon', 'GET', undefined, 'username=unregistered')).status, 401)
})
