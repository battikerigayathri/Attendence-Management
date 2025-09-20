import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { makeExecutableSchema } from "graphql-tools";
import { applyMiddleware } from "graphql-middleware";
import { expressMiddleware } from "@apollo/server/express4";
import mercury from "@mercury-js/core";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
// import * as historyTracking from "@mercury-js/plugins/historyTracking";
import * as dotenv from "dotenv";
import "./models";
import "./profiles";
import "./hooks"
import { typeDefs, resolvers } from "./elastic-search";
import { setContext } from "./helpers/setContext";
dotenv.config();
// mercury.plugins([
  // new RedisCache({
  //   client: { url: process.env.REDIS_URL, socket: { tls: false } },
  // }),
//   new historyTracking.HistoryTracking({skipModels: ['Action']}),
// ]);
export const app = express();
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

mercury.addGraphqlSchema(typeDefs, resolvers);
const schema = applyMiddleware(
  makeExecutableSchema({
    typeDefs: mercury.typeDefs,
    resolvers: mercury.resolvers,
  })
);
const DB_URL = process.env.DB_URL!;
mercury.connect(DB_URL);
(async function startApolloServer() {
  try {
    const httpServer = http.createServer(app);
    const server = new ApolloServer({
      introspection: true,
      schema,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
      rootValue: () => ({
        mercuryResolvers: mercury.resolvers,
      }),
    });
    await server.start();
    app.use(
      "/graphql",
      cors<cors.CorsRequest>(corsOptions),
      expressMiddleware(server, {
        context: async ({ req }) => await setContext(req)
      })
    );
    const PORT = process.env.PORT || 5000;
    await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
})();
