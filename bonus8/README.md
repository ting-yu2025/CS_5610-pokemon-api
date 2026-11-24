# Pokemon API with Cookies

A small Hono project for Bonus Assignment 8. Users and Pokemon are stored in memory, so restarting the server resets the data. The six routes are in [`src/pokemon.js`](src/pokemon.js).

## Run

Requires Node.js 20 or newer.

```bash
npm ci
npm start
```

The server runs at `http://localhost:3000`. To use another port, run `PORT=4000 npm start`.

## Routes

| Route | What it does | Success status |
| --- | --- | --- |
| `POST /user/register` | Creates a user from `username` and `password`, then sets a `username` cookie | `201` |
| `POST /user/login` | Checks the username and password, then sets the cookie | `200` |
| `POST /user/logout` | Clears the cookie | `200` |
| `GET /api/pokemon` | Lists only the logged-in user's Pokemon | `200` |
| `POST /api/pokemon` | Creates a Pokemon using the cookie as its owner; ignores `owner` in the request body | `201` |
| `DELETE /api/pokemon/:id` | Deletes a Pokemon only if the logged-in user owns it | `204` |

Example request bodies:

```json
{"username":"student","password":"pika123"}
```

```json
{"species":"Eevee","name":"Eevee"}
```

The Pokemon `name` is optional and defaults to `species`. The server generates `id`, `health`, and `level`. Missing login returns `401`; deleting someone else's Pokemon returns `403`.

## Check the APIs

With the server running, open another terminal and run:

```bash
bash scripts/demo.sh
npm test
```

The demo uses a curl cookie jar and prints each command and response. The Canvas ZIP includes its recorded output and two screen captures of that output.

This is a classroom exercise: passwords are plain text and the username cookie is not signed.
