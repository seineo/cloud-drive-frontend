export interface UserSignUpRequest {
  name: string
  email: string
  password: string
  rootHash: string
}

export interface UserLoginRequest {
  email: string
  password: string
}

export interface UserSignResponse {
  email : string
  name: string
  rootHash: string
}
