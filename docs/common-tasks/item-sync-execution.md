# Execution

[Go Back](../../README.md)

To execute the Item Synchronization Process, create a `POST` call to the `/sync` endpoint of the Item Ingest Service.  An example of such a call is shown below:

```
curl -i -X POST "http://ap-imrt-iis-service/sync"
```

The call shown above uses the name of the Item Ingest Service that Kubernetes recognizes.  That is, the IMRT Kubernetes environment has a service named `ap-imrt-iis-service`.  For additional details on Kubernetes services, refer to [this page](https://kubernetes.io/docs/concepts/services-networking/service/).  To execute the Item Synchronization Process from outside the IMRT Kubernetes environment, refer to the next section.

## Execution Outside of the Kubernetes Environment
The item synchronization process can be called from outside the Kubernetes environment, follow these steps:

* Get a bearer token from OpenAM:

    ```
    curl -i -X POST \
       -H "Content-Type:application/x-www-form-urlencoded" \
       -d "grant_type=password" \
       -d "username=[a user account registered within openam]" \
       -d "password=[password for user specified in 'username' field]" \
       -d "client_id=[client id registered in OpenAM]" \
       -d "client_secret=[client secret for client id]" \
     'https://[OpenAM domain]/auth/oauth2/access_token?realm=%2Fsbac'
    ```

* The response will appear similar to this:

    ```json
    {
      "scope": "cn givenName mail sbacTenancyChain sbacUUID sn",
      "expires_in": 35999,
      "token_type": "Bearer",
      "refresh_token": "[redacted]",
      "access_token": "[redacted]"
    }
    ```

* Pass the `access_token` acquired from the previous step in header of the `POST` to the Item Ingest Service:

    ```
    curl -i -X POST -H "Authorization: Bearer [access_token from previous step]" "http://[IMRT Item Ingest Service domain]/sync"
    ```

Example:

```
curl -i -X POST -H "Authorization: Bearer a-bearer-token-uuid" "http://imrt-example.com/sync"
```

## Automating Item Synchronization Process Execution
The Item Synchronization Process can be scheduled to run at regular intervals (e.g. nightly after regular production hours).  A cron job can be created in the IMRT Kubernetes environment.  Shown below is an example of a cron job that configures the Item Synchronization Process at 9:00 AM UTC:

```yaml
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: sync-job
spec:
  # Schedule to run at 9am UTC each day
  schedule: "0 9 * * *"
```

# Monitoring
The item synchronization process writes information about its progres to the application's log file.  To monitor the item synchronization process as it runs, take the following steps, tail the log file on the Item Ingest Service pod in the Kubernetes cluster:

* Identify the Item Ingest Service pod:

    ```
    $ kubectl get po | grep iis
    ap-imrt-iis-deployment-65c4cf5454-zrvs9     1/1       Running   0          3d

    ```

* Tail the log file of the Item Ingest Service pod identified in the previous step:

    ```
    $ kubectl logs -f ap-imrt-iis-deployment-65c4cf5454-zrvs9
    ```

At this point, the pod's log file is being followed and details of the item synchronization process will be displayed.  The log entries that signify the item synchronization process has started will appear similar to what is shown below:

```
2018-05-09 08:31:03.254  INFO 92056 --- [cTaskExecutor-1] o.s.b.c.l.s.SimpleJobLauncher            : Job: [SimpleJob: [name=itemSynchronizationJob]] launched with the following parameters: [{}]
2018-05-09 08:31:03.265  INFO 92056 --- [cTaskExecutor-1] .ItemSynchronizationJobExecutionListener : Item Synchronization Process starting.  Job execution id: 15
2018-05-09 08:31:03.293  INFO 92056 --- [cTaskExecutor-1] o.s.b.c.j.SimpleStepHandler              : Executing step: [itemSynchronizationStep]
2018-05-09 08:31:03.312  INFO 92056 --- [cTaskExecutor-1] o.a.i.i.s.ItemSynchronizationServiceImpl : getting item bank ids from source control
2018-05-09 08:32:54.828  INFO 92056 --- [cTaskExecutor-1] o.a.i.i.s.ItemSynchronizationServiceImpl : retrieved 1811 item bank ids from source control in 111 seconds

... processing of each item bank id occurs ...

2018-05-09 08:32:54.845  INFO 92056 --- [cTaskExecutor-1] .ItemSynchronizationJobExecutionListener : Item Synchronization Process complete.  Job execution id: 15, exit status code: COMPLETED, exit message: Total item bank ids: 1811, number of items requiring project webhook: 10
2018-05-09 08:32:57.440  INFO 92056 --- [cTaskExecutor-1] o.s.b.c.l.s.SimpleJobLauncher            : Job: [SimpleJob: [name=itemSynchronizationJob]] completed with the following parameters: [{}] and the following status: [COMPLETED]
```

The **Job execution id** recorded in the log file corresponds to the `job_execution_id` in the `batch_job_execution` table.

To get additional details written to the log file, update the configuration for Item Ingest Service to use the `DEBUG` level:

```yaml
logging:
  level:
    org.opentestsystem: DEBUG
```
