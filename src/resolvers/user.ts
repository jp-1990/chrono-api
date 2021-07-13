import { ApolloError } from "apollo-server-errors";

import User, { UserBaseDocument } from "../models/userModel";
import { createSignJWT } from "../utils";

export const resolvers = {
  Query: {
    async signIn(
      _,
      {
        email,
        password,
      }: { email: string | undefined; password: string | undefined }
    ) {
      if (!email || !password)
        throw new ApolloError("Email or password missing");

      const user: UserBaseDocument = await User.findOne({ email }).select(
        "+password"
      );
      if (!user || !(await user.correctPassword(password, user.password))) {
        throw new ApolloError("Email or password incorrect");
      }

      return createSignJWT(user);
    },
  },
};
