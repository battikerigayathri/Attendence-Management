import express from "express";
// @ts-ignore
import { ApolloServer } from "apollo-server-express";
import axios from "axios";
import http from "http";
import { makeExecutableSchema } from "graphql-tools";
import { applyMiddleware } from "graphql-middleware";

import { typeDefs, resolvers, schemaDirectives } from "./elastic-search";

const app = express();

app.get("/hello", (req, res) => {
  const t = req;
  res.status(200).send("Hello World!!!");
});

const schema = applyMiddleware(
  makeExecutableSchema({
    typeDefs,
    resolvers,
    schemaDirectives,
  })
);

(async function startApolloServer() {
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    schema,
  });
  await server.start();
  server.applyMiddleware({ app });
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
})();
