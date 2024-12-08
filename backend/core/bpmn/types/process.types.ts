export interface ProcessContext {
  processId: string;
  userId: string;
  variables?: Record<string, any>;
}

export interface ProcessInstance {
  id: string;
  status: ProcessInstanceStatus;
  context: ProcessContext;
}

export type ProcessInstanceStatus = 
  | 'created'
  | 'running'
  | 'completed'
  | 'failed'
  | 'terminated'; 