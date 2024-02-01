
## Premise
The goal is to monitor the Ethereum blockchain and log some stuff about it in a database.

## Startup
- Put your Infura API key in `~/api-key.txt`
- `npm install`
- `npm start`
- You can go to `localhost:3000/api-docs/` to explore what the API supports



## Features
- HTTP Server To Manage Watch Rules. `http://localhost:3000`
  - Default port is `3000`, if that doesn't work for you, you can change it in `~/config.json`
  - OpenAPI Spec, detailing the API `openapi.yaml`
  - Request and Response Validation against said spec
  - Swagger UI to explore the API in a user-friendly way
    - `http://localhost:3000/api-docs/`
    - Can also be used as an HTTP client for convenience
- Monitoring system that hooks into the ethereum blockchain via the Infura API and listens for new transactions
- SQLite database where we log the transactions
- Rule System that determines which transactions to log
  - Watch rules are persisted across restarts. They are loaded from the DB on startup.
  - Watch rules can be added/deleted or toggled active/inactive, and changes are effective immediately
  - Transactions are linked to the rule that they matched to
    - If a rule is deleted, all its transactions go along with it

## Rule system
The watch rule system is a very simple version of the mongo query syntax.

Supported joins
- `$and`
- `$or`

Supported comparisons
- `$gt` Greater than
- `$lt` Less than
- `$eq` Equals

Only `string` and `number` comparisons are supported currently

The top level MUST be a join operation.

### Example
```text
A & B
[{ "$and": [{ "value": { "$gt": 3} }, { "gasPrice": { "$lt": 4 } }]


A | B
[{ "$or": [{ "value": { "$gt": 3} }, { "gasPrice": { "$lt": 4 } }]


(A & B) | (C & D)
[{
  "$or": [
      { "$and": [{ "value": { "$gt": 3 } }, { "gasPrice": {"$lt": 4 } }] },
      { "$and": [{ "value": { "$gt": 3 } }, { "gasPrice": {"$lt": 4 } }] }
  ]
}]

(A | B) & (C | D)
[{
  "$and": [
      { "$or": [{ "value": { "$gt": 3 } }, { "gasPrice": { "$lt": 4 } }] },
      { "$or": [{ "value": { "$gt": 3 } }, { "gasPrice": { "$lt": 4 } }] }
  ]
}]
```
