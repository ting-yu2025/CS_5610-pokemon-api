import { serve } from '@hono/node-server'
import { app } from './pokemon.js'

const port = Number(process.env.PORT) || 3000

serve({ fetch: app.fetch, port, hostname: '127.0.0.1' }, () => {
  console.log(`Pokemon API running at http://localhost:${port}`)
})
