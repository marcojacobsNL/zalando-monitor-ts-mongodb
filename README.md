# Zalando Monitor - TypeScript - MongoDB - Discord

A fully working Zalando monitor writing in TypeScript and using MongoDB as our database.
Includes proxy handling, retry logic, saving products in a database & customized Discord webhook.

&nbsp;

## Getting Started

1. Git clone https://github.com/xeriuk/zalando-monitor-ts-mongodb.git
2. npm install

3. Rename `.env.sample` to `.env`
4. Provide your info within `.env`

5. Import the .json files to your MongoDB database. Make sure to name your collection the same as the filename.
6. If you want to use proxies, import the proxies.json to your MongoDB proxies collection. Make sure to fill in proxies in the json file.
7. Add the product PIDS to the producs column in the stores table.
8. Each region has their own App domain ID. I've included the 1 for NL, but you can find the other ones through easy HTTPS inspection on mobile.

&nbsp;

## NPM Commands

| Command        | Effect                                                                |
| -------------- | --------------------------------------------------------------------- |
| `dev:start`    | Launches the monitor in development mode, with hot reloading enabled. |
| `dev:webpack`  | Compiles a development build of the monitor                           |
| `prod:webpack` | Compiles a production build of the monitor                            |
