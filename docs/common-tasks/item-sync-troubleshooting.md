## Troubleshooting

### Diagnosing Issues
If the Item Synchronization Process encounters an exception, the job execution's status will be set to **FAILED** in the `batch_job_execution` table.  Furthermore, the exception message and stack trace will be recorded in the `exit_message` column of the `batch_job_execution` table.  To view the exception message and stack trace, execute the following SQL:

```sql
SELECT
    job_execution_id,
    exit_code,
    exit_message
FROM
    batch_job_execution
WHERE
    job_execution_id = [the id of the job execution that failed];
```

**NOTE:** when using pgAdmin, the stack trace may not be visible in the results field (possibly due to not handling carriage returns/line feeds properly).  If using [pgAdmin](https://www.pgadmin.org/download/), try using `psql` to execute the SQL cited above.

### Resetting the Job
The Item Synchronization Process job may occasionally fail before completing.  For example, the Kubernetes pod hosting the process is restarted before the Item Synchronization Process job finishes.  If this happens, the Spring Batch metadata tables will indicate the job is still in progress.  The SQL below can be used to identify and update the job step and job execution that are not completed:

***NOTE:***  Perform a backup of the `imrt` database prior to executing _any_ of the `UPDATE` or `DELETE` statements below.

```sql
-- ----------------------------------------------------------------------
-- Identify records in the batch_step_execution table that do not have a
-- status and exit_code == COMPLETED
-- ----------------------------------------------------------------------
SELECT
    step_execution_id,
    job_execution_id,
    status,
    exit_code,
    start_time,
    end_time,
    last_updated
FROM
    batch_step_execution
WHERE
    status <> 'COMPLETED'
    OR exit_code <> 'COMPLETED';

-- ----------------------------------------------------------------------
-- Update the batch_step_execution table, indicating the job has finished
-- executing.
-- ----------------------------------------------------------------------
UPDATE
    batch_step_execution
SET
    status = 'COMPLETED',
    exit_code = 'COMPLETED'
WHERE
    step_execution_id = -- [the step_execution_id of the record that is incomplete]

-- ----------------------------------------------------------------------
-- Update the batch_job_execution table, indicating the job has finished
-- executing.
-- ----------------------------------------------------------------------
UPDATE
    batch_job_execution
SET
    status = 'COMPLETED',
    exit_code = 'COMPLETED'
WHERE
    job_execution_id = -- [the job_execution_id of the record that is incomplete]
```

If the SQL cited above does not resolve this issue, delete records from the Spring Batch metadata tables:

```sql
DELETE FROM batch_step_execution_context;
DELETE FROM batch_step_execution;
DELETE FROM batch_job_execution_context;
DELETE FROM batch_job_execution_params;
DELETE FROM batch_job_execution;
DELETE FROM batch_job_instance;
```
