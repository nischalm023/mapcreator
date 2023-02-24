#!/bin/sh
cd /app

# wait for postgres
./wait-for-it.sh mapcreator_db:5432 -t 30

npm run migrate

npm start
