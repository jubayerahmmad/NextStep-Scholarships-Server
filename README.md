# NextStep Scholarships Server

This is the server-side component for the NextStep Scholarships application. It handles all backend operations, including database interactions, authentication, and API endpoints.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/jubayerahmmad/NextStep-Scholarships-Server.git
   ```
2. Navigate to the project directory:
   ```sh
   cd NextStep-Scholarships-Server
   ```
3. Install dependencies:

   ```sh
   npm install
   ```

4. Set up environment variables:
   ```sh
   DB_USER=your_db_user
   DB_PASS=your_db_password
   TOKEN_SECRET=your_token_secret
   PAYMENT_SECRET_KEY=your_stripe_payment_secret_key
   ```

## Usage

1. Start the server:
   ```sh
   npm start
   ```
2. The server will be running on `http://localhost:5000`.

## API Endpoints

- `GET /scholarships` - Retrieve a list of scholarships
- `GET /scholarships/:id` - Retrieve a specific scholarship by ID
- `GET /top-scholarships` - Retrieve top 6 scholarships filtered by lowest application fees.

> **Note:** Other API endpoints are protected and require authentication.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.
