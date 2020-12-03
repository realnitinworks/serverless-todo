import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from "../utils"
import { createTodo } from '../../businessLogic/todos'
import { TodoItem } from '../../models/TodoItem'



export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);
  
  const createTodoRequest: CreateTodoRequest = JSON.parse(event.body);
  const userId: string = getUserId(event);
  const newTodo: TodoItem = await createTodo(userId, createTodoRequest);


  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: newTodo
    })
  }
}
