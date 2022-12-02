import express from "express";
import http from "http";
import cors from 'cors';
import bodyParser from 'body-parser';
import { makeExecutableSchema } from "graphql-tools";
import { applyMiddleware } from "graphql-middleware";

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';


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
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();
  app.use('/graphql',cors<cors.CorsRequest>(),
  bodyParser.json(), expressMiddleware(server));
  await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000/`);
})();
