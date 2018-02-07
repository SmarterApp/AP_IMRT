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
    <pre>aws s3 mb s3://kops-imrt-dev-state-store --region us-west-2</pre>
    <pre>aws s3api put-bucket-versioning --bucket kops-imrt-dev-state-store --versioning-configuration Status=Enabled</pre>
* Create cluster. For the initial dev environment I used the new "Gossip" approach to avoid having to deal with DNS at all. I liked it! To use that, make sure you name ends with .k8s.local. This command sets up the configuration for the cluster, but don't let the name fool you, it doesn't actually create anything in AWS
    <pre>
   kops create cluster \
      --zones us-east-2c \
      --name dev.imrt.k8s.local \
      --state s3://kops-imrt-dev-state-store \
      --ssh-public-key="~/.ssh/id_ops.pub"
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
   * Create the services
   <pre>
   kubectl create -f configuration-service.yml
   kubectl create -f iis.yml
   </pre>
* Configure external ports
* Configure domain

### Updating Applications
TODO
