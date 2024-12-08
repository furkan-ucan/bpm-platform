import { App } from './app';

const app = new App();
app.listen().catch(error => {
    console.error('Application failed to start:', error);
    process.exit(1);
}); 