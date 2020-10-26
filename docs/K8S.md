# Kubernetes (k8s)

This document is a step-by-step guide on how to get your k8s cluster created and running.

> Note: This guide will assume that you are using one of the recommended services, [Linode](https://www.linode.com/) or [DigitalOcean](https://www.digitalocean.com/), to create your cluster. You can also use something like [AWS](https://aws.amazon.com/) if that is what you are already comfortable with. We are going to use a managed k8s cluster and not install k8s on a Linux server.

First, create a new k8s cluster.

When you create the cluster, make sure you take into consideration the following:

1. Add the cluster to the same virtual private network that you added your [database server](./SERVER.md) to. Linode and DigitalOcean both offer private networks.

# Login to cluster

Now that you have created the cluster, you want to authenticate your computer to the cluster so we can run commands against the cluster with `kubectl`.

> Tip: I recommend you install [kubens and kubectx](https://github.com/ahmetb/kubectx) on my machine to easily switch between k8s clusters and namespaces.

### DigitalOcean

To login to our cluster, the recommended way is to use the DigitalOcean CLI tool, `doctl`. This is because this method will automatically refresh your credentials on your machine for you so you only need to login once and you will remain logged in.

- [Install](https://github.com/digitalocean/doctl#installing-doctl) `doctl` (tip: `brew install doctl`)

- Login to the DigitalOcean web app console. Make sure to have your team selected that you created your cluster on (you don't want to be in your personal account). Now, [generate a new API token](https://cloud.digitalocean.com/account/api/tokens/new) under the team account.

  For k8s authentication, I create a read-only API token. I named it `read-only-k8s-<my name>`. This token name shows the purpose and who uses it. Then if you leave this team in the future, they can remove this token and nothing else will be messed with.

- Let's login on our local machine.

```
doctl auth init --context name-to-give-team
```

It will ask for an access token. Give it the one you just created. `name-to-give-team` is a nickname you give your team locally on your machine.

- Now, let's authenticate with our cluster.

```
doctl kubernetes cluster kubeconfig save <name-of-cluster> --context name-to-give-team
```

You should see a successful message saying a config was added to your k8s config on your local machine.

### Linode

To login to our cluster on our computer, follow [these instructions](https://www.linode.com/docs/kubernetes/deploy-and-manage-a-cluster-with-linode-kubernetes-engine-a-tutorial/#connect-to-your-lke-cluster-with-kubectl) to download the k8s config file onto your computer to login.

### Check for success

- Now, let's make sure the cluster is available for you to use.

```
kubectl config get-contexts
```

This should list your new cluster you just added. A `*` is shown next to the context currently set for `kubectl`.

> Tip: `kubectx new-name=old-name` will rename the name of the context to something more memorable.
>
> Tip: `kubectx <name-of-context>` is how you can switch between contexts very easily.

# Setup

Below you will find instructions for how to setup your cluster. These steps should only need to be run once. You may need to upgrade the software in the future, but they only need to be setup once and do not need to be run again when you re-deploy your application.

## Ingress

A k8s ingress is how you can make your applications accessible to the Internet. We are going to setup an ingress controller so when we deploy our app, the ingress controller is setup already for us.

To route traffic, you need to install an _ingress controller_ into your k8s cluster. There are a few different ingress controllers that you can install on your cluster. Each one has pros and cons but we have decided to use the [officially supported ingress controller](https://kubernetes.github.io/ingress-nginx/) by the k8s team.

When you send a network request to your application running in your k8s cluster, here is an overview of how the request gets to your application:

```
Request sent over the Internet => network based load balancer => ingress controller => Service => Pod
```

> Note: _network based load balancer_ is a load balancer that is not written in software, but is provided at the network level. One example is the [DigitalOcean load balancer](https://www.digitalocean.com/products/load-balancer/). These load balancers may add a cost to your monthly bill! Keep this in mind.

Luckily, the ingress controller takes care of most of this for us. But it's important to know about this overview because if your application needs to preserve the IP address from the original source making the request, for example, you may need to configure your ingress controller in a special way. This doc tries to share as much about how to do this as possible, but it this doc may not be complete.

### Install Ingress controller

Follow [this official guide](https://kubernetes.github.io/ingress-nginx/deploy/). It's recommended to follow the install instructions for your k8s cluster provider (example DigitalOcean) instead of using the generic Helm installation.

> Note: If you are using DigitalOcean as your k8s provider, you need to do some extra steps for setup. Go to the section [Misc](#Misc) in this document to find out instructions on how to do that.

When you install the ingress controller, more than likely the setup will create a network based load balancer for you. You know that everything is setup when you run `kubectl get svc --namespace=ingress-nginx`, you should see something like this:

```
NAME            TYPE           CLUSTER-IP      EXTERNAL-IP
ingress-nginx   LoadBalancer   10.245.247.67   201.3.114.6
```

The piece that is important is `EXTERNAL-IP` has an IP address listed.

> Note: It takes a minute or so for this to happen so you may need to wait and run the `get svc` command again to check again.

This external IP address is the publicly accessible IP address for your cluster. It's now time for you to go into your DNS server and create DNS rules for your domain names to point to this IP address.

### Ingress rules

After you install the ingress controller, all you need to do is apply _ingress rules_ to your application for the ingress controller to find it.

Well, before we get into that let's

Ingress rules are simple, but flexible. Check out `k8s/setup/ingress-rules.yaml` in this project for an example. See [the official doc](https://kubernetes.io/docs/concepts/services-networking/ingress/) to see all of your options if you need more. You can map domain names, subdomain names, and paths to all map to different applications in your cluster.

After you create your ingress rules and apply them to your cluster, you know that everything is working because you should be able to communicate with your application through the domain name that you set.

# SSL

The ingress controller is what makes our application accessible to the public Internet, but what about about a SSL certificate to make our application accessible over https?

We use a popular ingress controller plugin called [cert-manager](https://cert-manager.io/). Cert manager is handy because it's easy to use, automatically handles issuing, validating, and renewing your SSL certificates. Oh, it also works with Let's Encrypt to provide a free certificate!

- To install cert-manager, follow [these instructions](https://cert-manager.io/docs/installation/kubernetes/#installing-with-helm) to install cert-manager with Helm.

- Next, create your SSL issuer config. cert-manager does not understand Let's Encrypt by default. Open `k8s/setup/ssl-issuer.yaml` and edit the `email` fields to an email address of yours. This email address is used by the Let's Encrypt service to email you about expiring certificates (indicating there is a problem with cert-manager) or if there is a problem with your certificate (meaning you may need to update cert-manager). After editing this file, `kubectl apply -f k8s/setup/ssl-issuer.yaml` to install it to your cluster.

- Lastly, you will want to edit your `k8s/setup/ingress-rules.yaml` file to include these pieces:

```
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-staging" # it's recommended to use staging first. Use production after you test the certificate issues successfully.
spec:
  tls:
  - hosts:
    - foo-beta.bar.com
    secretName: name-of-app-tls
    ...
```

After you apply these changes to your ingress rules, you will need need to wait a minute or so for your SSL certificate to be issued and verified. When you try to load your domain name on your browser now, you should see a warning about an unsafe SSL certificate. That's good! It means that a certificate was issued to you successfully. Let's Encrypt staging certificates are not safe on purpose. They are only used for testing purposes.

Now, go back into your ingress rules and change to using `letsencrypt-production` as the issuer. Apply these changes to your cluster, wait, and you should now see https connections to your application when loading your domain in the browser.

> Note: If you run `kubectl describe certificate safety-app-tls --namespace=namespace-name` and it does _not_ say `Certificate issued successfully`, then you have an issue somewhere. Follow [this guide](https://cert-manager.io/docs/faq/acme/) to help you debug what is wrong. I had to debug once and found out that I had limited my resources for a namespace too much which would not allow me to launch a new pod. I changed my resources to make room since SSL auto renew would need pods made in the future.

# Helm

We use the tool [Helm](https://helm.sh) to install our application into our k8s cluster. You don't need to learn about Helm to use it in this project as everything is already setup for you. All of the k8s files are stored in `charts/templates/`. 

What you need to do is... 
1. Open up `charts/Chart.yaml` and edit `app-name-here` to the name of your application. 
2. Edit `charts/values.yaml` to values that you want for your application. You can enable/disable SSL, setup ingress rules, etc. 

# Autoscaling

Autoscaling comes in 2 forms. Autoscaling the number of pods for a deployment and autoscaling the nodes in the cluster. We are going to talk about both here. That way we can setup the cluster for full scaling automation.

## Horizontal Pod Autoscaler (HPA)

[HPA](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) is a kubernetes feature that allows you to automatically scale the number of replicas (aka: the number of pods running your application).

Resources:

- [Official DO guide](https://www.digitalocean.com/community/tutorials/how-to-autoscale-your-workloads-on-digitalocean-kubernetes) - recommended to check this out because you have to modify the metrics server a little bit to get it to work with DO.

### Install

- First, it is assumed that you have set resource limits on your pod instances via deployment resource limits:

```
apiVersion: extensions/v1beta1
kind: Deployment
spec:
  replicas: 1
    spec:
      containers:
      - name: app
        image: app:0.2.5
        resources:
          limits: # the limit the container can use
            memory: "128Mi"
            cpu: "250m" # 1/4 a cpu core
          requests: # considered the minimum resources required for a container to run properly
            memory: "64Mi" # 64mb
            cpu: "200m"
```

- Next, let's install the metrics server that will monitor our cluster.

```
helm install metrics-server stable/metrics-server
```

After helm says that resources have been made successfully, you need to wait ~30 sec or so for the pods to be made. You will know when the metrics server is deployed when you can run `kubectl top pod` and it says `Error: Metrics not available for pod` back at you.

- **If you are using DigitalOcean for your k8s cluster provider, you need to follow this step.** Now is the time to edit the configuration of the metrics server to work with DigitalOcean. Read [the official doc](https://www.digitalocean.com/community/tutorials/how-to-autoscale-your-workloads-on-digitalocean-kubernetes) to learn more about this error and why it happens. We will just go over how to fix it here.

```
kubectl edit deployment metrics-server
```

Using your text editor, you need to edit the metrics server deployment. Edit the `cluster` part to add a new flag. It should look like this after you're done:

```
...
  template:
    metadata:
      creationTimestamp: null
      labels:
        app: metrics-server
        release: metrics-server
    spec:
      affinity: {}
      containers:
      - command:
        - /metrics-server
        - --cert-dir=/tmp
        - --logtostderr
        - --secure-port=8443
        - --metric-resolution=20s # time period when a metrics scrape is done
        - --kubelet-preferred-address-types=InternalIP # This is what you're adding
...
```

After you save, the deployment will run again. It may take a couple minutes now for this to deploy and measure stats. You know everything works when you run `kubectl top pod` and get something like this:

```
NAME                             CPU(cores)   MEMORY(bytes)
metrics-server-ffd7f7576-rcq54   2m           12Mi
```

- That's it for installing. To enable autoscaling for your application, run this command against your deployment:

```
kubectl autoscale deployment <deployment-name> --max=4 --cpu-percent=80
```

What this is saying is to enable autoscaling for a specific deployment to a maximum replicas equal to 4. Only scale up when the CPU percentage of containers is at >=80% of the total used CPU available to that container.

### Test

Let's run some CPU heavy tasks to test that our scaling works.

```
kubectl create deployment test-scaling --image=nginx:latest
```

Now, let's edit this deployment to add resource limits.

```
kubectl edit deployment test-scaling
```

Edit the resource limits to:

```
...
    spec:
      containers:
      - image: nginx:latest
        imagePullPolicy: Always
        name: nginx
        resources:
          limits:
            cpu: 300m
          requests:
            cpu: 100m
            memory: 250Mi
```

Let's enable scaling for our test deployment: `kubectl autoscale deployment test-scaling --max=4 --cpu-percent=80`

In your terminal, run: `watch "kubectl top pods"` to be able to watch it rise up.

Let's bash into 1 of the pods that you see in the `top pods` command.

```
kubectl exec -it test-scaling-f765fd676-s9729 /bin/bash
```

> Note: replace `test-scaling-f765fd676-s9729` with a pod listed from `kubectl top pods` command

Let's install a tool called [stress](https://packages.ubuntu.com/xenial/devel/stress). `apt update; apt-get install -y stress`

Now, run: `stress -c 3`

Watch the `top pods` window. You should see pods being created.

```

NAME                                      CPU(cores)   MEMORY(bytes)
metrics-server-db745fcd5-v8gv6            6m           16Mi
test-scaling-555db5bf6b-ck98q             0m           2Mi
test-scaling-555db5bf6b-f7btr             494m         21Mi
test-scaling-555db5bf6b-h5cbx             0m           1Mi
test-scaling-555db5bf6b-pvh9f             0m           2Mi
```

We used to see only 1 `test-scaling` pod but now we see more!

Once you have tested this works, let's delete the deployment to mark our deployment as successful.

```
kubectl delete deployment/test-scaling
```

## Vertical k8s autoscaling

Cluster Autoscaler is a feature of your k8s provider. Cluster Autoscaler automatically creates new nodes for your cluster automatically when needed and removes nodes when they are not being used. You set a minimum and maximum number of nodes to the configuration and done!

For DigitalOcean, [follow these instructions](https://www.digitalocean.com/docs/kubernetes/how-to/autoscale/) to enable Cluster Autoscaler.

# Upgrade cluster

Your k8s cluster must update at some point to make sure the software version is up-to-date at all times.

Some k8s cluster providers, like DigitalOcean, allows you to enable automatic upgrades which will automatically install the latest k8s version for you.

> Note: You don't get to specify the migration window for upgrades. DigitalOcean decides that for you. However, as long as you specify some config options, you can avoid downtime.

When this upgrade is happening, your application may experience downtime. We want to enable this feature called [PDB](https://kubernetes.io/docs/tasks/run-application/configure-pdb/) to prevent downtime during upgrades. PDB is a feature that makes sure there are enough healthy pods of your app running before any upgrade or other disruptive operation is run such as auto scaling. This is to make sure that an upgrade doesn't run at a bad time which causes extra load on your app.

See `k8s/app-pdb.yaml` to see an example of a k8s manifest file for PDB setup.

Once you apply your PDB configuration, you know you have it configured correctly if you can run `kubectl get poddisruptionbudgets` and see something like this:

```
NAME      MIN-AVAILABLE   ALLOWED-DISRUPTIONS   AGE
zk-pdb    2               1                     7s
```

The key here is that `ALLOWED-DISRUPTIONS` is not 0. If 0, it might indicate that the PDB has not matched to the app.

# Private Docker image registry

We are storing our Docker images in a private image registry to keep them private and secure. See the [doc on private Docker registry](./PRIVATE_DOCKER_REGISTRY.md) to learn how to get this setup.

# Misc

This section of the document is optional to read. You can skip it unless you have been directed here to follow specific instructions.

## Ingress controller on DigitalOcean extra setup

This section goes over a few changes to make to the ingress controller to make it better for DigitalOcean.

To prepare for this section, go to the [official ingress controller installation doc and download the yaml file for DigitalOcean](https://kubernetes.github.io/ingress-nginx/deploy/#digital-ocean). We are going to modify this ingress controller yaml file and apply that to our cluster.

##### Fix cert-manager connection timeout issue

When using cert-manager with the official ingress controller on DigitalOcean k8s, you may encounter the issue _"cert-manager connect: connection timed out"_ for the cert-manager challenge. This issue will make it so certificates cannot get created nor renewed.

According to [DigitalOcean's kubernetes loadbalancer service document](https://github.com/digitalocean/digitalocean-cloud-controller-manager/blob/master/docs/controllers/services/annotations.md#servicebetakubernetesiodo-loadbalancer-hostname) this is a known issue with cert-manager.

> This can be used to workaround the issue of [kube-proxy adding external LB address to node local iptables](https://github.com/kubernetes/kubernetes/issues/66607) rule, which will break requests to an LB from in-cluster if the LB is expected to terminate SSL or proxy protocol.

Luckily, there is [a workaround](https://github.com/kubernetes/ingress-nginx/issues/3996#issuecomment-566460867). Let's get into more details on how to install this workaround.

In the yaml file you downloaded, find the section:

```yaml
apiVersion: v1
kind: Service
metadata:
  annotations:
    service.beta.kubernetes.io/do-loadbalancer-enable-proxy-protocol: "true"
spec:
  type: LoadBalancer
```

...and add...

```yaml
service.beta.kubernetes.io/do-loadbalancer-hostname: "kube.XXX.com" # replace XXX with your domain name
```

Now, go into your DNS and create a new A record entry for `kube.XXX.com` where the value is the value of `EXTERNAL-IP` when you run the command `kubectl get svc -n ingress-nginx`.

After you apply these changes to your cluster and you run the command `kubectl get svc -n ingress-nginx` you will not see an ip address for `EXTERNAL-IP` anymore. You will see `kube.xxx.com`! The ingress controller is successfully supplying the pods with the correct ip address value now.

##### Better healthchecks

In the yaml file you downloaded, find the section:

```yaml
apiVersion: v1
kind: Service
metadata:
  annotations:
    service.beta.kubernetes.io/do-loadbalancer-enable-proxy-protocol: "true"
spec:
  type: LoadBalancer
```

Add these entries:

```yaml
service.beta.kubernetes.io/do-loadbalancer-healthcheck-path: "/healthz"
service.beta.kubernetes.io/do-loadbalancer-healthcheck-protocol: http
```

This means that we want our DigitalOcean load balancer's healthcheck to use HTTP instead of TCP and we want to ping the ingress controller to be our healthcheck path (`/healthz` is defined in the ingress-controller yaml file under `Deployment` section). I have found that this method of healthcheck is more reliable.

##### DaemonSet

In the yaml file you downloaded, file the section:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    helm.sh/chart: ingress-nginx-3.4.1
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/version: 0.40.2
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: controller
  name: ingress-nginx-controller
  namespace: ingress-nginx
```

Change `Deployment` to `DaemonSet`. This will modify your ingress controller to be a DaemonSet instead of a regular deployment. [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/)s are like deployments except they make sure that there is always 1 pod of that application running in every node of the cluster. No more, no less. From some research I have done, it seems that the ingress controller just needs 1 pod per node to be speedy and reliable for it's job. Also, this makes the application more reliable because with a regular deployment, you might have all of your ingress controller pods in 1 node. If that node has a failure and goes down, your application will experience downtime.
