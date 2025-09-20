export const typeDefs=`
type Query {
    hello(name: String): String
}
type Mutation{
    register(input: RegisterInput): RegisterResponse
    login(value: String!, password: String!):LoginResponse
}
input RegisterInput {
    userName: String!
    email: String!
    password: String!
    phone: String
    role: RoleEnum!
}
enum RoleEnum {
    ADMIN
    COACH
    PLAYER
    SPONSOR
    SUPER_ADMIN
}
type RegisterResponse {
    user: User
    token: String
    message: String
}
type LoginResponse {
    message:String
    user:User
}
  `