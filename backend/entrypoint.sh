#!/bin/bash

if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running migrations"
    npm run migrate
fi

if [ "$RUN_SEED" = "true" ]; then
    echo "Running seed"
    npm run seed
fi


exec npm start