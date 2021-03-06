# This project is no longer maintained and documentation has been moved to the components.

* [Item Ingest Service](https://github.com/SmarterApp/AP_IMRT_ItemIngestService)
* [Item Search Service](https://github.com/SmarterApp/AP_IMRT_ItemSearchService)


# IMRT

The Item Metadata Reporting Tool (IMRT) is a repository of item data.

**Intended Audience**: this document serves as a convenient entry point to all things IMRT. Anybody interested in developing, deploying or maintaining the IMRT project should start here. That includes developers, operations, system administrators, tier 3 support, etc.

Before updating resources in this project, please reference [Contributing](CONTRIBUTING.md).

## Document Links
IMRT is a suite of applications. These documents provide additional information for understanding, deploying and maintaining them.

1. [Main README (this file)](README.md)
2. [Architecture](docs/Architecture.md)
3. [Deployment Checklist](docs/Deployment.AWS.md) (_**Deprecated - refer to [IAT Installation Guide](https://github.com/SmarterApp/AP_Deploy_Stage/blob/master/InstallationGuide.md)**_)
4. [Kubernetes Deployment Files](docs/kubernetes_deployment_files.md)
5. [IMRT Application Configuration files](docs/config_files.md)
6. [Release Notes](docs/release_notes.md)
7. [Logging](docs/logging.md)

### Common Tasks
* [Delete an Item](docs/delete-item.md)
* [Create BI logins to database](docs/create_bi_logins.md)
* [Monitor Specific IMRT Environments in Graylog](docs/monitor-env-graylog.md)
* [Configure Bastion Server in Kubernetes Cluster](docs/configure-bastion.md)
* [Decommission a Kubernetes Cluster](docs/decomission-cluster.md)
* [Using the Kubernetes Bastion](docs/k8s-bastion-usage.md)
* [Running and Monitoring the Item Synchronization Process](docs/exec-item-sync.md)
* [Running and Monitoring the Item Data Migration Process](docs/exec-item-migration.md)
* [Abandon a Running Job](docs/abandon-running-job.md)
* [Working with the Gap Report](docs/gap-report.md)


## License
IMRT is owned by Smarter Balanced and covered by the Educational Community License:

```text
Copyright 2018 Smarter Balanced Licensed under the
Educational Community License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License. You may
obtain a copy of the License at http://www.osedu.org/licenses/ECL-2.0.

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an "AS IS"
BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied. See the License for the specific language governing
permissions and limitations under the License.
```
