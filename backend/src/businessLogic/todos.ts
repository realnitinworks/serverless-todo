import * as uuid from 'uuid'

import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { TodoAccess } from "../dataLayer/todoAccess";
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';


const todoAccess = new TodoAccess();


export async function getTodo(userId: string, todoId: string): Promise<TodoItem> {
    return todoAccess.getTodo(userId, todoId);    
}


export async function getTodos(userId: string): Promise<TodoItem[]> {
    return todoAccess.getTodos(userId);
}


export async function createTodo(
    userId: string,
    createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
    
    const todoId: string = uuid.v4();
    const createdAt: string = new Date().toISOString();
    const done: boolean = false;

    const newTodo: TodoItem = {
        userId,
        todoId,
        createdAt,
        ...createTodoRequest,
        done
    }

    return todoAccess.createTodo(newTodo);
}


export async function deleteTodo(userId: string, todoId: string) {
    await todoAccess.deleteTodo(userId, todoId);
}


export async function updateTodo(
    todo: TodoItem,
    updatedTodo: UpdateTodoRequest
) {
    updatedTodo.name = updatedTodo.name === undefined ? todo.name : updatedTodo.name;
    updatedTodo.dueDate = updatedTodo.dueDate === undefined ? todo.dueDate : updatedTodo.dueDate;
    updatedTodo.done = updatedTodo.done === undefined ? todo.done : updatedTodo.done;
    await todoAccess.updateTodo(todo, updatedTodo);
}


export function generatePreSignedUploadUrl(todoId: string) {
    return todoAccess.generatePreSignedUploadUrl(todoId);
}


export async function updateAttachmentUrl(userId: string, todoId: string) {
    await todoAccess.updateAttachmentUrl(userId, todoId);
}
