#!/usr/bin/env bash
set -euo pipefail

base_url="${BASE_URL:-http://127.0.0.1:3000}"
demo_dir="$(mktemp -d)"
trap 'rm -rf "$demo_dir"' EXIT
cookie_jar="$demo_dir/cookies.txt"
username="student_$(date +%s)"
password='pika123'

echo "1. Register $username: expect 201 and Set-Cookie"
curl -i -sS -c "$cookie_jar" -H 'Content-Type: application/json' \
  -d "{\"username\":\"$username\",\"password\":\"$password\"}" \
  "$base_url/user/register"
printf '\n\n'

echo '2. GET before creating Pokémon: expect 200 and []'
curl -i -sS -b "$cookie_jar" "$base_url/api/pokemon"
printf '\n\n'

echo '3. POST Pokémon: expect 201; body owner is ignored'
curl -sS -D "$demo_dir/headers" -o "$demo_dir/body" -b "$cookie_jar" \
  -H 'Content-Type: application/json' \
  -d '{"species":"Eevee","owner":"someone-else"}' \
  "$base_url/api/pokemon"
cat "$demo_dir/headers" "$demo_dir/body"
printf '\n\n'
pokemon_id="$(node -e 'const fs=require("node:fs");console.log(JSON.parse(fs.readFileSync(process.argv[1],"utf8")).id)' "$demo_dir/body")"

echo '4. GET after creating Pokémon: expect only your Pokémon'
curl -i -sS -b "$cookie_jar" "$base_url/api/pokemon"
printf '\n\n'

echo '5. Logout: expect 200 and a cleared cookie'
curl -i -sS -b "$cookie_jar" -c "$cookie_jar" -X POST "$base_url/user/logout"
printf '\n\n'

echo '6. Login: expect 200 and a new cookie'
curl -i -sS -b "$cookie_jar" -c "$cookie_jar" -H 'Content-Type: application/json' \
  -d "{\"username\":\"$username\",\"password\":\"$password\"}" \
  "$base_url/user/login"
printf '\n\n'

echo "7. DELETE Pokémon $pokemon_id: expect 204"
curl -i -sS -b "$cookie_jar" -X DELETE "$base_url/api/pokemon/$pokemon_id"
printf '\n\n'

echo '8. GET again: expect 200 and []'
curl -i -sS -b "$cookie_jar" "$base_url/api/pokemon"
printf '\n'
