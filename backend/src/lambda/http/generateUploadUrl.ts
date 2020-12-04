import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserId } from "../utils"
import { 
  generatePreSignedUploadUrl,
  updateAttachmentUrl,
  getTodo
} from "../../businessLogic/todos"
import { TodoItem } from '../../models/TodoItem'


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);
  
  const userId: string = getUserId(event);
  const todoId: string = event.pathParameters.todoId;

  const todo: TodoItem = await getTodo(userId, todoId);
  if (!todo) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        "error": `todo#${todoId} does not exist`
      })
    }
  }

  const uploadUrl: string = generatePreSignedUploadUrl(todoId);
  await updateAttachmentUrl(userId, todoId);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl
    })
  }
});


handler.use(
  cors({
    credentials: true
  })
);

