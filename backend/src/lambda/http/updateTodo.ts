import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS from 'aws-sdk'
import { getUserId } from "../utils"


const docClient = new AWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);

  const userId = getUserId(event);
  const todoId = event.pathParameters.todoId;
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  const result = await docClient.get({
    TableName: todosTable,
    Key: {
      userId,
      todoId
    }
  }).promise();

  const todo = result.Item;
  console.log("Todo: ", todo);

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

  const name = updatedTodo.name === undefined ? todo.name : updatedTodo.name;
  const dueDate = updatedTodo.dueDate === undefined ? todo.dueDate : updatedTodo.dueDate;
  const done = updatedTodo.done === undefined ? todo.done : updatedTodo.done;

  await docClient.update({
    TableName: todosTable,
    Key: {
      userId,
      todoId
    },
    UpdateExpression: "set #N = :name, dueDate = :dueDate, done = :done",
    ExpressionAttributeValues: {
      ":name": name,
      ":dueDate": dueDate,
      ":done": done
    },
    ExpressionAttributeNames: {
      "#N": "name"
    }
  }).promise();

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ""
  }
}
