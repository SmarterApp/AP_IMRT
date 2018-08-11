# Abandon a Running Job

[Go Back](../README.md)

## Overview

There may be situations when the [Item Synchronization Process](./item-sync.md) or [Item Migration Process](./item-migration.md) need to be stopped.  The Item Ingest Service exposes an HTTP endpoint - `/abandon` - that allows a caller to shut down a running job.  This endpoint will attempt to gracefully stop a job that is in a currently running state.

### "A Job is Already Running" Response
If a call is made to start a job that is already running, the HTTP response status will be `409 - Conflict`, indicating the request failed.  An example of the HTTP response payload is shown below:

  `A job execution for this job is already running: JobInstance: id=3, version=0, Job=[itemSynchronizationJob].  To abandon the running execution of this job, make a PUT call to /abandon, passing in the job instance id`

## Calling the `abandon` Endpoint

### Abandoning a Running Job Execution
To abandon a running job, take the following steps:

* Make a `PUT` call to the `/abandon` endpoint on the Item Ingest Service, passing in the Job Instance ID from the "already running" response:

  `curl -iX PUT http://[Item Ingest Service domain]/abandon/[job instance id]`

* **Example:** `curl -iX PUT http://item-ingest-service.example.com/abandon/3`

If the call to `/abandon` was successful, the response will have an HTTP status code of `200 - OK`.  The response payload will appear as follows:

```javascript
{
  "jobExecutionId":14,
  "jobInstanceId":3,
  "name":"itemSynchronizationJob",
  "status":"ABANDONED",
  "message":"Job Execution 14 for Job itemSynchronizationJob abandoned successfully"
}

```

### Call `/abandon` When There are No Job Executions Running
Calling `/abandon` when there are no jobs executing is safe.  The response will have an HTTP status code of `200 - OK`.  The response payload will appear as follows:

```javascript
{
  "jobExecutionId":0,
  "jobInstanceId":3,
  "name":"itemSynchronizationJob",
  "status":"NO JOB EXECUTIONS",
  "message":"No job executions are currently running for the itemSynchronizationJob (job instance id 3)"
}

```

