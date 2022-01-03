import crypto from 'crypto';
import mongoose, { Document, Types, Model, Query } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { DocumentResult } from '../types';

export interface User {
  name?: string;
  email: string;
  photo?: string;
  role?: string;
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: number;
  passwordResetToken?: string;
  passwordResetExpires?: number;
  active?: boolean;
}

export interface UserBaseDocument
  extends User,
    Document,
    DocumentResult<UserBaseDocument> {
  _id: Types.ObjectId;
  correctPassword?: (
    inputPassword: string,
    userPassword: string
  ) => Promise<boolean>;
  passwordChangedAfter?: (
    this: UserBaseDocument,
    JWTTimeStamp: number
  ) => boolean;
  createPasswordResetToken?: () => string;
}

// USER SCHEMA // --------
const userSchema = new mongoose.Schema<UserBaseDocument, UserModel>({
  name: {
    type: String,
    required: [true, 'Please enter your name!'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      // This only works on create() and save()
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Number,
  passwordResetToken: String,
  passwordResetExpires: Number,
  verified: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// PRE MIDDLEWARE // --------
// hash the password if it has not already been hashed
userSchema.pre<UserBaseDocument>(/save/, async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// update 'password changed at'
userSchema.pre<UserBaseDocument>(/save/, async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() * 1000;
  next();
});

// only allow searches for active accounts
userSchema.pre<Query<UserBaseDocument, UserBaseDocument>>(
  /^find/,
  async function (next) {
    this.find({ active: { $ne: false } });
    next();
  }
);

// INSTANCE METHODS // --------
// checks if password input and saved password are equal
userSchema.methods.correctPassword = async function (
  inputPassword,
  userPassword
) {
  return await bcrypt.compare(inputPassword, userPassword);
};

// checks if the password has been changed since the JWT was issued
userSchema.methods.passwordChangedAfter = function (
  this: UserBaseDocument,
  JWTTimeStamp: number
) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      `${Number(new Date(this.passwordChangedAt).getTime()) / 1000}`,
      10
    );
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};

// create a password reset token
userSchema.methods.createPasswordResetToken = function (
  this: UserBaseDocument
) {
  const resetToken = crypto.randomBytes(32).toString('hex'); // converts randomBytes to a hexidecimal string

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// CREATE MODEL // --------
interface UserModel extends Model<UserBaseDocument> {}

export default mongoose.model<UserBaseDocument, UserModel>('User', userSchema);
