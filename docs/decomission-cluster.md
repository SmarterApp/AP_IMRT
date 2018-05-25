# Decommissioning an IMRT Environment

[Go Back](../README.md)

When an environment is no longer actively in use, it should be decommissioned.  There are several steps to decommissioning an IMRT environment, all of which are outlined below.

## Delete the Database Server
Prior to deleting the Kubernetes (k8s) cluster, delete the RDS instance(s) that it interacts with.  To delete the RDS instance(s), take the following steps:

### If the k8s Cluster Uses an Aurora Cluster
* Navigate to the **RDS Dashboard**
* Click on **Clusters** on the lefthand side
* Click on the desired cluster; the **Cluster Members** section of this screen will identify all RDS instances that participate in the cluster
* For each cluster member:
  * Click on the link for the cluster member
  * Under **Instance Actions**, choose **Delete**
  * Follow the prompts
  * _**OPTIONAL (but recommended):**_ Take a final snapshot of the RDS instance prior to deletion

When all the members of the Aurora Cluster have been deleted, the cluster itself will report as **deleting**.  The delete operation can take several minutes to complete.

### If the k8s Cluster Uses an RDS Instance
* Navigate to the **RDS Dashboard**
* Click on **Instances** on the lefthand side
* Select the RDS instance to delete
* Under **Instance Actions**, choose **Delete**
* Follow the prompts
* _**OPTIONAL (but recommended):**_ Take a final snapshot of the RDS instance prior to deletion

### Delete the Database VPC
After all RDS instances have been deleted, the database VPC can be removed.  To delete the database VPC, take the following steps:

* Navigate to the **VPC Dashboard**
* Select the VPC that was hosting the RDS instances
* Under **Actions**, choose **Delete**
* When prompted, click **Yes, Delete**

If there are any artifacts/objects that are still managed by the VPC, the delete may not complete properly.  Review the error message, identify any objects that still depend on the VPC and remove them.  After removal, attempt the delete again. 

## Delete the Kubernetes Cluster
After the RDS instance(s) have been deleted, the k8s cluster can be deleted.  To delete a k8s cluster, take the following steps:

### Delete the k8s Cluster
The `kops delete cluster` command will execute a "dry run" of the delete operation.  A list of resources that will be deleted from AWS will be displayed.  The `kops delete cluster` command will look like this:

`kops delete cluster --name=[the name of the cluster to delete] --state=s3://[the path to the state store for the cluster]`

**Example:**  This example shows a "dry run" of the `kops delete cluster` command to delete a k8s cluster named `imrt.example.sbtds.org`:

`kops delete cluster --name=imrt.example.sbtds.org --state=s3://imrt-example-sbtds-org-state-store`

Carefully review the output of the `kops delete cluster` command to become familiar with the items that the delete command will remove.  Once satisfied, run the `kops delete cluster` command again, this time with a `--yes` flag.

**Example:**  This example shows an execution of the `kops delete cluster` command to actually delete a k8s cluster named `imrt.example.sbtds.org`:

`kops delete cluster --name=imrt.example.sbtds.org --state=s3://imrt-example-sbtds-org-state-store --yes`

The `kops delete cluster` command will take several minutes to execute, and may report some resources that could not be deleted.  Let the command continue to run - as the `kops delete cluster` command continues to run, the list of resources should gradually decrease.

When the delete command completes, it will report the following in the terminal:

```
Deleted kubectl config for imrt.example.sbtds.org

Deleted cluster: "imrt.example.sbtds.org"
```

#### When `kops` Cannot Delete Some Resources
In some cases, `kops` will not be able to remove some resources.  After several minutes, the `kops delete cluster` will quit and report the resources it could not delete.  An example is shown below:

```
Not all resources deleted; waiting before reattempting deletion
	dhcp-options:dopt-8eeb7ee6
	vpc:vpc-df8138b7
	security-group:sg-82941fe9

not making progress deleting resources; giving up
```

When this happens, the resources must be deleted manually.  Log into AWS and delete the resources from the appropriate location.  In the example above, all the resources can be found in the **VPC Dashboard**.  Use the filter to identify the item and attempt to delete it.

After all resources have been removed, run the delete command again.  The output should appear similar to what is shown below:

```
No cloud resources to delete
Deleted kubectl config for imrt.example.sbtds.org

Deleted cluster: "imrt.example.sbtds.org"
```

At this point, the k8s cluster has been deleted and all its AWS resources have been removed.

### Delete the k8s State Store in S3
If the S3 bucket used as this cluster's state store does not store state for any other `kops` clusters, the S3 bucket can be safely removed.

>_**IMPORTANT:** Be sure the state store S3 bucket does not support any other k8s clusters!_

To delete the state store bucket from S3, take the following steps:
* Navigate to the **S3 Dashboard**
* Identify and click on row representing the S3 state store bucket
* Click on the bucket's link to verify it is empty

If the S3 state store bucket is not empty, take steps to clear out the state store bucket (e.g. run the `kops delete cluster` command again, move content to another S3 bucket, back up the data etc.)

>_**IMPORTANT:** If the S3 bucket contains state for other k8s clusters, do not continue!_ 

* Navigate back to the S3 dashboard
* Click on the row of the state store bucket
* Click the **Delete Bucket** button
* When prompted, type in the name of the S3 bucket being deleted
  * This is different than deleting some other AWS resources (e.g. an RDS instance), which prompts the user to type "delete me"

### Remove System Hook from GitLab
With the k8s cluster deleted, the system hook for the decomissioned environment can be removed.  To remove the system hook from GitLab, take the following steps:

* Log into [GitLab](https://gitlab.com)
* Navigate to the **Admin Area** (the wrench icon in the upper-righthand corner of the screen)
* Click on the **System Hooks** menu item
* Identify the system hook for the decommissioned environment in the list and click **Remove**

### Delete Deployment Files From Source Control
If the environment being decommissioned will never be used again, the deployment files for this environment can be deleted from source control.  Deletion of these files will depend on how they are managed in source control; some possibilities are:

* Delete the repository containing the deployment files for the specified environment
* Delete the directory in the general "Deployment Files" repository for the specified environment
* Delete the branch in the general "Deployment Files" repository for the specified environment

### Remove Enivronment Configuration Files From Source Control
If the environment being decommissioned will never be used again, the configuration files for this environment can be deleted from source control.  Deletion of these files will depend on how they are managed in source control; some possibilities are:

* Delete the repository containing the configuration files for the specified environment
* Delete the directory in the general "Configuration Files" repository for the specified environment
* Delete the branch in the general "Configuration Files" repository for the specified environment
