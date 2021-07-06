import { ApolloError } from "apollo-server-errors";

import Task from "../models/taskModel";
import { UserBaseDocument } from "../models/userModel";

type CtxType = {
  user: UserBaseDocument | undefined;
};

type CreateTaskArgs = {
  title: string;
  group?: string;
  description?: string;
  start: string;
  end: string;
  colour?: string;
};

type UpdateTaskArgs = {
  id: string;
  title?: string;
  description?: string;
  start?: Date;
  end?: Date;
};

type UpdateTaskColourAndGroupArgs = {
  title: string;
  colour?: string;
  group?: string;
};

type DeleteTaskArgs = {
  id: string;
};

export const resolvers = {
  Query: {
    // get all tasks for user
    async tasks(_, __, ctx: CtxType) {
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
    async createTask(_, args: CreateTaskArgs, ctx: CtxType) {
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
    async updateTask(_, args: UpdateTaskArgs, ctx: CtxType) {
      if (!ctx.user) throw new ApolloError("Unauthorized access!");
      const { id, ...updateData } = args;
      const task = await Task.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: false,
      });
      if (!task) throw new ApolloError("No task found with that ID!");
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

    // update task colour and group for all users tasks
    async updateTaskColourAndGroup(
      _,
      args: UpdateTaskColourAndGroupArgs,
      ctx: CtxType
    ) {
      if (!ctx.user) throw new ApolloError("Unauthorized access!");
      const userId = ctx.user._id;
      const { title, colour, group } = args;

      const input: { [key: string]: string } = {};
      if (colour) input.colour = colour;
      if (typeof group === "string") input.group = group;

      await Task.updateMany({ title: title }, input, {
        new: true,
        runValidators: false,
      });

      // @ts-expect-error no idea
      const tasks = await Task.find({
        title: title,
        user: { _id: userId },
      }).sort({
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

    // delete task
    async deleteTask(_, { id }: DeleteTaskArgs, ctx: CtxType) {
      if (!ctx.user) throw new ApolloError("Unauthorized access!");
      const task = await Task.findByIdAndDelete(id);
      if (!task) throw new ApolloError("No task found with that ID!");
      return {
        id: task._id,
      };
    },
  },
};
