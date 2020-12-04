import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { getUserId } from "../utils"
import { deleteTodo, getTodo } from '../../businessLogic/todos';
import { TodoItem } from '../../models/TodoItem'


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);
  
  const userId: string = getUserId(event);
  const todoId: string = event.pathParameters.todoId;

  const todo: TodoItem = await getTodo(userId, todoId);
  if (!todo) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        "error": `todo#${todoId} does not exist`
      })
    }
  }

  await deleteTodo(userId, todoId);
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ""
  }
}
