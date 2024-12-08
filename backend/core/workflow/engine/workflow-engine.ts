interface WorkflowState {
    id: string;
    type: 'task' | 'approval' | 'notification';
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
}

export class WorkflowEngine {
    private currentState: WorkflowState;

    constructor(initialState: WorkflowState) {
        this.currentState = initialState;
    }

    public async transition(action: 'complete' | 'reject'): Promise<WorkflowState> {
        switch (action) {
            case 'complete':
                this.currentState.status = 'completed';
                break;
            case 'reject':
                this.currentState.status = 'rejected';
                break;
            default:
                throw new Error('Geçersiz aksiyon');
        }

        return this.currentState;
    }

    public getCurrentState(): WorkflowState {
        return this.currentState;
    }
} 