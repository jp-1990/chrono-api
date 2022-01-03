import { ApolloError } from 'apollo-server-errors';

import User, { UserBaseDocument } from '../models/userModel';
import { createSignJWT, sendEmail } from '../utils';

type CreateUserArgs = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
};

export const resolvers = {
  Mutation: {
    async signIn(
      _,
      {
        email,
        password,
      }: { email: string | undefined; password: string | undefined }
    ) {
      if (!email || !password)
        throw new ApolloError('Email or password missing');

      const user: UserBaseDocument = await User.findOne({ email }).select(
        '+password'
      );
      if (!user || !(await user.correctPassword(password, user.password))) {
        throw new ApolloError('Email or password incorrect');
      }

      return createSignJWT(user);
    },
    async registerUser(_, args: CreateUserArgs) {
      try {
        //create new user
        const user = await User.create(args);
        // send verification email with userId in deep link
        const emailParams = {
          userName: args.name,
          email: args.email,
          url: '',
        };
        // const response = await sendEmail(emailParams);
        return true;
      } catch (err) {
        new ApolloError(`failed to register user: ${err}`);
      }
    },
  },
};
