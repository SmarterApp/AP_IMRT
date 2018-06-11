# Using the Kubernetes Bastion
When a Kubernetes (k8s) cluster is created with a private network topology (as described in the [deployment checklist](./Deployment.AWS.md)), the only publicly accessible AWS server is the bastion.  The other AWS nodes in the k8s cluster will not be visible to the public.  Occasionally, an administrator will have to inspect one of the nodes in the k8s cluster (e.g. view log files, etc).  To get access to the k8s nodes in a cluster with a private topology, take the following steps:

* Follow the steps in the `kops` [**Using the Bastion**](https://github.com/kubernetes/kops/blob/master/docs/bastion.md#using-the-bastion) instructions.  
  * If the [deployment checklist](./Deployment.AWS.md) was followed, the bastion server will already be created
* `ssh` into the bastion: `ssh -A admin@[the name of the bastion server]`
  * **Example:** `ssh -A admin@bastion.imrt.example.sbtds.org`
* If this is the first time connecting to the bastion server, there may be a prompt to add the bastion to the list of known hosts.  Type **yes** at the prompt.  An example appears below:

```
The authenticity of host 'bastion.imrt.example.sbtds.org (12.34.56.78)' can't be established.
ECDSA key fingerprint is SHA256:[redacted].
Are you sure you want to continue connecting (yes/no)?
```

* From here, any of the AWS nodes in the k8s cluster can be reached by their _**private**_ ip address
  * An AWS node's private IP address can be found in the AWS EC2 dashboard
  * **Example:**
  
      ```
      admin@imrt-example-bastion:~$ ssh 172.123.456.789

	  The programs included with the Debian GNU/Linux system are free software;
	  the exact distribution terms for each program are described in the
	  individual files in /usr/share/doc/*/copyright.

	  Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
	  permitted by applicable law.
	  Last login: Mon Jun 11 22:22:13 2018 from 172.987.654.321
	  admin@ip-172-123-456-789:~$
      ```