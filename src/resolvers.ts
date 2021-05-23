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
      // @ts-ignore
      return Task.find().then((task) => {
        // @ts-ignore
        return task.map((el) => {
          // @ts-ignore
          return {
            // @ts-ignore
            ...el._doc,
            id: el.id,
            // @ts-ignore
            percentageTimes: el.percentageTimes,
            // @ts-ignore
            luminance: el.luminance,
          };
        });
      });
    },
  },
};
