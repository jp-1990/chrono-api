import mongoose from "mongoose";

// TASK SCHEMA // --------
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a name for the entry!"],
      trim: true,
      maxlength: [50, "The title cannot exceed 50 characters"],
    },
    group: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    colour: {
      type: String,
      trim: true,
      default: "rgb(192, 192, 192)",
    },
    start: {
      type: Date,
      required: [true, "Please provide a start time/date for the entry!"],
    },
    end: {
      type: Date,
      required: [true, "Please provide a end time/date for the entry!"],
      validate: {
        validator: function (el) {
          return el > this.start;
        },
        message:
          "The specified end time/date must be after the start time/date!",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    __v: {
      select: false,
    },
    user: {
      type: String,
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "User",
      // required: [true, "A task must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// VIRTUALS // --------
taskSchema.virtual("percentageTimes").get(function () {
  const day = 24 * 60;
  const startTime = JSON.stringify(this.start.toLocaleTimeString())
    .replace(/"/g, "")
    .split(":");

  // temp ts hack
  const start0 = Number(startTime[0]);
  const start1 = Number(startTime[1]);

  if (startTime[2].slice(-2) === "PM" && start0 * 1 !== 12)
    startTime[0] = `${start0 + 12}`;

  const endTime = JSON.stringify(this.end.toLocaleTimeString())
    .replace(/"/g, "")
    .split(":");

  // temp ts hack
  const end0 = Number(endTime[0]);
  const end1 = Number(endTime[1]);

  if (endTime[2].slice(-2) === "PM" && end0 !== 12) endTime[0] = `${end0 + 12}`;
  const startMins = Number(startTime[0]) * 60 + Number(startTime[1]);
  const endMins = Number(endTime[0]) * 60 + Number(endTime[1]);

  return {
    startPercentage: (startMins / day) * 100,
    endPercentage: (endMins / day) * 100,
  };
});

taskSchema.virtual("cssSelector").get(function () {
  const target = this.title.replace(/[^a-zA-Z0-9]+/g, "");

  return target;
});

taskSchema.virtual("luminance").get(function () {
  // Y = 0.299 R + 0.587 G + 0.114 B
  const [r, g, b] = this.colour.replace(/[^\d,]/g, "").split(",");
  const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  return luminance;
});

// PRE MIDDLEWARE // --------
taskSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name",
  });
  next();
});

// TASK MODEL // --------
const Task = mongoose.model("Task", taskSchema);

export default Task;
