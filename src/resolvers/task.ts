import { ApolloError } from "apollo-server-errors";

import Task from "../models/taskModel";
import { UserBaseDocument } from "../models/userModel";

export const resolvers = {
  Query: {
    // get all tasks for user
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
  Mutation: {
    // create task
    async createTask(
      _,
      args: {
        title: string;
        group?: string;
        description?: string;
        start: string;
        end: string;
        colour?: string;
      },
      ctx: { user: UserBaseDocument | undefined }
    ) {
      if (!ctx.user) throw new ApolloError("Unauthorized access!");
      const input = { ...args, user: ctx.user._id };
      const task = await Task.create(input);

      return {
        id: task._id,
        title: task.title,
        group: task.group,
        description: task.description,
        colour: task.colour,
        start: task.start,
        end: task.end,
        createdAt: task.createdAt,
        percentageTimes: {
          startPercentage: task.percentageTimes.startPercentage,
          endPercentage: task.percentageTimes.endPercentage,
        },
        luminance: task.luminance,
        user: {
          id: ctx.user._id,
          name: ctx.user.name,
        },
      };
    },

    // update task

    // delete task
  },
};
