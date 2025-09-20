import mercury from "@mercury-js/core";
import { ApolloCtx,ctxUser} from "../connect";
import { GraphQLError } from "graphql/error/GraphQLError";
import _ from "lodash";
// import {verifyGoogleToken} from "../helperFunctions/GoogleOAuth"
export const resolvers =  {
  Query: {
    hello: (root: any, { name }: { name: string }, ctx: any) =>
      `Hello ${name || "World"}`,
  },
  Mutation:{
    register:async (root: any,{ input }: { input: any },ctx: any) => {
            try {
              const email = input.email;
              const existingUser:any= await mercury.db.User.get({ email:email },{id:"1",profile:"ADMIN"});
     
              if (existingUser) {
                throw new GraphQLError("User with this email already exists.", {
                  extensions: {
                    code: "USER_ALREADY_EXISTS",
                  },
                });
              }

              const newUser:any= await mercury.db.User.create({
                userName: input.userName,
                email: input.email,
                password: input.password,
                phone: input.phone,
                role: input.role, 
                isActive: true,
              },{id:"1",profile:"ADMIN"});

              const token = ctx.base.Auth.createSession({
                id: newUser.id,
                name:newUser.userName,
                role: newUser.role,
                profile: newUser.role,
              });

              const updatedUser:any = await mercury.db.User.update(
                newUser._id,
                { token },
                {id:"1",profile:"ADMIN"} 
              );

              return {
                user: updatedUser,
                token,
                message:"User registered successfully",
              };

            } catch (error) {
                throw error;
            }
    },
    login: async (root: any, { value, password }: { value: string; password: string }, ctx: any) => {
            const user: any = await mercury.db.User.mongoModel.findOne({
                $or: [
                    { email: value },
                    { userName: value }
                ]
            });
            
            if (_.isEmpty(user)) {
                throw new GraphQLError("User not found", {
                    extensions: {
                        code: "UNAUTHENTICATED",
                    },
                });
            }
            
            const isValidPassword = await user.verifyPassword(password);
            
            if (!isValidPassword) {
                throw new GraphQLError("Invalid password", {
                    extensions: {
                        code: "UNAUTHENTICATED",
                    },
                });
            }
            
            return { message: "Login Successful..!!",user:user}
    } 
  }
}
