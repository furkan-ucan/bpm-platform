import { Schema, model, Types } from "mongoose";
import { ProcessStatus, ProcessStep } from "../types/process.types";

// Süreç meta verileri için interface
interface IProcessMetadata {
  estimatedDuration: number;  // dakika cinsinden
  costCenter?: string;
  tags: string[];
}

// Ana süreç interface'i
export interface IProcess {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  bpmnXml: string;
  status: ProcessStatus;
  category: string;
  priority: 'low' | 'medium' | 'high';
  owner: Types.ObjectId;
  participants: Types.ObjectId[];
  metadata: IProcessMetadata;
  isTemplate: boolean;
  version: number;
  steps: ProcessStep[];
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Süreç adımları için schema
const ProcessStepSchema = new Schema<ProcessStep>({
  id: {
    type: String,
    index: true
  },
  elementId: {
    type: String,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ["task", "approval", "notification", "automation", "decision"],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ["pending", "completed", "rejected"],
    default: "pending",
    index: true
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true
  },
  dueDate: {
    type: Date,
    index: true
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  sequence: {
    type: Number,
    required: true,
    index: true
  },
  dependsOn: [{
    type: String,
    index: true
  }],
  notes: {
    type: String
  },
  metadata: {
    estimatedDuration: { type: Number },
    costCenter: { type: String },
    tags: [{ type: String }]
  },
  data: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// İndexler
ProcessStepSchema.index({ type: 1, status: 1 });
ProcessStepSchema.index({ assignedTo: 1, status: 1 });
ProcessStepSchema.index({ dueDate: 1, status: 1 });

// Ana süreç schema'sı
const ProcessSchema = new Schema<IProcess>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: { type: String },
  bpmnXml: { type: String, required: true },
  status: {
    type: String,
    enum: Object.values(ProcessStatus),
    default: ProcessStatus.DRAFT
  },
  category: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  metadata: {
    estimatedDuration: { type: Number },
    costCenter: { type: String },
    tags: [{ type: String }]
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

// İndexleri ayrı olarak tanımlıyoruz
ProcessSchema.index({ name: 1 });
ProcessSchema.index({ status: 1 });
ProcessSchema.index({ category: 1 });
ProcessSchema.index({ priority: 1 });
ProcessSchema.index({ owner: 1 });
ProcessSchema.index({ 'metadata.tags': 1 });
ProcessSchema.index({ isTemplate: 1 });

export const Process = model<IProcess>('Process', ProcessSchema);
