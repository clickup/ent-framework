#!/bin/bash

docker-compose up --quiet-pull -d

for i in $(seq 1 20); do
  docker-compose ps | grep postgres | grep -q healthy && break
  sleep 1
done
