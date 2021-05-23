export {};
import dotenv from "dotenv";
import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import mongoose from "mongoose";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";

dotenv.config({ path: "./config.env" });

async function startApolloServer() {
  const app = express();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await server.start();

  server.applyMiddleware({ app });

  app.use((req, res) => {
    res.status(200);
    res.send("Hello!");
    res.end();
  });

  // connect to database
  try {
    // @ts-ignore
    const DB = process.env.DATABASE.replace(
      "<PASSWORD>",
      // @ts-ignore
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
