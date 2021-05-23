export {};
import { gql } from "apollo-server-express";

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.

// ========================== EXAMPLE =========================
// export const typeDefs = gql`
//   # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

//   # This "Book" type defines the queryable fields for every book in our data source.
//   type Book {
//     title: String
//     author: String
//   }

//   # The "Query" type is special: it lists all of the available queries that
//   # clients can execute, along with the return type for each. In this
//   # case, the "books" query returns an array of zero or more Books (defined above).
//   type Query {
//     books: [Book]
//   }
// `;
// ===========================================================

export const typeDefs = gql`
  type User {
    id: ID
    name: String!
    email: String!
    photo: String
    role: String!
    password: String
    active: Boolean
  }

  type PercentageTimes {
    startPercentage: Float
    endPercentage: Float
  }

  type Task {
    id: ID
    title: String
    group: String
    description: String
    colour: String
    start: String
    end: String
    createdAt: String
    user: User
    percentageTimes: PercentageTimes
    luminance: Float
  }

  type Query {
    tasks: [Task]
  }
`;
