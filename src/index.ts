// Name: Ting-Yu Chen

import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

const pokemon = [
  {
    id: 1,
    name: 'Sparky',
    species: 'Pikachu',
    health: 35,
    level: 5,
    owner: 'Ash',
  }
]

app.get('/api/pokemon', (c) => {
  return c.json(pokemon)
})


app.get('/api/pokemon/:id', (c) => {
  const id = Number(c.req.param('id'))
  const found = pokemon.find((p) => p.id === id)

  if (!found) {
    return c.json({error: 'Pokemon not found'}, 404) 
  }
  return c.json(found)
})

app.post('/api/pokemon', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (body === null || Array.isArray(body) || typeof body !== 'object') {
    return c.json({ error: 'Body must be a JSON object' }, 400)
  }

  if (!body.species|| !body.owner) {
    return c.json({error: 'species and owner are required'}, 400)
  }
  if ('id' in body) {
    return c.json({error: 'Do not provide an id'}, 400)
  }
  if (typeof body.species !== 'string' || typeof body.owner !== 'string') {
    return c.json({error: 'species and owner must be strings'}, 400)
  }
  if ('name' in body && typeof body.name !== 'string') {
    return c.json({error: 'name must be a string'}, 400)
  }
  if ('health' in body && typeof body.health !== 'number') {
    return c.json({ error: 'health must be a number' }, 400)
  }
  if ('level' in body && typeof body.level !== 'number') {
    return c.json({ error: 'level must be a number' }, 400)
  }

   body.name = body.name || body.species

   body.health = Math.floor(Math.random() * 100) + 1
   body.level = Math.floor(Math.random() * 10) + 1
   body.id = Math.floor(Math .random() * 1000000) + 1
   while (pokemon.find((p) => p.id === body.id)) {
     body.id = Math.floor(Math.random() * 1000000) +1
   }

   pokemon.push(body)

  return c.json(body, 201)
})


app.patch('/api/pokemon/:id', async(c) => {
  const id = Number(c.req.param('id'))
  const changes = await c.req.json().catch(() => null)

  if (changes === null || Array.isArray(changes) || typeof changes !== 'object') {
    return c.json({ error: 'Changes must be a JSON object' }, 400)
  }
  const found =pokemon.find((p) => p.id === id)
  if (!found){
    return c.json({error: 'pokemon not found'}, 404)
  }
  if ('id' in changes) {
    return c.json({error:'id cannot be changed'}, 400)
  }
  if ('health' in changes && typeof changes.health !== 'number'){
    return c.json({error:'health must be a number'}, 400)
  }
  if ('level' in changes && typeof changes.level !== 'number'){
    return c.json({error:'level must be a number'}, 400)
  }
  if ('name' in changes &&
    (typeof changes.name !== 'string' || !changes.name)) {
  return c.json({ error: 'name must be a nonempty string' }, 400)
  }
  if ('species' in changes &&
    (typeof changes.species !== 'string' || !changes.species)) {
  return c.json({ error: 'species must be a nonempty string' }, 400)
  }
  if ('owner' in changes &&
      (typeof changes.owner !== 'string' || !changes.owner)) {
    return c.json({ error: 'owner must be a nonempty string' }, 400)
  }

  if ('level' in changes) {
    found.level = changes.level
  }
  if ('name' in changes) {
    found.name = changes.name
  }
  if ('species' in changes) {
    found.species = changes.species
  }
  if ('health' in changes) {
    found.health = changes.health
  }
  if ('owner' in changes) {
    found.owner = changes.owner
  }
  return c.json(found)
})


app.delete('/api/pokemon/:id', (c) => {
  const id = Number(c.req.param('id'))
  const index = pokemon.findIndex((p) => p.id === id)
  
  if (index === -1) {
    return c.json({error: 'Pokemon not found'}, 404)
    }
  pokemon.splice(index, 1)
  return c.json({message: ' Pokemon deleted'})
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
