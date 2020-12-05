import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from "../utils"
import { createTodo } from '../../businessLogic/todos'
import { TodoItem } from '../../models/TodoItem'
import { createLogger } from "../../utils/logger"


const logger = createLogger('createTodo');


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info("Processing event for creating a todo", {
    event
  });
  
  const createTodoRequest: CreateTodoRequest = JSON.parse(event.body);
  const userId: string = getUserId(event);
  const newTodo: TodoItem = await createTodo(userId, createTodoRequest);

  return {
    statusCode: 201,
    body: JSON.stringify({
      item: newTodo
    })
  }
});


handler.use(
  cors({
    credentials: true
  })
);
