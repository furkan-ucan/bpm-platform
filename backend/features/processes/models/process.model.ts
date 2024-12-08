import { Schema, model, type Document, type Types } from "mongoose";

export interface IProcessStep {
  name: string;
  type: "task" | "approval" | "notification";
  status: "pending" | "completed" | "rejected";
  assignedTo?: Types.ObjectId;
  dueDate?: Date;
}

export interface IProcess extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  status: "active" | "inactive" | "archived" | "completed";
  isTemplate: boolean;
  steps: IProcessStep[];
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const processStepSchema = new Schema<IProcessStep>({
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

const processSchema = new Schema<IProcess>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "archived", "completed"],
      default: "active",
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    steps: [processStepSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const Process = model<IProcess>("Process", processSchema);
