import "./env";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import { merge } from "lodash";

import { Query, UserTypeDef, TaskTypeDef } from "./typeDefs";
import { userResolvers, taskResolvers } from "./resolvers";
import { setUserContext } from "./utils";

async function startApolloServer() {
  const app = express();
  const server = new ApolloServer({
    typeDefs: [Query, UserTypeDef, TaskTypeDef],
    resolvers: merge(userResolvers, taskResolvers),
    context: async ({ req }) => {
      const user = await setUserContext(req);
      return { user };
    },
  });
  await server.start();

  server.applyMiddleware({ app });

  app.use((req, res) => {
    res.status(200);
    res.end();
  });

  // connect to database
  try {
    const DB = process.env.DATABASE.replace(
      "<PASSWORD>",
      process.env.DATABASE_PASSWORD
    );
    mongoose
      .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("MongoDB connected successfully");
        app.listen({ port: 4000 }, () =>
          console.log(
            `Server ready at http://localhost:4000${server.graphqlPath} ...`
          )
        );
      });
  } catch (err) {
    console.log(err);
  }

  return { server, app };
}
startApolloServer();

// {
//   "authorization":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZjI1YTE3YjgxZmFkOTQ0MzA4MjBmMzgiLCJpYXQiOjE2MjUxNjI3OTEsImV4cCI6MTYzMjkzODc5MX0.vpKgq_awHYI1k0uQvdVNZO-1Cqc07f3lm2XTXT1T7ao"
//   }
