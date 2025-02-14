import { CredentialsSignin } from "next-auth"

export class InvalidCredentialsError extends CredentialsSignin {
  code = "Invalid email or password"
}

export class MissingCredentialsError extends CredentialsSignin {
  code = "Please provide both email and password"
}

export class DatabaseError extends CredentialsSignin {
  code = "Database error occurred"
}

export class UserNotFoundError extends CredentialsSignin {
  code = "User not found"
}
