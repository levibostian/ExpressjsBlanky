# Private Docker registry

When it comes to private Docker registries, there are a few options. Docker Hub, GitHub, DigitalOcean, Google Cloud, AWS are all some. This project uses GitHub to store private Docker images. Why?

1. It is easy to setup. All you need is a token generated and you can `docker login` to login. Some services like AWS require that you do much more to login.
2. We are already using GitHub to store our source code. Limiting the number of tools and services we use is a goal.

# Create the registry

As long as you have a GitHub account, you have a registry! All you need to do is [enable the container registry support](https://docs.github.com/en/free-pro-team@latest/packages/getting-started-with-github-container-registry/enabling-improved-container-support).

# Login to `docker`

We need to authenticate with GitHub to get the registry to work. To do this, you need to [generate a new token](https://github.com/settings/tokens/new).

For the name, I recommend the name `docker push`. Give the following permissions:

- read-packages
- write-packages
- delete-packages

> Note: You can create this GitHub token under your personal GitHub account or create it under a separate account that you use as a bit account (recommended).

# Docker tag, Docker push

This project is configured to automatically build, tag, and push your private Docker image for you. It uses the tool [skaffold](https://skaffold.dev/docs/workflows/ci-cd/) to do that.

You need to configure skaffold to push to the correct location. Open up the `skaffold.yaml` file and edit this line:

```yaml
profiles:
- name: ci-deploy
    artifacts:
      - image: ghcr.io/github-username/repo-name # <---
```

You will want to edit `github-username` and `repo-name`. Enter in the username/org name and repo name of the GitHub repo for your codebase.

# k8s secret to login to private repo

This is simple. You need to run this command to create a k8s secret that contains a token to your docker private registry.

```
kubectl create secret docker-registry private-docker-repo --docker-server=ghcr.io --docker-username=github-username --docker-password=<token-you-generated>
```
