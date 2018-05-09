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
> These deployment instructions were written and tested using **`kops 1.9.0`** and **`kubectl 1.10.0`**.  Using versions other than what is cited below may result in unpredictable results when standing up the cluster and/or deploying resources to it.

### Pre-requisites
* Install [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)
* Install `kops` and `kubectl` at the following versions:
  * `kops`: [1.9.0](https://github.com/kubernetes/kops/releases/tag/1.9.0)
  * `kubectl`: [1.10.0](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG-1.10.md#v1100)

#### Additional Links/Resources
* [`kops` Installation Instructions](https://github.com/kubernetes/kops/blob/master/docs/install.md)
* [`kubernetes` Documentation and Examples](https://kubernetes.io/docs/home/?path=users&persona=app-developer&level=foundational)

### Deploy Kubernetes Cluster
* Create an IAM user in AWS if it doesn't already exist. This user will need permissions as desribed [here](https://github.com/kubernetes/kops/blob/master/docs/aws.md).
* Configure AWS CLI for this user's access key and secret key (e.g. `imrt-admin`) using <pre>aws configure</pre>
* Create an ssh key for the ops user to login to the cluster instances:
    <pre>ssh-keygen -t rsa -C "IMRT OPS" -f imrt-admin</pre>
* Create versioned S3 bucket for storing configuration using console or CLI:
    <pre>aws s3 mb s3://kops-imrt-dev-state-store --region us-east-2</pre>
    <pre>aws s3api put-bucket-versioning --bucket kops-imrt-dev-state-store --versioning-configuration Status=Enabled</pre>
* Create cluster configuration.  Make sure you provide at least 2 availability zones in the `--zones` argument, this is required to be able to add the database to the VPC that is created by `kops`. This command creates and stores the configuration for the cluster, but nothing is actually created in AWS.

```
 kops create cluster \
    --zones=[comma-delimited list of availability zones] \
    --name=[name of cluster] \
    --dns-zone=[name of Route53 zone] \
    --ssh-public-key="[public key]" \
    --state=s3://[state store] \
    --authorization=AlwaysAllow 
```

* **Example:**

```
 kops create cluster \
    --zones=us-west-2a,us-west-2b \
    --name=dev.imrt.example.org \
    --dns-zone=example.org \
    --ssh-public-key="~/.ssh/imrt-admin.pub" \
    --state=s3://kops-imrt-dev-state-store \
    --authorization=AlwaysAllow 
  
```

* Edit the cluster configuration and change any desired settings, paying particular attention to the number of nodes, instance type and the size of the EC2 instances. For dev there are 2 "nodes" and one "master". You can find some documentation [here](https://github.com/kubernetes/kops/blob/master/docs/instance_groups.md).  

>_**IMPORTANT:  When choosing a node size, avoid using `m3` AWS instance types.**  During deployments to AWS, using `m3.medium` AWS EC2 instances resulted in unpredictable behavior.  Additionally, the `m3.medium` instance type was not available for use in some AWS availability zones.  Consult AWS documentation for details on instance type availability._  

* Edit the cluster configuration and change any desired settings, paying particular attention to the number of nodes and the size of the EC2 instances. For dev there are 2 "nodes" and one "master". You can find some documentation [here](https://github.com/kubernetes/kops/blob/master/docs/instance_groups.md).  Some useful commands are:
   <pre>
   kops get instancegroups --name dev.imrt.example.org --state s3://kops-imrt-dev-state-store
   NAME			ROLE	MACHINETYPE	MIN	MAX	ZONES
   master-us-east-2c	Master	t2.medium	1	1	us-east-2b
   nodes			Node	t2.medium	2	2	us-east-2b,us-east-2c

   kops edit ig master-us-east-2b --name dev.imrt.org --state s3://kops-imrt-dev-state-store
   kops edit ig nodes --name dev.imrt.example.org --state s3://kops-imrt-dev-state-store
   </pre>
   
* Now you actually create the cluster in AWS.
   <pre>kops update cluster --name dev.imrt.org --state s3://kops-imrt-dev-state-store --yes</pre>
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

### Create Business Intelligence Replica
To add another read-only replica to the Aurora Postgres cluster for business intelligence/reporting, take the following steps:

* In the RDS dashboard, select **Instances**
* Select the **master** RDS instance of the Aurora Postgres cluster
  * The **master** RDS instance is identified with the **writer** role in the RDS cluster details dashboard
* From the **Instance Actions** menu, select **Create Aurora Replica**
* Network & Security:
  * Choose an appropriate **Availability Zone**
  * Make this instance **Publicly Accessible**
* Encryption:
  * By default, the same encryption setting as the cluster's **master** instance will be selected
* Instance Specifications:
  * Choose a **DB Instance Class** that is the appropriate size for your IMRT deployment
  * `db.r4.large` is the minimum
* Settings:
  * Choose an **Aurora Replica Source**
    * By default, the instance selected in the second step will be selected
  * Provide a meaningful **DB instance identifier**
* Failover:
  * choose priority (default is no preference)
  * Tier 0 is highest, Tier 15 is lowest
* Backup:
  * Choose a retention policy that complies with your institution's standards
* Monitoring:
  * disabled for IMRT, up to installer/deployer to enable
* Performance Insights:
  * disabled for IMRT, up to installer/deployer to enable
* Maintenance:
  * Recommend **Enable auto minor version upgrade**, but choose an option that complies with your institution's standards.
  * If **Enable auto minor version upgrade** is enabled, select a maintenance window that complies with your institution's standards

#### Update Security Groups
* Once your instance is up, find the **Security groups** section and click on the security group.
  * Give the created group a name so it is easy to find in future, for example `imrt-dev-db`
  * Select the security group checkbox on the left, and you will see details at the bottom. Under **Inbound** there will be a rule already created for the IP of the computer used to create the database instance. If you want to connect from other IP addresses you will have to add rules for them here.
* Create a new **Inbound Rule**, giving the k8s nodes access to port 5432 (or whatever port was chosen when the DB instance was created). Select **Edit** -> **Add Rule**. Rule settings will be:
  * Type = **Custom TCP**
  * Port = **5432** (or whatever port was chosen when the DB instance was created)
  * Source = **Custom**:  Start typing "nodes" in the address box. The security group for the nodes should come up as a suggestion that can be selected
  * Description = This field is optional, but recommended.  Provide a brief description of the inbound rule, e.g. "Kubernetes cluster group"

#### Create the `imrt` Schema on the Cluster
Now that the Aurora Postgres cluster has been created, the `imrt` database schema must be created.  Follow the steps
outlined in the [AP\_IRMT\_Schema](https://github.com/SmarterApp/AP_IMRT_Schema) repository to create the required database objects (users, tables, etc).

#### Running Flyway Against the Aurora Postgres Cluster
* Set the `url` to the **Cluster endpoint** value defined in the RDS dashboard
* After Flyway's execution completes, the `imrt` schema should be replicated to the "read only" replica


### Create the Graylog Server
Graylog will be installed in AWS following the directions [here](http://docs.graylog.org/en/2.4/pages/installation/aws.html):

* From the link, above, click on **Select your AMI and AWS Region**, and then choose the latest version and the region you are deploying to. This will launch a wizard to create an EC2 instance for the Graylog server
    * Select `t2.medium` or larger, then **Next: Configure Instance Details**
    * For network, select the VPC for the Kubernets cluster from the dropdown, for example `dev.imrt.org`
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

#### Configure the Domain for the Graylog Server
From the AWS Console:

* Select **Services** -> **Route53**
* Click on the **Hosted zones** option down the left hand sied
* Choose the appropriate domain (e.g. `sbtds.org`) and click the **Go to Record Sets** button at the top
* Click **Create Record Set** Give it a name like `imrt-graylog-dev`
* Set the type to `CNAME`, and the **Value** to the domain name of your EC2 instance, for example `ec2-18-219-212-106.us-east-2.compute.amazonaws.com`.
* Verify that you can get the web interface using the new domain name you just created.

### Create GitLab User for IMRT Application
The IIS component of the IMRT application relies on a GitLab user account to read data from GitLab.  To create a GitLab user with appropriate permissions, log into GitLab and create a new user account.

#### Create Access Token
To create an access token (used by IMRT to fetch data from GitLab via the GitLab API), follow these steps:

* Log into GitLab with user account intended for IIS (the user account created in the previous step)
* Choose **Settings** from the user menu
* Choose **Access Tokens** menu
* Provide a meaningful name for the token
* Verify the access token is set to **Never expire**
* Choose **Access API** for Scope
* Click **Create Personal Access Token**
* Add GitLab User to the correct group specified in the config
* Make user an `auditor` member to provide read-only access to the content within the project group

#### Grant Access to the Project Group in Itembank
The IIS GitLab user account must have access to the GitLab project group that 

* Navigate to **Groups**
* Choose the right group (e.g. **iat-development**)
* Identify the IIS GitLab user account
* Click **Add Users to Group**

#### Verify Access
To verify the GitLab user is properly configured, the following command can be used:

```
curl -i --header "PRIVATE-TOKEN: [the access token of the IIS GitLab user]" https://[the GitLab domain]/api/v4/namespaces
```

If the access token is properly configured, the curl request will return a payload containing the list of namespaces available to the user.

* **Example (from [GitLab API Documentation](https://docs.gitlab.com/ee/api/namespaces.html)):**

  ```
  curl -i --header "PRIVATE-TOKEN: 9koXpg98eAheJpvBs5tK" https://gitlab.example.com/api/v4/namespaces
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
   * Edit the `rabbit-cluster.yml` file and set the following: 
     * `RABBITMQ_ERLANG_COOKIE` (this can be any alpha-numeric text value, avoid special characters)
     * `RABBITMQ_DEFAULT_USER`
     * `RABBITMQ_DEFAULT_PASS`
     * _**NOTE:**_ _Do not check in these credentials!_
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
   * Point the IIS and ISS applications at the new graylog server
     * Edit `iis.yml` and `iss.yml` and set the value for the `GRAYLOG_HOST` parameter to match the domain name you created above, for exampl `imrt-graylog-dev.sbtds.org`
* Verify that you see logs from both applications in the graylog web interface
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

<a name="configure-and-create-item-synchronization-cron-job"></a>
### Configure and Create Item Synchronization Cron Job
To ensure IMRT is up-to-date with the content stored in source control, the Item Synchronization Process should be configured to run at a regular interval.  To set up the cron job, follow these steps:

* Open the `sync-cron.yml` file, which will appear similar to what is shown below:

  ```yaml
  apiVersion: batch/v1beta1
  kind: CronJob
  metadata:
    name: sync-job
  spec:
    # Schedule to run at 1:30 AM UTC (6:30 PM PST) each day
    schedule: "30 1 ? * *"
    jobTemplate:
      spec:
        template:
          spec:
            containers:
            - name: ap-imrt-iis
              image: fwsbac/ap-imrt-iis:0.1.26
              imagePullPolicy: Always
              command: ["./sync-job.sh"]
            restartPolicy: Never
  ```
* Update the `schedule` value to match a time consistent with your institution's policies
  * The schedule is configured using [Cron format](https://en.wikipedia.org/wiki/Cron#Overview) 
  * Time is in UTC
  * To minimize potential performance impact, the recommendation is to schedule the cron to execute once daily after production hours
  * Additional details about cron jobs in Kubernetes environments can be found [here](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)
* Update the `image` to match the Item Ingest Service (IIS) image that has been deployed
  * To find the name of the IIS image: 

    ```
    # identify the name of the pod hosting IIS
    $ kubectl get po | grep iis
    ap-imrt-iis-deployment-6f876df74-49rfv      1/1       Running     0          2d
  
    # Describe the IIS pod name and get the image name
    $ kubectl describe po ap-imrt-iis-deployment-6f876df74-49rfv | grep -i image:
        Image:          fwsbac/ap-imrt-iis:0.1.26
    ```
* Deploy the cron job to the Kubernetes environment:

  ```
  kubectl apply -f sync-cron.yml
  ```

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
   * Updating applications is done via kubectl, which requires that kubectl is first configured to point to the cluster in question: <pre>kops export kubecfg --state s3://kops-imrt-dev-state-store --name dev.imrt.org</pre>

#### Updating Docker Image Version
   * When a new docker image version is available, it can be updated: <pre>kubectl set image deployment/ap-imrt-iis-deployment ap-imrt-iis=fwsbac/ap-imrt-iis:@version@

**NOTE:** When a new version of the IIS Docker image is deployed, update the `sync-cron.yml` file to use that new image.  See [here](#configure-and-create-item-synchronization-cron-job) for an example.

#### Updating YML file
   * When changes are made to a YML file, they can be applied to the cluster: <pre>kubectl apply -f xxx-service.yml</pre>

#### Updating SNAPSHOT image (no docker tag change) 
<pre>kubectl patch deployment ap-imrt-iis-deployment -p '{\"spec\":{\"template\":{\"metadata\":{\"labels\":{\"date\":\"%s\"}}}}}'
</pre>
replacing %s with the current date in epoch format.

## Common Tasks

### Creating SQL Logins for Business Intelligence Analysts
To create logins for users to run ad hoc queries against the RDS Postgres Aurora cluster, take the following steps:

#### Create a Role for Business Intelligence Analysts
* Connect to the **master** of the Aurora Postgres cluster
* Run the following SQL:
  * be sure to replace `[choose role name]` with a user name that complies with your institution's standards

```sql
CREATE ROLE [choose role name];
ALTER ROLE [choose role name] SET search_path TO imrt;

GRANT SELECT ON item TO [choose role name];
GRANT SELECT ON item_git TO [choose role name];
GRANT SELECT ON item_log TO [choose role name];
GRANT SELECT ON stim_link TO [choose role name];
```

Any user in the role created above will have the ability to:

* Read data from the tables in the `imrt` database that store item-related data
* Create temporary tables to store interim query results, etc

**NOTE:** Application-specific tables will not be available; these tables drive application functionality and will not provide data useful for reporting purposes.

#### Create a Login for the Business Analyst
* Connect to the **master** of the Aurora Postgres cluster
* Run the following SQL:
  * be sure to replace `[choose role name]` with a user name that complies with your institution's standards
  * be sure to replace `[choose password]` with a password that complies with your institution's standards
  * be sure to replace `[role name from previous step]` with the role created above

```sql
CREATE ROLE [choose role name] LOGIN PASSWORD '[choose password]';
GRANT [role name from previous step] TO [choose role name];
```
