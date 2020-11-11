# Security

This is an overview of the security of this project.

> Note: THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# Servers

- The public Internet can only access the server through 1 open port: a SSH port. We setup fail2ban on that port to protect it from abuse. Every other port though on the entire machine is disabled by a network level firewall (DigitalOcean and Linode offers). Our application is able to connect to the database server through the private network created in DigitalOcean/Linode. If we didn't have this option, we could consider white listing IPs for each server (this includes k8s nodes) or SSH tunnels from each k8s pod to the server.
- The server the database is stored on is a Debian server setup with [automatic security updates](https://wiki.debian.org/UnattendedUpgrades).
- The only way to access the database is with a SSH key. No password access is possible.

### Database security

- The database of this project is setup with encryption at rest. Encryption at transit is not setup as all traffic is sent and received through a private network which is private to only the application and the server itself. The database data is stored on a [DigitalOcean volume](https://www.digitalocean.com/products/block-storage/) which is has the file system encrypted at rest.
- The database backups that are created are encrypted at rest. The database backup, once downloaded from the backup location, is unencrypted. It is only stored encrypted at rest on the file system using [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/).
- The database is only accessible by the backend API codebase. It is not directly read from any client side application.

### API application security

- The API application runs in sandboxed Docker containers in a Kubernetes Cluster which isolates the applications.
- API keys and other secrets are not stored in plain text anywhere. They are stored with encryption at rest in the source code repositories and are stored using [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) feature to read them when the application needs them.
- The API runs on the latest LTS version of Nodejs to keep the security patches up-to-date. Npm packages are monitored automatically on GitHub so when security patches are updated on dependencies, the code base automatically will deploy a new version once a GitHub pull request is merged by someone on the team.
- The API application uses a Redis backed brute force npm module to prevent spamming of the application as best as we can. This method is mostly to protect endpoints that send emails which cost money. At this time, we are not setup to run behind any DDOS protection such as CloudFlare.
- The API has a full test suite written against it to decrease the chances of security holes found within the endpoints.

# Kubernetes

### Using secrets for all private data

[Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) are the most secure way to store private information such as passwords or API keys for a running application in a kubernetes cluster.

All files, environment variables, or other information that needs to be stored securely is provided to a running application in k8s through secrets. This means the the built Docker containers for our running application does not have any secrets compiled inside of it.

### Separate roles for everyone that communicate with k8s API

Each person who performs requests against the k8s cluster have specific permissions for what they can and cannot do to the cluster. Setting up separate permissions for every user (including the CI server) is better then giving everyone default admin access.

### Separate roles for every application running in the cluster

Applications running in a cluster are able to call the k8s cluster API to perform actions. You can think of it like an application is like a user who can create secrets, list Ingress rules, etc on the cluster.

Each application running in this cluster has been assigned a [ServiceAccount](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/) with specific roles assigned which specifies the exact permissions the application has on the cluster.

### Test cluster with clusterlint tool

There is a handy tool, [clusterlint](https://github.com/digitalocean/clusterlint) that you can run against the k8s cluster to find ways to improve the security of the cluster. This tool has been executed and (at least at this time of writing), the lint tool did not find any important errors that need addressed.

### Resource limits set on all deployments

[Resource requests/limits](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) is important to set on all running applications of your service. This is because without limits set, your running applications can consume as much resources as it wants which could result in a DDOS attack.

The `clusterlint` tool is a great way to find applications that you do not yet have resource limits set for.

### Installing trusted applications from trusted sources

There are applications that are running on the k8s cluster that we did not create. Example: [cert-manager](https://cert-manager.io/). The cluster has tried to only install applications that are popular which prove they are stable and trusted. Also, they are installed through stable/official Helm repositories or k8s manifests from the GitHub repositories of the projects. This helps trust that we are only installing trusted applications through trusted installation methods.

### Secure Docker images

This project's CI server is setup to scan the Docker image (operating system) and nodejs dependencies for known security vulnerabilities. The CI server runs on each push and pull request made. The results are archived to the CI results where you can download the results and view them.

> Note: This is only scanning vulnerabilities. It's up to you to update your OS and software packages to fix these issues.

The Testing and Production environment Docker images are run on a [_distroless_ operating system](https://github.com/GoogleContainerTools/distroless/). The idea behind this is what the smaller your operating system is, the less chances of security threats there are. Disroless Docker images are some of the smallest images that you can use. They are operating systems that only include the runtime needed to execute your program but nothing else.
