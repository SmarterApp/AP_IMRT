## AWS Deployment for IMRT
### Table Of Contents
* [Reference](#reference)
* [Deployment Instructions](#deployment-instructions)
* [Updating Applications](#updating-applications)

<a name="reference"></a>
### Reference
This section records all details that will facilitate configuration and maintenance of the system. 

* Deployment Repository: https://gitlab.com/fairwaytech/IMRT_Deployment
* Configuration Repository: 
    * URL: https://gitlab.com/fairwaytech/imrt-config-repo
    * config user: TODO
* AWS
    * AWS account: imrt-admin
    * Signin link: https://aws.amazon.com/console/
#### Development Deployment Reference
* AWS
    * Region: us-east-2 (Ohio)
    * domain: iis-awsdev.sbtds.org
* SSH RSA Key
    * imrt-admin
        
### Deployment Instructions
* Install AWS CLI - https://docs.aws.amazon.com/cli/latest/userguide/installing.html
* Install KOPS CLI - https://github.com/kubernetes/kops/blob/master/docs/install.md
* Create an IAM user in AWS if it doesn't already exist. It will need permissions as desribed here: https://github.com/kubernetes/kops/blob/master/docs/aws.md
* Configure AWS CLI for this user's access key and secret key (e.g. imrt-admin) using <pre>aws configure</pre>
* Create an ssh key for the ops user to login to the cluster instances:
    <pre>ssh-keygen -t rsa -C "IMRT OPS" -f imrt-admin</pre>
* Create versioned S3 bucket for storing configuration using console or CLI.
    <pre>aws s3 mb s3://kops-imrt-dev-state-store --region us-east-2</pre>
    <pre>aws s3api put-bucket-versioning --bucket kops-imrt-dev-state-store --versioning-configuration Status=Enabled</pre>
* Create cluster. For the initial dev environment I used the new "Gossip" approach to avoid having to deal with DNS at all. I liked it! To use that, make sure you name ends with .k8s.local. This command sets up the configuration for the cluster, but don't let the name fool you, it doesn't actually create anything in AWS
    <pre>
   kops create cluster \
      --zones us-east-2c \
      --name dev.imrt.k8s.local \
      --state s3://kops-imrt-dev-state-store \
      --ssh-public-key="~/.ssh/imrt-admin.pub"
   </pre>
* Edit the cluster configuration and change any settings you don't like, paying particular attention to the number of nodes and the size of the EC2 instances. For dev there are 2 "nodes" and one "master". You can find some documentation here: https://github.com/kubernetes/kops/blob/master/docs/instance_groups.md, some useful commands are:
   <pre>
   kops get instancegroups --name dev.imrt.k8s.local --state s3://kops-imrt-dev-state-store
   NAME			ROLE	MACHINETYPE	MIN	MAX	ZONES
   master-us-east-2c	Master	t2.medium	1	1	us-east-2c
   nodes			Node	t2.medium	2	2	us-east-2c

   kops edit ig master-us-east-2c --name dev.imrt.k8s.local --state s3://kops-imrt-dev-state-store
   kops edit ig nodes --name dev.imrt.k8s.local --state s3://kops-imrt-dev-state-store
   </pre>
* Now you actually create the cluster in AWS. 
   <pre>kops update cluster --name dev.imrt.k8s.local --state s3://kops-imrt-dev-state-store --yes</pre>
   This can take a really long time - 10 minutes up to an hour. Keep executing the validate command until you get a valid result
   <pre>kops validate cluster</pre>
   At this point you can go and look in AWS console and see the EC2 instances that have been created for your cluster. You can also try out some kubectl commands to check things out: https://kubernetes.io/docs/reference/kubectl/cheatsheet/
   
* Install and configure services
   * Clone the deploment repository and change into the directory with the yml files you want to use
   <pre>
   git clone https://gitlab.com/fairwaytech/IMRT_Deployment.git
   cd IMRT_Deployment/awsdev
   </pre>
   * Edit the configuration-service.yml file locally and set the GIT_PASSWORD, and ENCRYPT_KEY values. Do not check in these credentials!
   * Edit the iis.yml file locally and set the SPRING_CLOUD_CONFIG_LABEL value. This should match the branch in the config repo that you want to use for this deployment.
   * The value for itembank.accessToken in the ap-imrt-iis.yml file on the selected branch in the config repo must match the IAT Gitlab instance you are using, and must be encrypted with the ENCRYPT_KEY set for the configuration service.
   * Create the services
   <pre>
   kubectl create -f configuration-service.yml
   kubectl create -f iis.yml
   </pre>
* Configure external ports
   * By default, kops opens the SSH port on all the EC2 instances in your cluster. I haven't found a way yet to get it not to do that, though I think this might be one method:  https://kubernetes.io/docs/concepts/services-networking/network-policies
   * If you want to shut down the ssh ports manually, you need to go into the AWS console, got to 'Services', 'EC2'. Find all the instances belonging to your cluster. For each instance, scroll all the way over to the right and click on their security group link. From here you can remove the rule for SSH access.
   * The IIS application currently exposes its REST endpoint on port 30000, using a k8s NodePort configuration (see iis.yml). We may want to modify this in future to use a load balancer, which will almost certainly be required for ISS, but for now we just need to expose this port. Edit the master security group, and add a custom TCP Rule to allow inbound TCP traffic on port 30000.
* Configure domain
   * At this point, you can access the IIS REST endpoints using the public IP of any of the EC2 instances. However, if the cluster is modified or re-created in such a way that these IPs change, they all users will have to be notified, and eventually when we have the webhook support in, all the webhooks would have to be updated. To avoid this, we can map an FQDN to our master EC2 instance, which has port 30000 open on it. Then if something changes, we just have to update the mapping.
   * For now we are just using the existing sbtds.org domain that has already been created. Using AWS console, select 'Services', 'Route 53', and then click on 'Hosted zones' option down the left hand side. Choose the sbtds.org domain, and click the 'Create Record Set' button at the top. From here you can create a record that maps from your domain (for example iis-awsdev.sbtds.org) to your master instance in EC2.
   * Validate your mapping by using a browser or curl to hit the REST endpoints of IIS on port 30000:
   <pre>
      curl http://iis-awsdev.sbtds.org:30000/info
      {"build":{"version":"0.1.11","artifact":"ap-imrt-iis","name":"ap-imrt-iis","group":"org.opentestsystem.ap","time":"2018-02-06 22:27:26+0000","by":"root"}}   </pre>
   * NOTE: You will have to update the domain mapping any time the EC2 instance for the cluster master changes.

### Updating Applications
   * Updating applications is done via kubectrl, which requires that kubectrl is first configured to point to the cluster in question: <pre>kops export kubecfg --state s3://kops-imrt-dev-state-store --name dev.imrt.k8s.local</pre>
#### Updating Docker Image Version
   * When a new docker image version is available, it can be updated: <pre>kubectl set image deployment/ap-imrt-iis-deployment ap-imrt-iis=fwsbac/ap-imrt-iis:@version@
#### Updating YML file
   * When changes are made to a YML file, they can be applied to the cluster: <pre>kubectl apply -f xxx-service.yml</pre>
   
