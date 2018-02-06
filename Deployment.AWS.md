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
    * Region: us-west-2
    * TODO Hosted Zone and VPC
    * Hosted Zone: imrt.sbac.org
    * VPC: opus, vpc-3b779dd0, 10.1.0.0/16
        * subnet-3523237c, 10.1.32.0/19, us-west-2a, private
        * subnet-1aec42d9, 10.1.64.0/19, us-west-2b, private
        * subnet-82dac27d, 10.1.96.0/19, us-west-2c, private
* SSH RSA Key
    * imrt-admin
        
### Deployment Instructions
* Install AWS CLI - https://docs.aws.amazon.com/cli/latest/userguide/installing.html
* Install KOPS CLI - https://github.com/kubernetes/kops/blob/master/docs/install.md
* Create kops user in AWS if it doesn't already exist - TODO or find link
* Create an ssh key for the ops user to login to the cluster instances:
    * ssh-keygen -t rsa -C "IMRT OPS" -f imrt-admin
* Create versioned S3 bucket for storing configuration using console or CLI.
    * aws s3 mb s3://kops-imrt-dev-state-store --region us-west-2
    * aws s3api put-bucket-versioning --bucket kops-imrt-dev-state-store --versioning-configuration Status=Enabled
* Create cluster - TODO
* Install and configure services - TODO

### Updating Applications
TODO
