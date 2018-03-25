
# Eko Delivery Service

The application is composed of:
- The core library (core/)
- A very basic React.js UI for testing (client/)

## How to use the core

```bash
brice@brice:~$ git clone https://github.com/bcolucci/ekods.git && cd ekods/core
brice@brice:~/ekods/core$ npm install
```

```bash
# if you want to check the unit tests:
brice@brice:~/ekods/core$ npm test

> ekods-core@0.0.1 test /home/brice/ekods/core
> nyc ava


  ✔ commons
  ✔ parsePath
  ✔ isValidPath
  ✔ addTownRoute
  ✔ mergeTowns
  ✔ parseGraph
  ✔ findPathRoutes
  ✔ mergePaths
  ✔ findRoutes
  ✔ cheapestRoute

  10 tests passed

----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |    98.26 |    90.32 |      100 |    97.73 |                   |
 index.js |    98.26 |    90.32 |      100 |    97.73 |             56,64 |
----------|----------|----------|----------|----------|-------------------|
```

## How to use the UI

```bash
brice@brice:~/ekods/core$ cd ../client && npm install
brice@brice:~/ekods/client$ npm start

> ekods-client@0.0.1 start /home/brice/ekods/client
> light-server -s dist/ -p 3000

light-server is listening at http://0.0.0.0:3000
  serving static dir: dist/
```

You can now go to http://127.0.0.1:3000 !

![screenshot](https://github.com/bcolucci/ekods/raw/master/screenshot.png)
