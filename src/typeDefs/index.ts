export { typeDef as TaskTypeDef } from "./task";
export { typeDef as UserTypeDef } from "./user";

export const Base = `
type Query {
  _empty:String
}
type Mutation {
  _empty:String
}
`;
