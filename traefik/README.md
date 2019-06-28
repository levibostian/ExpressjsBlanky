# traefik setup

This is a sample traefik setup to hopefully get you off the ground quickly and easily.

The sample assumes the following:

- You use Cloudflare as your DNS server. If you do not, you can use [many other providers](https://docs.traefik.io/configuration/acme/#provider).
- You want to have a traefik dashboard hosted to be a UI for you.
- You want to host all applications on 1 domain.
- You are deploying all of your applications via Docker.
- You want to use Lets Encrypt SSL for all applications.

# Setup

- Edit the `traefik.toml` file. You will need to change values in there such as your domain name to host applications on.

_Note:_ Make sure to also edit the line `users = ["admin:12345"]` for HTTP basic auth on your dashboard. `admin` is the username in plain text and `12345` needs to be replaced with a [htpasswd](https://www.web2generators.com/apache-tools/htpasswd-generator).

- Edit `cloudflare.env` to values for your cloudflare account.

- Launch the traefik application via docker compose using the `traefik/docker-compose.yml` file as a starting point.

- Add to the docker configuration of your application you want to launch:

```
labels:
  - 'traefik.enable=true'
  - 'traefik.frontend.rule=Host:subdomain.foo.com'
  - 'traefik.port=3000'
```

Change the values above to match your application of course.
