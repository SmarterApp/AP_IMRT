
# Creating SQL Logins for Business Intelligence Analysts
To create logins for users to run ad hoc queries against the RDS Postgres Aurora cluster, take the following steps:

#### Create a Role for Business Intelligence Analysts
* Connect to the **master** of the Aurora Postgres cluster
* Run the following SQL:
  * be sure to replace `[choose role name]` with a user name that complies with your institution's standards

```sql
CREATE ROLE [choose role name];
ALTER ROLE [choose role name] SET search_path TO imrt;

GRANT SELECT ON item TO [choose role name];
GRANT SELECT ON item_git TO [choose role name];
GRANT SELECT ON item_log TO [choose role name];
GRANT SELECT ON stim_link TO [choose role name];
```

Any user in the role created above will have the ability to:

* Read data from the tables in the `imrt` database that store item-related data
* Create temporary tables to store interim query results, etc

**NOTE:** Application-specific tables will not be available; these tables drive application functionality and will not provide data useful for reporting purposes.

#### Create a Login for the Business Analyst
* Connect to the **master** of the Aurora Postgres cluster
* Run the following SQL:
  * be sure to replace `[choose role name]` with a user name that complies with your institution's standards
  * be sure to replace `[choose password]` with a password that complies with your institution's standards
  * be sure to replace `[role name from previous step]` with the role created above

```sql
CREATE ROLE [choose role name] LOGIN PASSWORD '[choose password]';
GRANT [role name from previous step] TO [choose role name];
```
