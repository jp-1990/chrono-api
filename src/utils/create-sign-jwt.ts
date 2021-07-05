import jwt from "jsonwebtoken";
import { UserBaseDocument } from "../models/userModel";
import { Types } from "mongoose";

export const signJWT = (userId: Types.ObjectId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// create, sign and send the token as a response
export const createSignJWT = (user: UserBaseDocument) => {
  const token = signJWT(user._id);

  const tokenExpires = new Date(
    Date.now() + Number(process.env.JWT_COOKIE_EXPIRES) * 24 * 60 * 60 * 1000
  );

  return {
    user,
    token,
    tokenExpires,
  };
};
