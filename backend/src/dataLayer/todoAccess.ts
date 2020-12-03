import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { TodoItem } from "../models/TodoItem";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = new DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly createdAtIndex = process.env.CREATED_AT_INDEX
    ) {

    }


    async getTodo(userId: string, todoId: string): Promise<TodoItem> {
        console.log(`Getting todo with id: ${todoId} for user: ${userId}`);

        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            }
        }).promise();

        return result.Item as TodoItem;
    }


    async getTodos(userId: string): Promise<TodoItem[]> {
        console.log(`Getting all todos for user: ${userId}`);

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

        return todos as TodoItem[];
    }


    async createTodo(todo: TodoItem): Promise<TodoItem> {
        console.log(`Creating todo with id: ${todo.todoId} for user: ${todo.userId}`)
        
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise();

        return todo as TodoItem;
    }


    async deleteTodo(userId: string, todoId: string) {
        console.log(`Delete todo with id: ${todoId} for user: ${userId}`);

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            }
        }).promise();
    }


    async updateTodo(todo: TodoItem, updatedTodo: UpdateTodoRequest) {
        console.log(`Update todo with id: ${todo.todoId} for user: ${todo.userId}`)
    
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
    }
}