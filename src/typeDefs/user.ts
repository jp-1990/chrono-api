export const typeDef = `
type User {
  id: ID
  name: String!
  email: String
  photo: String
  role: String
  password: String
  active: Boolean
}

type ReducedUser {
  id: ID
  name: String
}

type AuthenticatedUser {
  user: User
  token: String
  tokenExpires: String
}

extend type Mutation {
  signIn(email: String!, password: String!): AuthenticatedUser
}
`;
