import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserId } from "../utils"
import { getTodos } from "../../businessLogic/todos"
import { TodoItem } from '../../models/TodoItem'
import { createLogger } from "../../utils/logger"


const logger = createLogger('getTodos');


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info("Processing event for getting all todos", {
    event
  });

  const userId: string = getUserId(event);
  const todos: TodoItem[] = await getTodos(userId);

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: todos
    })
  }
});


handler.use(
  cors({
    credentials: true
  })
);
