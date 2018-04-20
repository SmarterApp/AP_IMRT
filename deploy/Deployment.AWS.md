# AWS Deployment for IMRT
## Table Of Contents
* [Reference](#reference)
* [Deployment Instructions](#deployment-instructions)
* [Updating Applications](#updating-applications)
* [Common Tasks](#common-tasks)

<a name="reference"></a>
## Reference
This section records all details that will facilitate configuration and maintenance of the system.

* Deployment Repository: https://gitlab.com/fairwaytech/IMRT_Deployment
* Configuration Repository:
    * URL: https://gitlab.com/fairwaytech/imrt-config-repo
* AWS
    * AWS account: imrt-admin
    * Signin link: https://aws.amazon.com/console/
#### Development Deployment Reference
* AWS
    * Region: us-east-2 (Ohio)
    * domain: iis-awsdev.sbtds.org
* SSH RSA Key
    * imrt-admin
* Database
    * instance name - imrt-db-dev
    * username - imrt_admin
    * database name - imrt
* Graylog
    * EC2 instance name - imrt-graylog-dev

### QA Deployment Reference
* AWS
    * Region: us-east-2 (Ohio)
    * domain: iis-awsqa.sbtds.org
* SSH RSA Key
    * imrt-admin
* Database
    * instance name - imrt-db-qa
    * username - imrt_admin
    * database name - imrt
* Graylog
    * EC2 instance name - imrt-graylog-qa

## Deployment Instructions

### Deploy Kubernetes Cluster
* Install [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)
* Install [KOPS CLI](https://github.com/kubernetes/kops/blob/master/docs/install.md)
* Create an IAM user in AWS if it doesn't already exist. This user will need permissions as desribed [here](https://github.com/kubernetes/kops/blob/master/docs/aws.md).
* Configure AWS CLI for this user's access key and secret key (e.g. `imrt-admin`) using <pre>aws configure</pre>
* Create an ssh key for the ops user to login to the cluster instances:
    <pre>ssh-keygen -t rsa -C "IMRT OPS" -f imrt-admin</pre>
* Create versioned S3 bucket for storing configuration using console or CLI:
    <pre>aws s3 mb s3://kops-imrt-dev-state-store --region us-east-2</pre>
    <pre>aws s3api put-bucket-versioning --bucket kops-imrt-dev-state-store --versioning-configuration Status=Enabled</pre>
* Create cluster. For the initial dev environment I used the new "Gossip" approach to avoid having to deal with DNS at all. I liked it! To use that, make sure you name ends with `.k8s.local`. Make sure you provide at least 2 availability zones in the `--zones` argument, this is required to be able to add the database to the VPC that is created by `kops`. This command sets up the configuration for the cluster, but don't let the name fool you, it doesn't actually create anything in AWS.
    <pre>
   kops create cluster \
      --zones us-east-2b,us-east-2c \
      --name dev.imrt.k8s.local \
      --state s3://kops-imrt-dev-state-store \
      --ssh-public-key="~/.ssh/imrt-admin.pub"
   </pre>
* Edit the cluster configuration and change any desired settings, paying particular attention to the number of nodes and the size of the EC2 instances. For dev there are 2 "nodes" and one "master". You can find some documentation [here](https://github.com/kubernetes/kops/blob/master/docs/instance_groups.md).  Some useful commands are:
   <pre>
   kops get instancegroups --name dev.imrt.k8s.local --state s3://kops-imrt-dev-state-store
   NAME			ROLE	MACHINETYPE	MIN	MAX	ZONES
   master-us-east-2c	Master	t2.medium	1	1	us-east-2b
   nodes			Node	t2.medium	2	2	us-east-2b,us-east-2c

   kops edit ig master-us-east-2b --name dev.imrt.k8s.local --state s3://kops-imrt-dev-state-store
   kops edit ig nodes --name dev.imrt.k8s.local --state s3://kops-imrt-dev-state-store
   </pre>
* Now you actually create the cluster in AWS.
   <pre>kops update cluster --name dev.imrt.k8s.local --state s3://kops-imrt-dev-state-store --yes</pre>
   This can take a really long time - 10 minutes up to an hour. Keep executing the validate command until you get a valid result
   <pre>kops validate cluster</pre>
   At this point you can go and look in AWS console and see the EC2 instances that have been created for your cluster. You can also try out some kubectl commands to check things out: https://kubernetes.io/docs/reference/kubectl/cheatsheet/

### Create the Database
The database that supports IMRT will be an Amazon Aurora Cluster using the PostgreSQL-compatible database engine.  Follow these steps to create the IMRT database server:

#### Select Engine
* From **Engine Options**, choose **Amazon Aurora**
* Under **Edition** at the bottom of the **Engine Options**, choose **PostgreSQL-compatible**

#### Specify DB Details
* Choose a **DB engine version** that complies with your institution's standards
  * For IMRT, we chose 9.6.6
* Choose a **DB Instance Class** that is the appropriate size for your IMRT deployment
  * `db.r4.large` is the minimum
* Settings:
  * Provide a meaningful **DB Instance Identifier**
    * Use a name that complies with your institution's server naming policy
  * Provide a **Master username**
    * for IMRT, we use `imrt_admin`
  * Provide a **Master password**
    * Use a password that complies with your institution's password policy

#### Advanced Settings
* Choose the same VPC as the k8s cluster currently being deployed (e.g. `dev.imrt.sbtds.org`)
  * This should automatically choose the correct subnet group
* Set the **Public Accessibility** to **Yes**
* Choose an availability zone for the RDS instance to reside in
* Choose an appropriate security group
  * if an appropriate security group is not available, select **Create New Security Group**
  * _**OPTIONAL:**_ Remove the `default` security group
* Provide a meaningful DB cluster identifier
* Provide a database name `imrt`
  * This will inform RDS to create a database named `imrt`.
  * Without this, RDS will not create a database; it will have to be created by some other means (i.e. manually)
* Choose a database port (default is 5432)
* Choose a **DB Parameter Group** appropriate for the chosen database engine (e.g. `default.aurora-postgresql9.6`)
* Choose a **DB Cluster Parameter Group** appropriate for the chosen database cluster (e.g. `default.aurora-postgresql9.6`)
* Decide whether to enable encryption based on your institution's policies 
  * Managing database encryption is beyond the scope of this checklist
* Failover:
  * choose priority (default is no preference)
  * `Tier 0` is highest, `Tier 15` is lowest
* Backup:
  * Choose a retention policy that complies with your institution's standards
* Monitoring:
  * This is optional; enable based on your institution's policy
* Performance Insights:
  * This is optional; enable based on your institution's policy
* Maintenance:
  * Recommend **Enable auto minor version upgrade**, but choose an option that complies with your institution's standards.
  * If **Enable auto minor version upgrade** is enabled, select a maintenance window that complies with your institution's standards

#### Monitor Creation of Aurora Cluster
After clicking the **Create DB Instance** button, two instances will appear in the RDS **Instances** dashboard.  These are members of the cluster that was created in the previous steps.  Below are some details about the cluster that was created:

* one instance with the name specified in the **DB Cluster Instance Identifier**
* a second instance with the name specified in the **DB Cluster Instance Identifier** with the availability zone appended to the end of the name.
  * Example:
    * `imrt-db-dev-aurora`
    * `imrt-db-dev-aurora-us-east-2b`

To view the cluster details, select the RDS **Clusters** dashboard.  From here, the **reader** and **writer** instances can be identified.

_**OPTIONAL:**_ Rename the reader instance to something meaningful.  For example, `imrt-db-dev-aurora-us-east-2b` can be renamed to `imrt-db-dev-aurora-search` to indicate it is a replica intended to support the IMRT search API.  When making this change, be sure to select the **Apply Immediately** option if in a position to do so: this operation may incur downtime/service interruption while AWS makes the change.

#### Update Security Groups
* Once your instance is up, find the **Security groups** section and click on the security group.
  * Give the created group a name so it is easy to find in future, for example `imrt-dev-db`
  * Select the security group checkbox on the left, and you will see details at the bottom. Under **Inbound** there will be a rule already created for the IP of the computer used to create the database instance. If you want to connect from other IP addresses you will have to add rules for them here.
* Create a new **Inbound Rule**, giving the k8s nodes access to port 5432. Select **Edit** -> **Add Rule**. Rule settings will be:
  * Type = **Custom TCP**
  * Port = **5432**
  * Source = **Custom**:  Start typing "nodes" in the address box. The security group for the nodes should come up as a suggestion that can be selected
  * Description = This field is optional, but recommended.  Provide a brief description of the inbound rule, e.g. "Kubernetes cluster group"

#### Create the `imrt` Schema on the Cluster
Now that the Aurora Postgres cluster has been created, the `imrt` database schema must be created.  Follow the steps
outlined int the [AP\_IRMT\_Schema](https://github.com/SmarterApp/AP_IMRT_Schema) repository to create the required database objects (users, tables, etc).

#### Running Flyway Against the Aurora Postgres Cluster
* Set the `url` to the **Cluster endpoint** value defined in the RDS dashboard
* After Flyway's execution completes, the `imrt` schema should be replicated to the "read only" replica

#### Verify Schema Creation
Use the following steps to verify the `imrt` schema has been created on the cluster:

* Connect to the **Cluster endpoint** and run the `\dt` command to view the tables in `imrt`.  An example is shown
below:

```
psql -h [cluster endpoint host] -U imrt_admin imrt
Password for user imrt_admin:
psql (10.3, server 9.6.6)
SSL connection (protocol: TLSv1.2, cipher: ECDHE-RSA-AES256-GCM-SHA384, bits: 256, compression: off)
Type "help" for help.

imrt=> \dt
                     List of relations
 Schema |             Name             | Type  |   Owner
--------+------------------------------+-------+------------
 public | batch_job_execution          | table | imrt_admin
 public | batch_job_execution_context  | table | imrt_admin
 public | batch_job_execution_params   | table | imrt_admin
 public | batch_job_instance           | table | imrt_admin
 public | batch_step_execution         | table | imrt_admin
 public | batch_step_execution_context | table | imrt_admin
 public | flyway_schema_history        | table | imrt_admin
 public | item                         | table | imrt_admin
 public | item_git                     | table | imrt_admin
 public | item_log                     | table | imrt_admin
 public | project_lock                 | table | imrt_admin
 public | stim_link                    | table | imrt_admin
(12 rows)

imrt=> \q
```

* Connect to the **Reader endpoint** and run the `\dt` command to view the tables in `imrt`.  An example is shown
below:

```
psql -h [reader endpoint host] -U imrt_admin imrt
Password for user imrt_admin:
psql (10.3, server 9.6.6)
SSL connection (protocol: TLSv1.2, cipher: ECDHE-RSA-AES256-GCM-SHA384, bits: 256, compression: off)
Type "help" for help.

imrt=> \dt
                     List of relations
 Schema |             Name             | Type  |   Owner
--------+------------------------------+-------+------------
 public | batch_job_execution          | table | imrt_admin
 public | batch_job_execution_context  | table | imrt_admin
 public | batch_job_execution_params   | table | imrt_admin
 public | batch_job_instance           | table | imrt_admin
 public | batch_step_execution         | table | imrt_admin
 public | batch_step_execution_context | table | imrt_admin
 public | flyway_schema_history        | table | imrt_admin
 public | item                         | table | imrt_admin
 public | item_git                     | table | imrt_admin
 public | item_log                     | table | imrt_admin
 public | project_lock                 | table | imrt_admin
 public | stim_link                    | table | imrt_admin
(12 rows)

imrt=> \q
```

### Deploy And Configure Services
* Install and configure services
   * Clone the deploment repository and change into the directory with the yml files you want to use
   <pre>
   git clone https://gitlab.com/fairwaytech/IMRT_Deployment.git
   cd IMRT_Deployment/awsdev
   </pre>
   * Edit the `configuration-service.yml` file locally and set the `GIT_PASSWORD`, and `ENCRYPT_KEY` values. _**NOTE:**_ _Do not check in these credentials!_
   * Create the configuration service
   <pre>kubectl apply -f configuration-service.yml</pre>
   * Edit the `rabbit-cluster.yml` file and set the `RABBITMQ_DEFAULT_PASS` value. _**NOTE:**_ _Do not check in these credentials!_
   * Create the rabbit cluster
   <pre>
   kubectl apply -f rabbitmq_rbac.yml
   kubectl apply -f rabbit-cluster.yml
   </pre>
   * Wait until the rabbit pods are up, you can monitor them using `kubectl get po`. 
   * You can monitor the rabbit management interface on the master node of your cluster, port 31672.
   * Edit the `iis.yml` and `iss.yml` files locally and set the `SPRING_CLOUD_CONFIG_LABEL` value.
     * This should match the branch in the config repo that you want to use for this deployment.
   * The value for `itembank.accessToken` in the `ap-imrt-iis.yml` file on the selected branch in the config repo must match the IAT Gitlab instance you are using, and must be encrypted with the `ENCRYPT_KEY` set for the configuration service. You can encrpyt a value on the configuration service using `kubectl` like this (use `kubectl get pods` to get the pod name):
   <pre>
   kubectl exec configuration-deployment-778dbb5675-pcwc7 -- curl http://localhost:8888/encrypt -d 'Test'
   </pre>
   * The value for `spring.rabbitmq.password` in the `ap-imrt-iis.yml` file on the selected branch in the config repo must match the rabbit password you set above, and must be encrypted with the `ENCRYPT_KEY` set for the configuration service. You can encrpyt a value on the configuration service as described above.
   * Create the other application services
   <pre>
     kubectl apply -f iis.yml
     kubectl apply -f iss.yml
   </pre>
* Configure external ports
   * By default, `kops` opens the SSH port on all the EC2 instances in your cluster.  [This might be one method](https://kubernetes.io/docs/concepts/services-networking/network-policies) to avoid making the SSH port publicly available on the nodes created by `kops`.
   * If you want to shut down the ssh ports manually, take the following steps in the AWS console:
     * Go to **Services** -> **EC2**
     * Find all the instances belonging to your cluster
     * For each instance, scroll all the way over to the right and click on their security group link
     * From here you can remove the rule for SSH access
* Create nginx ingress and load balancer
   <pre>
   kubectl apply -f imrt-ingress.yml
   kubectl apply -f default-backend.yaml
   kubectl apply -f nginx-controller.yml
   kubectl apply -f load-balancer.yml
   </pre>
* Find the loadbalancer
   * A loadbalancer has now been created in AWS. To find it, first use kubectl:
   <pre>
   kubectl describe svc ingress-nginx -n kube-system | grep LoadBalancer
   </pre>
   From the response, look for a line like:
   <pre>
   LoadBalancer Ingress:     af909e7b316b511e8b7d50a62d3a6aa8-729550325.us-east-2.elb.amazonaws.com
   </pre>

#### Configure Domains
To provide external access to the IMRT applications with AWS Route53, follow these steps in the AWS console:

* Select **Services** -> **Route 53**
* Click on the **Hosted zones** option down the left hand side
* Choose the appropriate domain (e.g. `sbtds.org`) and click the **Go to Record Sets** button at the top
* Click **Create Record Set**
* Create a `CNAME` record that maps from your domain (for example `iis-example.sbtds.org`) to the load balancer identified earlier in this checklist.
   * Validate your mapping by using a browser or curl to hit the REST endpoints of IIS:
   <pre>
      curl https://iis-awsdev.sbtds.org:/info
      {"build":{"version":"0.1.11","artifact":"ap-imrt-iis","name":"ap-imrt-iis","group":"org.opentestsystem.ap","time":"2018-02-06 22:27:26+0000","by":"root"}}   </pre>
   * **NOTE:** You will have to update the domain mapping any time the loadbalancer changes.

### Create the Graylog Server
Graylog will be installed in AWS following the directions [here](http://docs.graylog.org/en/2.4/pages/installation/aws.html):

* From the link, above, click on **Select your AMI and AWS Region**, and then choose the latest version and the region you are deploying to. This will launch a wizard to create an EC2 instance for the Graylog server
    * Select `t2.medium` or larger, then **Next: Configure Instance Details**
    * For network, select the VPC for the Kubernets cluster from the dropdown, for example `dev.imrt.k8s.local`
    * For Auto-assign Public IP select **Enable**
    * For IAM role, create a new IAM role that has full EC2 access
    * Select **Next: Add Storage**
    * Select **Next: Add Tags**
    * Select **Next: Configure Security Group**
    * Create a new security group and give it a name, for example `imrt-graylog-dev`. For now you can just leave the ssh rule, this will be configured later on in the process.
    * Select **Review and Launch**
    * Select **Launch**
    * You will be prompted to supply an ssh key, you can select the same one used for creating the k8s cluster from the dropdown.
    * Click on the EC2 instance, and give it a name, for example `imrt-graylog-dev`
* When the EC2 Instance comes up, ssh into it using the username `ubuntu` and the key you provided above.
* Configure the server as described [here](http://docs.graylog.org/en/2.4/pages/installation/aws.html). 
  * Stick to `http` for now, don't configure `https` 
  * Use the default ports
  * Make sure you change the password for the web interface
* Configure the security group
    * The security group should allow access to ports 22, 80, 9000 from you own IP address, to be able to ssh in and to login to the web interface.
    * Set up UDP access to port 12201 from the k8s nodes security group. This will allow logging from the nodes to reach the server.
* Login to the web interface and verify correct operation

#### Configure the Domain
From the AWS Console:

* Select **Services** -> **Route53**
* Click on the **Hosted zones** option down the left hand sied
* Choose the appropriate domain (e.g. `sbtds.org`) and click the **Go to Record Sets** button at the top
* Click **Create Record Set** Give it a name like `imrt-graylog-dev`
* Set the type to `CNAME`, and the **Value** to the domain name of your EC2 instance, for example `ec2-18-219-212-106.us-east-2.compute.amazonaws.com`.
* Verify that you can get the web interface using the new domain name you just created.
* Point the IIS and ISS applications at the new graylog server
    * Edit `iis.yml` and `iss.yml` and set the value for the `GRAYLOG_HOST` parameter to match the domain name you created above, for exampl `imrt-graylog-dev.sbtds.org`
    * Redeploy the yml files
    <pre>
    kubectl apply -f iis.yml
    kubectl apply -f iss.yml
    </pre>
* Verify that you see logs from both applications in the graylog web interface

### Create the IAT System Hook

In order to receive notifications that projects have been added to the Item Bank in GitLab, a system hook must be installed.

* Login to the GitLab instance associated with your deployment, for example `https://gitlab-dev.smarterbalanced.org/`. You must have enough permissions to create a system hook.
* Select **Admin area** by clicking on the small wrench icon on the top right.
* Select **System Hooks** from the set of tabs across the top of the Admin  Area
* Enter the URL for the IIS interface, for example `http://iis-awsdev.sbtds.org/systemHook`
* Make sure Push events and Enable SSL verification are selected
* Click on **Add system hook**. You will see the hook listed at the bottom of the screen. You can select Test hook, and you should see something in the IIS logs, though it may result in an error or exception. This is just to test connectivity.

### Item Sync Job

Once IMRT has been fully deployed, the database should be synchronized with the ItemBank. This can be done by performing a manual run of the item sync job.

* Run `kubectl get po` to find the name of a pod that is running `ap-imrt-iis-deployment`
* Manually execute the item sync job on that pod.<pre>kubectl exec ap-imrt-iis-deployment-xxx -- curl "http://localhost/sync"</pre>
* Monitor the job using <pre>kubectl logs -f ap-imrt-iis-deployment-xxx</pre> and wait for it to complete.
* Once the initial sync has completed, deploy the cron job to run it on a periodic basis. The yml file can be edited to modify the schedule as required.<pre>kubectl apply -f sync-cron.yml</pre>

## Updating Applications
   * Updating applications is done via kubectrl, which requires that kubectrl is first configured to point to the cluster in question: <pre>kops export kubecfg --state s3://kops-imrt-dev-state-store --name dev.imrt.k8s.local</pre>
#### Updating Docker Image Version
   * When a new docker image version is available, it can be updated: <pre>kubectl set image deployment/ap-imrt-iis-deployment ap-imrt-iis=fwsbac/ap-imrt-iis:@version@
#### Updating YML file
   * When changes are made to a YML file, they can be applied to the cluster: <pre>kubectl apply -f xxx-service.yml</pre>
#### Updating SNAPSHOT image (no docker tag change) <pre>kubectl patch deployment ap-imrt-iis-deployment -p '{\"spec\":{\"template\":{\"metadata\":{\"labels\":{\"date\":\"%s\"}}}}}'
</pre>
replacing %s with the current date in epoch format.

## Common Tasks

### Creating SQL Logins for Business Intelligence Analysts
To create logins for users to run ad hoc queries against the RDS Postgres Aurora cluster, take the following steps:

* Connect to the **master** of the Aurora Postgres cluster
* Run the following SQL:
  * be sure to replace `[choose user name]` with a user name that complies with your institution's standards
  * be sure to replace `[choose a passowrd]` with a password that complies with your institution's standards

```sql
CREATE ROLE [choose user name] LOGIN PASSWORD '[choose a password]';

GRANT SELECT ON item TO [choose user name];
GRANT SELECT ON item_git TO [choose user name];
GRANT SELECT ON item_log TO [choose user name];
GRANT SELECT ON stim_link TO [choose user name];
```

This user will have the ability to:

* Read data from the tables in the `imrt` database that store item-related data
* Create temporary tables to store interim query results, etc

**NOTE:** Application-specific tables will not be available; these tables drive application functionality and will not provide data useful for reporting purposes.