# POJOKRESEP - RESTful API

Ini adalah API yang dipakai pada program [POJOKRESEP](https://github.com/Argxz/PojokResep)

## Built With

### Frameworks & Libraries

![Node.js](https://img.shields.io/badge/Node.js-v18.16.0-green?logo=node.js) ![Express.js](https://img.shields.io/badge/Express.js-v4.21.1-lightgrey?logo=express) ![Sequelize](https://img.shields.io/badge/Sequelize-v6.37.5-blue?logo=sequelize)

### Database

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14.0-blue?logo=postgresql)

### Middleware

![body-parser](https://img.shields.io/badge/body--parser-v1.20.3-yellowgreen) ![cors](https://img.shields.io/badge/cors-v2.8.5-yellowgreen) ![dotenv](https://img.shields.io/badge/dotenv-v16.4.7-lightblue) ![jsonwebtoken](https://img.shields.io/badge/jsonwebtoken-v9.0.2-orange) ![morgan](https://img.shields.io/badge/morgan-v1.10.0-lightgrey) ![multer](https://img.shields.io/badge/multer-v1.4.5--lts.1-brightgreen)

### Additional Packages

![bcryptjs](https://img.shields.io/badge/bcryptjs-v2.4.3-green) ![fs](https://img.shields.io/badge/fs-native-red) ![joi](https://img.shields.io/badge/joi-v17.13.3-purple) ![path](https://img.shields.io/badge/path-native-red) ![pg](https://img.shields.io/badge/pg-v8.13.1-blue) ![pg-hstore](https://img.shields.io/badge/pg--hstore-v2.3.4-lightblue)

### Development Tools

![nodemon](https://img.shields.io/badge/nodemon-v3.1.7-brightgreen?logo=nodemon) ![sequelize-cli](https://img.shields.io/badge/sequelize--cli-v6.6.2-blue)

## Requirements

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Postman](https://www.postman.com/)
- Web Server (contoh: localhost)

## Installation Guide

### Getting Started

Follow the steps below to set up the project on your local environment.

### Clone the Repository

```bash
git clone https://github.com/argxz/pojokresep-be.git
cd pojokresep-be
```

### Install Dependencies

Install the required packages:

```bash
npm install
```

### Environment Variables

Configure environment variables by creating a `.env` file in the root directory with the following content:

```env
NODE_ENV=development
PORT=3001

DB_USERNAME=postgres
DB_PASSWORD=123
DB_DATABASE=pojokresepdb
DB_HOST=127.0.0.1
DB_DIALECT=postgres

JWT_SECRET=in1k0d3rahasiaB4ng3tser1u5
REFRESH_TOKEN_SECRET=7ode1nirahasiaB4ng3tser1u5
```

### Prerequisites

Ensure the following are installed:

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [DBeaver](https://dbeaver.io/) (Optional for database management)

### Setup the Database

1. Start PostgreSQL and create a new database named `pojokresepdb`.
2. Apply the Sequelize migrations:
   ```bash
   npx sequelize-cli db:migrate
   ```
3. Seed initial data (if available):
   ```bash
   npx sequelize-cli db:seed:all
   ```

### Run the Application

Start the development server:

```bash
npm run dev
```

Access the application at [http://localhost:3001](http://localhost:3001).

---

## HTTP Requests

All API requests are made using one of the following HTTP methods:

- **GET**: Retrieve a resource or list of resources
- **POST**: Create a resource
- **PUT**: Update a resource
- **DELETE**: Delete a resource

### HTTP Response Codes

| Code | Status  | Description                          |
| ---- | ------- | ------------------------------------ |
| 200  | Success | The request was successful           |
| 400  | Error   | There was a problem with the request |

---

## Database Schema

### Create Database

```sql
CREATE DATABASE pojokresepdb;
```

### Tables

#### `tb_users`

```sql
CREATE TABLE tb_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `tb_recipes`

```sql
CREATE TABLE tb_recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    user_id INT REFERENCES tb_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `tb_comments`

```sql
CREATE TABLE tb_comments (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES tb_recipes(id),
    user_id INT REFERENCES tb_users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `tb_ratings`

```sql
CREATE TABLE tb_ratings (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES tb_recipes(id),
    user_id INT REFERENCES tb_users(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

### Users

- **POST** `/api/v1/users/register`: Register a new user
- **POST** `/api/v1/users/login`: Login a user

### Recipes

- **GET** `/api/v1/recipes`: Fetch all recipes
- **POST** `/api/v1/recipes`: Add a new recipe (Authenticated)

### Comments

- **POST** `/api/v1/comments`: Add a comment to a recipe (Authenticated)

### Ratings

- **POST** `/api/v1/ratings`: Add a rating to a recipe (Authenticated)
