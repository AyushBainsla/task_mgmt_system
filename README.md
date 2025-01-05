# task_mgmt_system

1. Introduction: In this Task Management System, I Integrated both the task the Core Requirements and Advanced Features. Below is the setup to run this locally on your system.

2. Setup:
    Prerequisites

        * Ensure you have the following installed on your machine:

            1. Node.js (v14 or higher)
            2. MongoDB
            3. Redis

        * Clone the Repository
            1. git clone <repository_url>
            2. cd <repository_directory>
        
        * Install Dependencies
            1. npm install

        * Environment Variables
            -Create a .env file in the root directory with the following variables:
                PORT=5000
                MONGO_URI=<your_mongo_connection_string>
                REDIS_HOST=127.0.0.1
                REDIS_PORT=6379
                JWT_SECRET=<your_jwt_secret>

            -Replace <your_mongo_connection_string> and <your_jwt_secret> with appropriate values.
        
        * Instructions
            Starting the Server
            To start the server, run the following command:
                - node app.js OR npm start
                - The server will run on http://localhost:5000 by default.

        * Running in Development Mode

            -For development with hot-reloading:
                -npm run dev


3. API Overview:
    * Authentication

        - All endpoints (except public ones) require a JWT token for authentication. Include the token in the Authorization header:
          Authorization: Bearer <your_jwt_token>

            * Endpoints
                - CRUD Operations

                1. Create Task
                    Endpoint: POST /tasks
                    - Body:
                    {
                    "title": "Task Title",
                    "description": "Task Description",
                    "dueDate": "2025-01-15",
                    "priority": "High"
                    }
                    - Response:
                    {
                    "message": "Task created successfully",
                    "task": {
                        "id": "12345",
                        "title": "Task Title",
                        ...
                    }
                    }

                2. Get Tasks
                    - Endpoint: GET /tasks
                        * Query Parameters:
                            status, priority, due_date, search
                        Response: Array of task objects.
                
                3. Update Task

                    - Endpoint: PUT /tasks/:id

                    - Body:

                    {
                    "title": "Updated Title",
                    "status": "Completed"
                    }

                    - Response: Updated task object.
                
                4. Delete Task

                    - Endpoint: DELETE /tasks/:id

                    - Response:

                    {
                    "message": "Task deleted successfully"
                    }

    * Task Assignment:

        1. Assign Task
            - Endpoint: POST /tasks/assign
            - Body:
                {
                "taskId": "12345",
                "userId": "67890"
                }
        
        2. View Assigned Tasks

            - Endpoint: GET /tasks/assigned
            - Response: Array of tasks assigned to the user.

    * Analytics:

        1. Get Task Analytics

            - Endpoint: GET /tasks/analytics

            - Response:

            {
            "completedTasks": 10,
            "pendingTasks": 5,
            "overdueTasks": 2
            }
        
        2. Get User Task Statistics

            - Endpoint: GET /tasks/analytics/:userId
            - Response:
            {
            "userId": "67890",
            "completedTasks": 5,
            "pendingTasks": 3,
            "overdueTasks": 1
            }
    

    * Assumptions and Design Decisions

     - Assumptions

        1. Role-Based Access: Different roles (Admin, Manager, User) determine access to specific task data.

        2. Real-Time Updates: WebSocket events notify clients of task creation and updates.

        3. Caching: Redis is used for caching task lists to improve performance.

     - Design Decisions

         1. MongoDB Schema: Tasks include fields for title, description, dueDate, priority, and status. The schema also tracks createdBy and assignedTo.

         2. Authentication: JWT-based authentication ensures secure API access.

         3. Modular Codebase: Controllers, routes, and middleware are modularized for maintainability.