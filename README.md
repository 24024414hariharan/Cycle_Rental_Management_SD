# Microservices Common Documentation

## Overview
This repository contains a set of Node.js microservices built to handle various functionalities. Each microservice follows a consistent structure and is implemented with TypeScript, leveraging frameworks like Express and tools like Prisma ORM.

## Common Features
- Microservices designed for specific domains, such as user management, order processing, etc.
- Secure password handling using `bcryptjs`.
- JWT-based authentication for secure communication.
- Built-in request validation and rate limiting.
- Environment configuration using `dotenv`.

## Prerequisites
- Node.js (>= 18.x)
- npm (>= 8.x)
- PostgreSQL database

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the desired microservice directory:
   ```bash
   cd <microservice-name>
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Configuration
1. Create a `.env` file in the root directory of each microservice with the following variables:
   ```env
   DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
   JWT_SECRET=<your-secret>
   PORT=<microservice-port>
   ```
2. Update the `prisma/schema.prisma` file in each microservice if required.

## SonarQube Integration
Each microservice must include a `sonar-project.properties` file for SonarQube configuration. Below is an example configuration:

```properties
# SonarQube Project Metadata
sonar.projectKey=CRMS-User-Service
sonar.projectName=CRMS-User-Service
sonar.projectVersion=1.0

# Paths to Sources and Tests
sonar.sources=src
sonar.tests=test
sonar.inclusions=src/**/*.ts

# Exclusions to Avoid Noise
sonar.exclusions=node_modules/**,dist/**,coverage/**,test/**

# Coverage and Test Reports
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.testExecutionReportPaths=coverage/test-report.xml

# SonarQube Server and Authentication
sonar.host.url=http://localhost:9000
sonar.login=<key>
```
Replace `<key>` with the specific SonarQube project key.

## Scripts
The following scripts are commonly defined in the `package.json` of each microservice:

### Build
```bash
npm run build
```
Compiles the TypeScript files in the project.

### Start
```bash
npm start
```
Runs the application with hot-reload support using `concurrently`. This will:
- Watch for file changes (`npm run watch`)
- Serve the application (`npm run serve`)

### Test
```bash
npm test
```
Runs the test suite using `jest`.

### Test Coverage
```bash
npm run test:coverage
```
Runs tests and generates a test coverage report.

### Sonar
```bash
npm run sonar
```
Executes `sonar-scanner` for static code analysis and integration with SonarQube.

### OWASP Dependency Check
```bash
npm run owasp
```
Runs OWASP Dependency Check to detect vulnerabilities in the project's dependencies.

## Development Workflow
- **Watch Mode**: Start the TypeScript compiler in watch mode to recompile files on changes:
  ```bash
  npm run watch
  ```
- **Serve**: Run the compiled JavaScript files using `nodemon` for automatic server restarts:
  ```bash
  npm run serve
  ```

## Testing
- Unit and integration tests are written with `jest`.
- HTTP endpoint testing uses `supertest`.

## Git Commit and Branch Formats
- **Commit Messages**:
  ```
  feat(CRMS-00): <CommitMessage>
  ```
  Example: `feat(CRMS-42): Add user authentication endpoint`

- **Branch Names**:
  ```
  feat/CRMS-00_feature_name
  ```
  Example: `feat/CRMS-42_add_authentication`

## Code Maintainers
| Name                     | Student ID   | Batch       |
|--------------------------|--------------|-------------|
| Hari Haran Rathinakumar  | 24024414     | 2024-25     |
| Prasanth Ramaswamy       | 24134252     | 2024-25     |
| Ridu Viknesh Rajendran   | 24088722     | 2024-25     |
| Rehith Bhagwanth         | 24071013     | 2024-25     |

## License
This project is licensed under the ISC License. See the LICENSE file for more details.
