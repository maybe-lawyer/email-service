# Email Service

An API service acting as an email service abstraction, running in a Node / Express server.

## Quick Start

Prerequisite: Node v16

```
> npm install
> SPENDGRID_API_KEY=<key> npm run dev
```

## Commands

- `npm run dev`: starts a development server
- `npm run start`: starts a production server
- `npm test`: runs tests

Server will run by default on port 8080.

## Env Variables

- `EMAIL_API_PORT`: defaults to 8080
- `SNAILGUN_API_KEY`
- `SPENDGRID_API_KEY`
- `EMAIL_SERVICE_NAME`: either `'snailgun'` or `'spendgrird'`. Determines which email service to use under the hood. Defaults to `spendgrid`


## API Endpoints

- POST `/email` - send an email to the current email service
- GET `/email/:id/status` - retrieve the status of a snailgun email by ID

## Technical Decisions

- I used a Node / Express set up here since that is what I am most famliar with, and I feel like it suits the problem just fine.
- I used a few external libraries to handle things that seemed relatively boilerplate, such as email validation and html to text conversion, rather than spending time building these things myself. Both libraries I used seem well suported
- I used `got` as my HTTP library since it is easy to use, well supported, and it's what I've been using recently. I could have used built in Node HTTP functionality but that seemed unnecesssary, given the time constraints.
- For testing, I used Mocha/Chai as well as Sinon and proxyquire, as these are libraries I am very familiar with, though I imagine Jest would have served as well as Mocha/Chai in this case

## Future Improvements

A few things I would have liked to do given more time:

- add logging middleware
- optionally only return a response from a snailgun request once the email has been successfully sent. As it stands, in order to keep track of the status of snailgun emails, a long poll would need to be set up, or perhaps a socket implementation.
- refactor the email handlers to remove repeated code
- fix up the commit history to remove the node_modules from early commits (forgot to add gitignore at the beginning of the process)
- keep track of error counts, either locally or through a third party, in order to drive a decision on when to fall back to a second email service
- build in a mechanism to switch email services without a deploy - likely a database level config flag that could be toggled by hitting an API endpoint, or switched automatically depending on error rates
