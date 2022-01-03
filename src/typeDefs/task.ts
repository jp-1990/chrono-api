export const typeDef = `
type PercentageTimes {
  startPercentage: Float
  endPercentage: Float
}

type Task {
  id: ID
  title: String
  group: String
  description: String
  colour: String
  start: String!
  end: String!
  createdAt: String
  user: ReducedUser
  percentageTimes: PercentageTimes
  luminance: Float
}

type TaskId {
  id:ID
}

extend type Query {
  allTasks: [Task]
  tasks(scope:Int startDate:String endDate:String comparePrev:Boolean):[Task]
}

extend type Mutation {
  createTask(        
    title: String!,
    group: String,
    description: String,
    start: String!,
    end: String!,
    colour: String
    ):Task
   
  updateTask(
    id:String!
    title: String,
    description: String,
    start: String,
    end: String,
  ):Task

  updateTaskColourAndGroup(
  title:String!
  colour:String
  group:String
  ):[Task]

  deleteTask(
    id:String!
  ):TaskId
}

`;
