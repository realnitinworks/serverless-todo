import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserId } from "../utils"
import { deleteTodo, getTodo } from '../../businessLogic/todos';
import { TodoItem } from '../../models/TodoItem'
import { createLogger } from "../../utils/logger"


const logger = createLogger('deleteTodo');


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info("Processing event for deleting todo", {
    event
  });
  
  const userId: string = getUserId(event);
  const todoId: string = event.pathParameters.todoId;

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

  await deleteTodo(userId, todoId);
    
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
