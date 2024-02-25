


# TODO
## README is a work in progress.


# Migrations

To run migrations you will need to execute "npm run migrate" inside the container.

(On the first run its required to run the migrations to create the tables.)
```bash
docker exec backend sh -c "npm run migrate"
```

OR pass env variable to the container to run the migrations on start.
"RUN_MIGRATIONS=true"
"RUN_SEED=true"

## Nginx

### Nginx is used for reverse proxy.

You will need to edit the ``nginx.conf`` file with your domain.

## Dozzle

### Dozzle is used for viewing logs.

You will need to create a ``nginx/.htpasswd`` file to protect the dozzle service.

https://hostingcanada.org/htpasswd-generator/


## shynet

### Shynet is used for analytics.

First run:

Create a admin user:

```bash
docker exec shynet ./manage.py registeradmin <email>
```