# Notes
- mongod : start the database daemon
- mongo : start the mongo shell
- mongoimport : executable to run out of the mongoshell!!

# Example
## Import pg_notepad from tsv format
 csv format will not work, as ',' character is used in sentences, so replace ',' with \t (tab)
 then :
  ````mongoimport -d Airlang -c pg_notepad --type tsv --file pg_notepad.backup.tsv --headerline````
if in the right directory, otherwise use full path for the file

# How to check content of mongodbs
## From shell
- mongo
- use 'dbname' -> goes to the database in question
- show dbs -> shows all dbs
- show collections -> shows collections from the database in use
- db.'collection_name'.find() -> shows content of particular collection
## From mongoexpress
- run node app in the right directory
````cd C:\Documents and Settings\bcouriol\coding\Webstorm\mongo-express)````
````node app````
- open webpage ``http://localhost:8081/``
