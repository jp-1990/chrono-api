import Task from "./models/taskModel";

const books = [
  {
    title: "The Awakening",
    author: "Kate Chopin",
  },
  {
    title: "City of Glass",
    author: "Paul Auster",
  },
];

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
export const resolvers = {
  Query: {
    tasks() {
      return Task.find().then((task) => {
        return task.map((el) => {
          return {
            ...el._doc,
            id: el.id,
            percentageTimes: el.percentageTimes,
            luminance: el.luminance,
          };
        });
      });
    },
  },
};
