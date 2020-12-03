import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { getUserId } from "../utils"


const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});
const todosTable = process.env.TODOS_TABLE;
const bucketName = process.env.ATTACHMENTS_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);
  
  const userId = getUserId(event);
  const todoId = event.pathParameters.todoId
  const uploadUrl = generatePreSignedUploadUrl(todoId);
  await updateAttachmentUrl(userId, todoId);
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
}


function generatePreSignedUploadUrl(uniqueId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: uniqueId,
    Expires: urlExpiration
  })
}

async function updateAttachmentUrl(userId: string, todoId: string) {
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

  await docClient.update({
    TableName: todosTable,
    Key: {
      userId,
      todoId
    },
    UpdateExpression: "set attachmentUrl = :attachmentUrl",
    ExpressionAttributeValues: {
      ":attachmentUrl": attachmentUrl
    }
  }).promise();
}
