# Security

This is an overview of the security of this project.

> Note: THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

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
