# Development Guide

## Getting Started

### Development Environment Setup

1. **Prerequisites**
   - Node.js (v18 or higher)
   - MongoDB
   - Git
   - VS Code (recommended)
   - Docker (optional)

2. **IDE Configuration**
   ```json
   // Recommended VS Code extensions
   {
     "recommendations": [
       "dbaeumer.vscode-eslint",
       "esbenp.prettier-vscode",
       "ms-vscode.vscode-typescript-tslint-plugin",
       "mongodb.mongodb-vscode"
     ]
   }
   ```

3. **Environment Setup**
   ```bash
   # Clone repository
   git clone https://github.com/furkan-ucan/bpm-platform.git
   cd bpm-platform

   # Install dependencies
   cd backend
   npm install

   # Set up environment variables
   cp .env.example .env
   ```

## Development Workflow

### Git Workflow

1. **Branch Naming Convention**
   - Feature: `feature/description`
   - Bug Fix: `fix/description`
   - Hotfix: `hotfix/description`
   - Release: `release/version`

2. **Commit Message Format**
   ```
   type(scope): description

   [optional body]

   [optional footer]
   ```
   Types: feat, fix, docs, style, refactor, test, chore

3. **Pull Request Process**
   - Create feature branch
   - Implement changes
   - Write/update tests
   - Create pull request
   - Code review
   - Merge after approval

### Code Style Guide

1. **TypeScript Guidelines**
   ```typescript
   // Use interfaces for object definitions
   interface User {
     id: string;
     name: string;
     email: string;
   }

   // Use enums for fixed values
   enum ProcessStatus {
     DRAFT = 'draft',
     ACTIVE = 'active',
     COMPLETED = 'completed'
   }

   // Use type for union types
   type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
   ```

2. **File Naming Conventions**
   ```
   - Component files: PascalCase.tsx
   - Utility files: camelCase.ts
   - Test files: *.test.ts
   - Style files: *.styles.ts
   ```

3. **Project Structure**
   ```
   backend/
   ├── src/
   │   ├── api/
   │   ├── config/
   │   ├── core/
   │   ├── infrastructure/
   │   ├── interfaces/
   │   └── services/
   ├── tests/
   │   ├── unit/
   │   └── integration/
   └── package.json
   ```

## Testing

### Unit Testing

```typescript
// Example test file
import { ProcessService } from '../services/process.service';

describe('ProcessService', () => {
  let service: ProcessService;

  beforeEach(() => {
    service = new ProcessService();
  });

  it('should create process', async () => {
    const process = await service.create({
      name: 'Test Process',
      description: 'Test Description'
    });
    expect(process).toBeDefined();
    expect(process.name).toBe('Test Process');
  });
});
```

### Integration Testing

```typescript
// Example integration test
import request from 'supertest';
import app from '../src/app';

describe('Process API', () => {
  it('should create new process', async () => {
    const response = await request(app)
      .post('/api/processes')
      .send({
        name: 'Test Process',
        description: 'Test Description'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

## Error Handling

### Standard Error Format

```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Usage
throw new AppError(400, 'Invalid process data');
```

### Error Middleware

```typescript
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};
```

## Logging

### Logger Configuration

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Performance Optimization

### Database Optimization

1. **Indexing**
   ```typescript
   // Create compound index
   await collection.createIndex({ field1: 1, field2: -1 });

   // Create text index
   await collection.createIndex({ description: 'text' });
   ```

2. **Query Optimization**
   ```typescript
   // Use projection
   const result = await collection.find(
     { status: 'active' },
     { name: 1, status: 1 }
   );

   // Use aggregation for complex queries
   const pipeline = [
     { $match: { status: 'active' } },
     { $group: { _id: '$category', count: { $sum: 1 } } }
   ];
   ```

## Security Best Practices

1. **Input Validation**
   ```typescript
   import Joi from 'joi';

   const processSchema = Joi.object({
     name: Joi.string().required(),
     description: Joi.string().optional(),
     status: Joi.string().valid('draft', 'active', 'completed')
   });
   ```

2. **Authentication**
   ```typescript
   import jwt from 'jsonwebtoken';

   const generateToken = (user: User): string => {
     return jwt.sign(
       { id: user.id, role: user.role },
       process.env.JWT_SECRET!,
       { expiresIn: '24h' }
     );
   };
   ```

## Deployment

### Development
```bash
npm run dev
```

### Staging
```bash
npm run build
npm run start:staging
```

### Production
```bash
npm run build
npm run start:prod
```

## Monitoring

### Health Checks

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    version: process.env.npm_package_version
  });
});
```

### Performance Monitoring

```typescript
import prometheus from 'prom-client';

const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 500]
});
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For support and questions:
1. Check existing documentation
2. Search issues on GitHub
3. Create new issue if needed
4. Contact development team

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
