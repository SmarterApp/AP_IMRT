# Release Notes

[Go Back](../README.md)

## Prior to Upgrade

The steps below list out the recommended steps to take prior to upgrading a system.  Each release notes will list how to upgrade from a previous version of the system. 

### Backup the database
Do a full backup of the database.  Releases may run schema migrations which will alter the tables and data in the system.  To ensure one can roll back to a previous release it is important to have a backup of the database prior to the migrations.

### Backup Configuration Files
If you are using source control to manage deployment and configuration files then you can ignore this section as one can leverage source control to go to a previous version.

If you're not using source control one will want to make sure to backup the previous deployment/configuration files to a location so the system can be reconstructed using previous deployments.

## How to handle if one can't rollback?
**Note** - One should always back up the database prior to upgrade so one can always go back to a version.. 

Depending on the changes it may not be possible to rollback a deployment.  In that case you may need to rebuild the system.  Please refer to the [Deployment Checklist](Deployment.AWS.md) on how to deploy a new system.

If data is lost or the backup wasn't done all is not lost.  The IMRT ingest service can ingest all the items from scratch by leveraging the sync process.  This can be manually called and will ingest all the items in the configured itembank.

## Release Notes

### 0.1.0
Since this is the initial release for IMRT there are no upgrade notes. Deployers should use the [Deployment Checklist](Deployment.AWS.md) to deploy the system.

**Application Versions**

| Release Location | Version | Notes |
| ----- | ----- | ---- |
| [0.1.0 Github Release](https://github.com/SmarterApp/AP_IMRT_Schema/releases/tag/0.1.0) | 0.1.0 | The attached `AP_IMRT_Schema.jar` should be used to configure the schema |
| [IIS Docker](https://hub.docker.com/r/smarterbalanced/ap-imrt-iis/tags/)| 0.1.28 | This docker version should be used in deployment files for ingest service and sync cron| 
| [ISS Docker](https://hub.docker.com/r/smarterbalanced/ap-imrt-iss/tags/)| 0.1.21 | This docker version should be used in deployment files for search service| 