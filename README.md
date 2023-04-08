# MOVIE RENTALS API

This application serves as the backend of the movie rentals web application.

## Setup

### Install MongoDB

- Install latest version of MongoDB database then ensure it's  running by running the following command in the terminal.

```bash
mongod
```

### Install project dependencies

- Clone the repository [movie-rentals](https://www.github.com/Thala254/movie-rentals) then cd to the server directory. 
- Install the project's dependencies using npm or yarn.

```bash
git clone && cd server
npm i || yarn add
```

### Populate the Database

- Run 

```bash
npm run seed
```

### Start server

- To start the server, run

```bash
npm start
```

or 

```bash
yarn start
```

### Running Tests

- To carry out tests, run 

```bash
npm test
``` 

or 

```bash
yarn run test
```

### Checking out the API

- Using browser or curl, head over to `http://your_domain_or_localhost/api/movies` to see a list of movies.

### Environment variables

- Instead of running the long commands above when starting the server or running tests, you can store the key value pairs as environment variables and prevent adding them to source control to ensure safety as they contain sensitive information about the app.
- Keys to be added to environment variables include: 
    - `LOG_LEVEL` 
    - `rentals_jwtPrivateKey`
    - `rentals_db`
    - `NODE_ENV`

```bash
export key=value
```

