import jwt from "jsonwebtoken";
import User, { UserBaseDocument } from "../models/userModel";

export const setUserContext = async (req: any) => {
  const token = req.headers.authorization;
  let user: UserBaseDocument | undefined = undefined;
  // verify jwt
  try {
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof verifiedToken === "string") return { user };
    // get user based on id from verified token
    const currentUser = await User.findById(verifiedToken.userId);
    // check user exists and password hasn't changed since token was issued
    if (!currentUser) return { user };
    if (currentUser.passwordChangedAfter(verifiedToken.iat)) return { user };
    user = currentUser;
  } catch (err) {
    console.log(err);
  }
  return user;
};
