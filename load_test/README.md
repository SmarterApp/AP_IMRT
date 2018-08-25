# IMRT ISS Load Test

## Overview
This directory contains the assets necessary to run the IMRT Item Search Service (ISS) load test.

## Pre Requisites
* [Apache JMeter](https://jmeter.apache.org/)
* PostgreSQL (installed via homebrew or an installer)
  * **NOTE:** a PostgreSQL installation is only necessary if the load test is being run on a developer's workstation. (e.g. for testing/debugging the load test plan)

## Environment Setup
To run the load test, an environment must be identified.  An existing IMRT environment can be leveraged or a new IMRT environment can be created.

If a new IMRT environment is being created, there is no need to deploy a complete IMRT cluster.  Only the following components are required:

* An RDS instance to host the `imrt` database
* A Spring Cloud Configuration Service to serve configuration information
* An ISS instance

Instructions for creating a new environment can be found [here](https://github.com/SmarterApp/AP_Deploy_Stage/blob/master/InstallationGuide.md).

## Populating the Database
The `load-items-into-db.sql` script is designed to load a large amount of item data into the `imrt` database.  This script expects an existing `imrt` database to have some content in it.  The existing content is effectively cloned and inserted into the `imrt` database.  Refer to the comments in the `load-items-into-db.sql` script for additional details.

## JMeter Test Plan

### Configuration
The following variables are configured in the `TEST_CONSTS` section of the `imrt-iss-load-test` plan:

* `concurrentUsers`:  The number of concurrent users (i.e. the number of threads) to run during the test plan execution
* `loopCount`:  The number of times the sampler should run (i.e. the loop count)
* `issDomain`:  The domain of the ISS instance to test.  If deployed to AWS, this value can be found in Route53.
* `issSearchPath`:  The path/route to the `/search` endpoint.  _This value should not have to change_.
* `issCountPath`:  The pat/route to the`/count` endpoint.  _This value should not have to change_.
* `ssoDomain`:  The domain of the OpenAM instance that can generate an SSO access token required to authenticate against the `/search` or `/count` endpoints.
* `ssoRequestPath`:  The path/route to the SSO realm for getting the SSO access token.
* `ssoPort`: The port on which OpenAM is listening.
* `ssoUserName`:  The user account for getting an SSO access token.
* `ssoUserPassword`:  The password for the `ssoUserName`.
* `ssoClientId`:  The Client ID registered within OpenAM.
* `ssoClientSecret`:  The client secretf for the `ssoClientId`

### Execution
After the variables in the `TEST_CONSTS` file have been configured, run the JMeter test plan (either in the UI or on the command line).  The results can be seen in the **View Results Tree** and/or the **View Results in Table** under the **ISS - Execute Search Results** node of the JMeter test plan.
