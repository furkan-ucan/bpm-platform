import { Schema, model, Document } from 'mongoose';
import { ITask, TaskStatus,  TaskPriority } from '../types/task.types';

const taskSchema = new Schema({
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    processId: { type: Schema.Types.ObjectId, ref: 'Process', required: true },
    stepId: { type: String, required: true },
    status: { type: String, enum: Object.values(TaskStatus), default: 'pending' },
    priority: { type: String, enum: Object.values(TaskPriority), default: 'medium' },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date },
    completedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Task = model<ITask>('Task', taskSchema); 