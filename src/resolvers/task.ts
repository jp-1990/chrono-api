import { ApolloError } from "apollo-server-errors";

import Task from "../models/taskModel";
import { UserBaseDocument } from "../models/userModel";

export const resolvers = {
  Query: {
    async tasks(_, __, ctx: { user: UserBaseDocument | undefined }) {
      if (!ctx.user) throw new ApolloError("Unauthorized access!");

      //@ts-expect-error no idea
      const tasks = await Task.find({ user: { _id: ctx.user._id } }).sort({
        start: 1,
      });

      return tasks.map((el) => {
        return {
          ...el._doc,
          id: el.id,
          percentageTimes: el.percentageTimes,
          luminance: el.luminance,
        };
      });
    },
  },
};
