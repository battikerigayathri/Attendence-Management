import { baseApis } from "./baseApi";
import { Base, Connect } from "../connect";
import { GraphQLError } from "graphql";
export const setContext = async (req: any) => {
  const base = new Base();
  const requestedApi: string = getRequestedApi(req.body.query);
  if (!requestedApi || requestedApi === "introspectionquery") {
    return { ...req, user: { profile: "ADMIN" } };
  }
  try {    
    if (baseApis.includes(requestedApi)) {
      return { ...req, user: { profile: "ADMIN" }, base };
    } else {
      if (!req.headers.authorization) {
        throw new GraphQLError("Authorization is required");
      }
      const session: string = req.headers.authorization;      
      const connect = new Connect(session);      
      try {
        connect.validateSession(session);
        return { ...req, user: { ...connect.user, profile: connect.user?.role }, connect, base };
      } catch (error: any) {
        throw new GraphQLError("Invalid Session!!", {
          extensions: {
            i18Key: "InvalidSession",
            http: { status: 401 },
          },
        });
      }
    }
  } catch (error: any) {
    throw new GraphQLError(error);
  }
};

const getRequestedApi = (query: string) => {
  const req = query?.split("(")[0]?.trim().split(" ")[1].toLowerCase();
  return req;
};
