export const typeDef = `type PercentageTimes {
startPercentage: Float
  endPercentage: Float
}

type Task {
  id: ID
  title: String
  group: String
  description: String
  colour: String
  start: String
  end: String
  createdAt: String
  user: ReducedUser
  percentageTimes: PercentageTimes
  luminance: Float
}

extend type Query {
  tasks: [Task]
}

`;
