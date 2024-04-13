# Auth Gateway Documentation

Auth Gateway is an authorization and authentication gateway designed to handle refresh tokens, user management, and access tokens. It utilizes a PostgreSQL database for data storage.

## Features

The Auth Gateway provides the following features:

- **Refresh Tokens**: The gateway handles the issuance and renewal of refresh tokens

 for long-term authentication.
- **User Management**: Users can be created, updated, and deleted, and their details can be retrieved.
- **Access Tokens**: Access tokens are issued to authenticated users for short-term authorization.
- **Email Verification**: The gateway supports email verification by generating verification codes.
- **Password Management**: Users can reset their password using verification codes or access tokens.
- **Email Change**: Users can request to change their email address, and verification codes are sent to the new email.
- **Error Handling**: Custom error handling is implemented with error codes and descriptions for better debugging and user experience.

## API Routes

The Auth Gateway provides the following API routes:

| Route                  | Method | Description                                                                    | Required Params             |
|------------------------|--------|--------------------------------------------------------------------------------|-----------------------------|
| `/users`               | GET    | Returns user details                                                           | `access_token`              |
| `/users`               | POST   | Returns email verification code                                                |  `username`, `email`, `first_name`, `last_name`, `password`, `scope`                           |
| `/users`               | DELETE | Deletes user account and associated refresh and access tokens                  | `access_token`              |
| `/users`               | PUT    | Updates user details                                                           | `access_token`, (`username`, `first_name`, `last_name`)              |
| `/users/verify-user`         | POST   | Marks the user as verified and returns authentication tokens                   | `code`                      |
| `/users/forgot-password`     | POST   | Creates a verification code to be sent to the email                            | `email`                     |
| `/users/change-password`     | POST   | Changes user password using the forgot password code or access_token                           | `code`, `id`, `old_password`, `password`, `access_token` |
| `/users/change-email-request`| POST   | Creates an email change code to be sent to the new email                       | `access_token`              |
| `/users/change-email`        | POST   | Changes the email address                                                      | `code`, `access_token`, `email` |
| `/tokens`              | POST   | Renews the refresh_token if needed or issues a new access token                 | `refresh_token`             |
| `/tokens`              | DELETE | Deletes the refresh token and all associated access tokens                     | `refresh_token`             |
| `/tokens/keys`         | GET    | Returns the access and refresh public keys used to verify JWT tokens            |                             |
| `/tokens/signin`       | POST   | Allows the user to sign in using their username or email and password           | `username`, `password`       |

Please note that some routes require additional headers or parameters as specified in the "Required Params" column of the table above.

## Environment Variables

Make sure to set the following environment variables before running the Auth Gateway:

| Variable Name           | Description                                                     |
|-------------------------|-----------------------------------------------------------------|
| `PORT`                  | The port number on which the server will listen.                 |
| `HOST`                  | The hostname or IP address where the server will be hosted.      |
| `REFRESH_PASSPHRASE`    | Passphrase used for signing and verifying refresh tokens.        |
| `ACCESS_PASSPHRASE`     | Passphrase used for signing and verifying access tokens.         |
| `REFRESH_TOKEN_EXPIRY`  | The expiration time (in seconds) for refresh tokens.             |
| `ACCESS_TOKEN_EXPIRY`   | The expiration time (in seconds) for access tokens.              |
| `SALT_ROUNDS`           | The number of rounds used for password hashing.                  |
| `DB_HOST`               | The hostname or IP address of the PostgreSQL database.           |
| `DB_USER`               | The username used to connect to the PostgreSQL database.         |
| `DB_PASSWORD`           | The password used to connect to the PostgreSQL database.         |
| `DB_NAME`               | The name of the PostgreSQL database.                             |
| `DB_PORT`               | The port number of the PostgreSQL database.                      |

### Error Codes

The Auth Gateway utilizes the following error codes for custom error handling:

- `internal_error`: An internal server error occurred.
- `not_found`: The requested resource was not found.
- `forbidden`: The user is not authorized to access the requested resource.
- `invalid_arguments`: The provided arguments are invalid or missing.
- `unauthenticated`: The user is not authenticated to perform the requested action.

Please refer to the `error_code` and `error_description` in the API responses to identify and handle errors appropriately.

Feel free to explore and utilize the Auth Gateway API to handle authorization and authentication in your applications.
