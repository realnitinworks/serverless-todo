import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from "../utils"
import { TodoItem } from '../../models/TodoItem'
import { updateTodo, getTodo } from '../../businessLogic/todos'
import { createLogger } from "../../utils/logger"


const logger = createLogger('updateTodo');


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info("Processing event for updating todo", {
    event
  });

  const userId: string = getUserId(event);
  const todoId: string = event.pathParameters.todoId;
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);

  const todo: TodoItem = await getTodo(userId, todoId);
  if (!todo) {
    logger.error(`todo#${todoId} does not exist`);
    return {
      statusCode: 404,
      body: JSON.stringify({
        "error": `todo#${todoId} does not exist`
      })
    }
  }

  await updateTodo(todo, updatedTodo);
  
  return {
    statusCode: 200,
    body: ""
  }
});


handler.use(
  cors({
    credentials: true
  })
);
