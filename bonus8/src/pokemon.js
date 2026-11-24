// Name: Ting Yu Chen

import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

export const app = new Hono()

// This assignment keeps all data in memory. Restarting the server resets it.
const users = []
const pokemon = [
  { id: 1, name: 'Pikachu', species: 'Pikachu', health: 80, level: 5, owner: 'ash' },
]

async function objectBody(c) {
  try {
    const body = await c.req.json()
    return body && typeof body === 'object' && !Array.isArray(body) ? body : null
  } catch {
    return null
  }
}

function nonemptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function currentUser(c) {
  const username = getCookie(c, 'username')
  return users.some((user) => user.username === username) ? username : null
}

function setUsernameCookie(c, username) {
  setCookie(c, 'username', username, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
  })
}

function randomId() {
  let id
  do {
    id = Math.floor(Math.random() * 1_000_000_000) + 2
  } while (pokemon.some((entry) => entry.id === id))
  return id
}

// 1. Registration creates a user and logs them in by setting a cookie.
app.post('/user/register', async (c) => {
  const body = await objectBody(c)
  if (!body || !nonemptyString(body.username) || !nonemptyString(body.password)) {
    return c.json({ error: 'username and password are required' }, 400)
  }

  const username = body.username.trim()
  if (users.some((user) => user.username === username)) {
    return c.json({ error: 'username already exists' }, 409)
  }

  users.push({ username, password: body.password, createdAt: new Date().toISOString() })
  setUsernameCookie(c, username)
  return c.json({ username }, 201)
})

// 2. Login checks both fields before setting the same cookie.
app.post('/user/login', async (c) => {
  const body = await objectBody(c)
  if (!body || !nonemptyString(body.username) || !nonemptyString(body.password)) {
    return c.json({ error: 'username and password are required' }, 400)
  }

  const user = users.find((entry) => entry.username === body.username.trim())
  if (!user || user.password !== body.password) {
    return c.json({ error: 'invalid username or password' }, 401)
  }

  setUsernameCookie(c, user.username)
  return c.json({ username: user.username }, 200)
})

// 3. Clearing the cookie logs out the browser or curl cookie jar.
app.post('/user/logout', (c) => {
  deleteCookie(c, 'username', { path: '/' })
  return c.json({ message: 'logged out' }, 200)
})

// 4. Only the Pokémon owned by the cookie's user are visible.
app.get('/api/pokemon', (c) => {
  const username = currentUser(c)
  if (!username) return c.json({ error: 'login required' }, 401)
  return c.json(pokemon.filter((entry) => entry.owner === username), 200)
})

// 5. The owner always comes from the cookie, even if the body contains owner.
app.post('/api/pokemon', async (c) => {
  const username = currentUser(c)
  if (!username) return c.json({ error: 'login required' }, 401)

  const body = await objectBody(c)
  if (!body || !nonemptyString(body.species) ||
      (body.name !== undefined && !nonemptyString(body.name)) ||
      body.id !== undefined) {
    return c.json({ error: 'species is required; name must be a string; id is generated' }, 400)
  }

  const species = body.species.trim()
  const entry = {
    id: randomId(),
    name: body.name === undefined ? species : body.name.trim(),
    species,
    health: Math.floor(Math.random() * 51) + 50,
    level: Math.floor(Math.random() * 10) + 1,
    owner: username,
  }
  pokemon.push(entry)
  return c.json(entry, 201)
})

// 6. A logged-in user may delete only their own Pokémon.
app.delete('/api/pokemon/:id', (c) => {
  const username = currentUser(c)
  if (!username) return c.json({ error: 'login required' }, 401)

  const id = Number(c.req.param('id'))
  if (!Number.isSafeInteger(id) || id <= 0) {
    return c.json({ error: 'id must be a positive integer' }, 400)
  }

  const index = pokemon.findIndex((entry) => entry.id === id)
  if (index === -1) return c.json({ error: 'pokemon not found' }, 404)
  if (pokemon[index].owner !== username) return c.json({ error: 'not the owner' }, 403)

  pokemon.splice(index, 1)
  return c.body(null, 204)
})
