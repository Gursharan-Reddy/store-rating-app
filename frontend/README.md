Store Rating Application
A full-stack web application that allows users to register, discover, and submit 1-5 star ratings for various stores. The platform features a role-based access control system, providing distinct functionalities for Normal Users, Store Owners, and a System Administrator.

⚙️ Local Development Setup
To run this project on your local machine, follow these steps.

Prerequisites
Node.js (v16 or later recommended)

npm

1. Clone the Repository
Clone this project to your local machine.

git clone [Your GitHub Repository URL]
cd store-rating-app

2. Set Up the Backend
The backend server runs on http://localhost:5000.

# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the development server
npm start

The first time you run this, a store_ratings.db file will be created with a default admin user and sample stores.

3. Set Up the Frontend
Open a new terminal window for this step. The frontend server runs on http://localhost:3000.

# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start

Your browser should automatically open to the application's login page.

🚀 Key Features
The application is built with a clear separation of roles, each with its own dedicated dashboard and set of features.

👤 Normal User
Authentication: Secure sign-up and login functionality.

Store Discovery: View a list of all registered stores with their overall average ratings.

Search & Filter: Find stores by name or address.

Rating System: Submit a 1-5 star rating for any store. Users can see their own submitted rating and modify it at any time.

Profile Management: Users can update their own name, email, and password.

🏪 Store Owner
Secure Login: Access to a dedicated dashboard.

Performance Metrics: View the average rating of their specific store.

Customer Insights: See a list of all users who have submitted a rating for their store, along with the rating given.

Profile Management: Can update their own password and profile details.

🧑‍💻 System Administrator
Comprehensive Dashboard: At-a-glance view of key platform metrics:

Total number of users.

Total number of stores.

Total number of ratings submitted.

User Management: Ability to create new users with any role (Admin, Store Owner, Normal User).

Store Management: Ability to add new stores to the platform and assign them to owners.

Data Viewing: View filterable and sortable lists of all users and stores on the platform.

🛠️ Tech Stack
This project is built with a modern JavaScript-based stack.

Frontend:

React.js - A JavaScript library for building user interfaces.

React Router - For client-side routing.

Axios - For making API requests to the backend.

CSS3 - For custom styling and responsive design.

Backend:

Node.js - JavaScript runtime environment.

Express.js - A minimal and flexible Node.js web application framework.

JSON Web Tokens (JWT) - For secure user authentication.

bcrypt.js - For hashing passwords.

Database:

SQLite3 - A self-contained, serverless database engine used for local development.

🔑 Default Credentials
For easy testing and administration, a default System Administrator account is created when the database is first initialized.

Email: admin@example.com

Password: AdminPassword1!

📜 Project Structure
This project uses a monorepo structure, with the backend and frontend codebases living in the same repository but in separate directories.

store-rating-app/
│
├── .gitignore         # Specifies files for Git to ignore
├── README.md          # This file
│
├── backend/           # Express.js REST API
│   ├── routes/
│   ├── database.js
│   ├── index.js
│   └── package.json
│
└── frontend/          # React.js client-side application
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── hooks/
    │   ├── pages/
    │   └── services/
    └── package.json
