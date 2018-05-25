# Configure the Kubernetes Bastion Server

[Go Back](../README.md)

When creating a Kubernetes (k8s) cluster with a private network topology (as described in the [Deployment Checklist](./Deployment.AWS.md)), a bastion server is created.  This bastion server provides access to the private nodes that reside within the k8s cluster.

## Bastion Server Software Installation
When created, the bastion server is a small machine with little more than an OS installed.  To work with the nodes in the k8s cluster, additional software packages must be installed.  To install the necessary software packages on the bastion server, follow these steps:

* `ssh` onto the bastion server using the appropriate ssh key
* Update `apt`: 
  * `sudo apt-get update`
* Install common software (this installs `add-apt-repository`): 
  * `sudo apt-get install -y software-properties-common`
* Install Java 8:

  ```bash
  sudo add-apt-repository "deb http://ppa.launchpad.net/webupd8team/java/ubuntu xenial main"
  sudo apt-get update
  sudo apt-get install oracle-java8-installer
  ```
  
  * Verify Java version:
 
      ```
      $ java -version
      java version "1.8.0_171"
      Java(TM) SE Runtime Environment (build 1.8.0_171-b11)
      Java HotSpot(TM) 64-Bit Server VM (build 25.171-b11, mixed mode)
      ```
  
* Install Postgres 9.6 client:
  * `sudo add-apt-repository "deb https://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main"`
  * `sudo apt-get update`
  * `sudo apt-get install -y postgresql-client-9.6 --force-yes`

## Bastion Server Security Configuration
If the IMRT database server is in a separate VPC (as is suggested in the [Deployment Checklist](./Deployment.AWS.md)), a new Inbound Rule must be created to allow the bastion server to communicate with the IMRT database server.