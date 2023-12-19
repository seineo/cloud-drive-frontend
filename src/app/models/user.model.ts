export interface UserSignUpRequest {
  email: string
  nickname: string
  password: string
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

export interface UserCodeRequest {
  email: string
}
