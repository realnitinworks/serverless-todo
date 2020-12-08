import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { S3 } from 'aws-sdk';

import { TodoItem } from "../models/TodoItem";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { createLogger } from "../utils/logger"


const logger = createLogger('todoAccess');
const XAWS = AWSXRay.captureAWS(AWS);


export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly s3: S3 = new XAWS.S3({ signatureVersion: 'v4'}),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly createdAtIndex = process.env.CREATED_AT_INDEX,
        private readonly dueDateIndex = process.env.DUE_DATE_INDEX,
        private readonly bucketName = process.env.ATTACHMENTS_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) {

    }


    async getTodo(userId: string, todoId: string): Promise<TodoItem> {
        logger.info(`Getting todo with id: ${todoId} for user: ${userId}`);

        try {
            const result = await this.docClient.get({
                TableName: this.todosTable,
                Key: {
                    userId,
                    todoId
                }
            }).promise();

            logger.info(`Got todo successfully`)

            return result.Item as TodoItem;
        }
        catch (error) {
            logger.error(`Failed to get todo#${todoId} from DB`, {
                error
            });
        }        
    }


    async getTodos(userId: string): Promise<TodoItem[]> {
        logger.info(`Getting all todos for user: ${userId}`);

        try {
            const result = await this.docClient.query({
                TableName: this.todosTable,
                IndexName: this.createdAtIndex,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                },
                ScanIndexForward: false
            }).promise();

            const todos = result.Items;

            logger.info(`Got all todos`, {
                items: todos
            })

            return todos as TodoItem[];
        }
        catch (error) {
            logger.error(`Failed to get todos from DB`, {
                error
            });
        }
    }


    async getTodosSortedByDueDate(userId: string): Promise<TodoItem[]> {
        logger.info(`Getting all todos for user: ${userId} sorted by dueDate`);

        try {
            const result = await this.docClient.query({
                TableName: this.todosTable,
                IndexName: this.dueDateIndex,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                },
                ScanIndexForward: true
            }).promise();

            const todos = result.Items;

            logger.info(`Got all todos sorted by dueDate`, {
                items: todos
            })

            return todos as TodoItem[];
        }
        catch (error) {
            logger.error(`Failed to get todos from DB`, {
                error
            });
        }
    }


    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info(`Creating todo with id: ${todo.todoId} for user: ${todo.userId}`)
        
        try {
            await this.docClient.put({
                TableName: this.todosTable,
                Item: todo
            }).promise();

            logger.info(`Created todo successfully`);

            return todo as TodoItem;
        }
        catch (error) {
            logger.error(`Failed to create todo in DB`, {
                error
            });
        }
    }


    async deleteTodo(userId: string, todoId: string) {
        logger.info(`Delete todo with id: ${todoId} for user: ${userId}`);

        try {
            await this.docClient.delete({
                TableName: this.todosTable,
                Key: {
                    userId,
                    todoId
                }
            }).promise();

            logger.info(`Deleted todo successfully`);

        }
        catch (error) {
            logger.error(`Failed to delete todo from DB`, {
                error
            });
        }
    }


    async updateTodo(todo: TodoItem, updatedTodo: UpdateTodoRequest) {
        logger.info(`Updating todo with id: ${todo.todoId} for user: ${todo.userId}`)
    
        try {
            await this.docClient.update({
                TableName: this.todosTable,
                Key: {
                    userId: todo.userId,
                    todoId: todo.todoId
                },
                UpdateExpression: "set #N = :name, dueDate = :dueDate, done = :done",
                ExpressionAttributeValues: {
                    ":name": updatedTodo.name,
                    ":dueDate": updatedTodo.dueDate,
                    ":done": updatedTodo.done
                },
                ExpressionAttributeNames: {
                    "#N": "name"
                }
            }).promise();

            logger.info(`Updated todo successfully`);
        }
        catch (error) {
            logger.error(`Failed to update todo in DB`, {
                error
            });
        }
    }


    generatePreSignedUploadUrl(todoId: string) {
        logger.info(`Getting pre-signed url for todoId: ${todoId}`)

        try {
            return this.s3.getSignedUrl('putObject', {
                Bucket: this.bucketName,
                Key: todoId,
                Expires: this.urlExpiration
            })
        }
        catch (error) {
            logger.error(`Failed to get pre-signed url for upload`, {
                error
            });
        }
    }


    async updateAttachmentUrl(userId: string, todoId: string) {
        logger.info(`Updating attachmentUrl of todoId: ${todoId} for userId: ${userId}`);

        const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`

        try {
            await this.docClient.update({
                TableName: this.todosTable,
                Key: {
                    userId,
                    todoId
                },
                UpdateExpression: "set attachmentUrl = :attachmentUrl",
                ExpressionAttributeValues: {
                    ":attachmentUrl": attachmentUrl
                }
            }).promise();
            logger.info(`Updated todo with attachment url successfully`);
        }
        catch (error) {
            logger.error(`Failed to update todo with attachment url`, {
                error
            });
        }
    }
}
