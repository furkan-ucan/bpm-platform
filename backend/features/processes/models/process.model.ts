import { Schema, model, type Types } from "mongoose";
import { type ProcessStatus, ProcessStatus as ProcessStatusEnum } from '../types/process.types';
import { type ProcessStep } from '../types/process.types';

export interface IProcess {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  bpmnXml: string;
  status: ProcessStatus;
  isTemplate: boolean;
  version: number;
  steps: ProcessStep[];
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProcessStepSchema = new Schema<ProcessStep>({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["task", "approval", "notification"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "rejected"],
    default: "pending",
  },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  dueDate: { type: Date },
});

const ProcessSchema = new Schema<IProcess>({
  name: { 
    type: String, 
    required: true,
    unique: true 
  },
  description: { 
    type: String 
  },
  bpmnXml: {
    type: String,
    required: true
  },
  status: { 
    type: String,
    enum: Object.values(ProcessStatusEnum),
    default: ProcessStatusEnum.ACTIVE
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 1
  },
  steps: [ProcessStepSchema],
  createdBy: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  updatedBy: { 
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export const Process = model<IProcess>('Process', ProcessSchema);
