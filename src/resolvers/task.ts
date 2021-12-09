import { ApolloError } from 'apollo-server-express';
import moment from 'moment';
import { ObjectId } from 'mongoose';

import Task from '../models/taskModel';
import { UserBaseDocument } from '../models/userModel';

type CtxType = {
  user: UserBaseDocument | undefined;
};

type QueryTasksArgs = {
  startDate?: string;
  endDate?: string;
  comparePrev?: boolean;
  scope?: number;
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
    async allTasks(_, __, ctx: CtxType) {
      try {
        if (!ctx.user) throw new ApolloError('Unauthorized access!');

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
      } catch (err) {
        throw new ApolloError(`allTasks query failed: ${err}`);
      }
    },
    // get tasks for user based on args
    async tasks(_, args: QueryTasksArgs, ctx: CtxType) {
      try {
        if (!ctx.user) throw new ApolloError('Unauthorized access!');

        let range: undefined | number;
        if (args.startDate && args.endDate && args.comparePrev) {
          range = moment
            .duration(moment(args.endDate).diff(moment(args.startDate)))
            .asDays();
        }

        let start: { $gte: moment.Moment };
        if (range) {
          start = { $gte: moment(args.startDate).subtract(range, 'days') };
        } else if (args.endDate && args.scope && args.comparePrev) {
          start = {
            $gte: moment(args.endDate).subtract(args.scope * 2, 'days'),
          };
        } else if (args.endDate && args.scope) {
          start = { $gte: moment(args.endDate).subtract(args.scope, 'days') };
        } else if (args.scope) {
          start = { $gte: moment().subtract(args.scope || 30, 'days') };
        } else if (args.startDate) {
          start = { $gte: moment(args.startDate) };
        }

        let end: { $lte?: moment.Moment } | undefined;
        if (args.endDate) end = { $lte: moment(args.endDate) };

        const findArgs: {
          user: { _id: any };
          start: { $gte: moment.Moment };
          end?: { $lte?: moment.Moment } | undefined;
        } = {
          user: { _id: ctx.user._id },
          start,
        };
        if (end) findArgs.end = end;

        // @ts-expect-error no idea
        const tasks = await Task.find(findArgs).sort({
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
      } catch (err) {
        throw new ApolloError(`tasks query failed: ${err}`);
      }
    },
  },
  Mutation: {
    // create task
    async createTask(_, args: CreateTaskArgs, ctx: CtxType) {
      try {
        if (!ctx.user) throw new ApolloError('Unauthorized access!');
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
      } catch (err) {
        throw new ApolloError(`createTask mutation failed: ${err}`);
      }
    },

    // update task
    async updateTask(_, args: UpdateTaskArgs, ctx: CtxType) {
      try {
        if (!ctx.user) throw new ApolloError('Unauthorized access!');
        const { id, ...updateData } = args;
        const task = await Task.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: false,
        });
        if (!task) throw new ApolloError('No task found with that ID!');
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
      } catch (err) {
        throw new ApolloError(`updateTask mutation failed: ${err}`);
      }
    },

    // update task colour and group for all users tasks
    async updateTaskColourAndGroup(
      _,
      args: UpdateTaskColourAndGroupArgs,
      ctx: CtxType
    ) {
      try {
        if (!ctx.user) throw new ApolloError('Unauthorized access!');
        const userId = ctx.user._id;
        const { title, colour, group } = args;

        const input: { [key: string]: string } = {};
        if (colour) input.colour = colour;
        if (typeof group === 'string') input.group = group;

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
      } catch (err) {
        throw new ApolloError(
          `updateTaskColourAndGroup mutation failed: ${err}`
        );
      }
    },

    // delete task
    async deleteTask(_, { id }: DeleteTaskArgs, ctx: CtxType) {
      try {
        if (!ctx.user) throw new ApolloError('Unauthorized access!');
        const task = await Task.findByIdAndDelete(id);
        if (!task) throw new ApolloError('No task found with that ID!');
        return {
          id: task._id,
        };
      } catch (err) {
        throw new ApolloError(`deleteTask mutation failed: ${err}`);
      }
    },
  },
};
