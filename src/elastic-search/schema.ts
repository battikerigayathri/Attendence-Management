export const typeDefs=`
type Query {
    hello(name: String): String
}
type Mutation{
    register(input: RegisterInput): RegisterResponse
}
input RegisterInput {
    userName: String!
    email: String!
    password: String!
    phone: Int
    role: RoleEnum!
}
enum RoleEnum {
    ADMIN
    COACH
    PLAYER
    SPONSOR
}
type RegisterResponse {
    user: User
    token: String
    message: String
}
  `