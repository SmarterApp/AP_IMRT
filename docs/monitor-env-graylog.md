# Monitor Graylog for Messages From a Specific IMRT Environment

[Go Back](../README.md)

When Graylog receives messages from a Kubernetes (k8s) environment, the name of the k8s logging daemonset is included as the "source" of the message.  As instructed in the [Deployment Checklist](./Deployment.AWS.md), the logging daemonset should have its `name` configured to reflect the environment that hosts it (e.g. "imrt-dev" or "ap-imrt-prod").  To view messages for a specific IMRT environment in Graylog, take the following steps:

* Log into the Graylog user interface with your username and password
* Navigate to the **Search** dashboard in Graylog
* In the **Search Terms** field (identified by placeholder text starting with `Type your search query here and press enter`), enter the following:
  * `source: [the partial name of the name of your k8s logging daemonset]`
  * e.g.: `source: imrt-dev*`
    * Note the asterisk at the end of the search term.  This will account for the unique name k8s assigns to the logging daemonset after the name.
* Click the green **Search** button
* _**OPTIONAL:**_  To force the Graylog user interface to automatically refresh, change the **Not Updating** dropdown list to a value that suits your refresh needs (e.g. `Every 5 seconds`, `Every 1 Minute`)
