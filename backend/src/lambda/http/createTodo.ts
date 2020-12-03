import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'


const docClient = new AWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);
  
  const newTodo: CreateTodoRequest = JSON.parse(event.body);
  const userId = "123"; // Hard-code for now
  const todoId = uuid.v4();
  const createdAt = new Date().toISOString();
  const done = false;

  const newItem = {
    userId,
    todoId,
    createdAt,
    ...newTodo,
    done
  }

  await docClient.put({
    TableName: todosTable,
    Item: newItem
  }).promise();


  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: newItem
    })
  }
}
