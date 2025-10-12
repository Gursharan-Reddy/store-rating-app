Store Rating Application
A full-stack web application that allows users to register, discover, and submit 1-5 star ratings for various stores. The platform features a role-based access control system, providing distinct functionalities for Normal Users, Store Owners, and a System Administrator.

This project is built with a React frontend and an Express.js backend connected to a PostgreSQL database.

Key Features
System Administrator
Dashboard: View key metrics like total users, total stores, and total ratings.

User Management: Create new users with any role (Admin, Normal, Store Owner).

Store Management: Create new stores and assign them to Store Owners simultaneously.

View Lists: See comprehensive lists of all registered users and stores.

Normal User
Authentication: Sign up for a new account and log in.

Store Discovery: View a list of all registered stores.

Search & Filter: Find stores by name or address.

Rating System: Submit and modify personal 1-5 star ratings for any store.

Profile Management: Update personal details and password.

Store Owner
Dashboard: Monitor the store's average rating.

View Ratings: See a list of all users who have rated their specific store, along with the rating they gave.

Profile Management: Update personal details and password.

Tech Stack
Frontend: React.js, React Router, Axios

Backend: Node.js, Express.js

Database: PostgreSQL

Authentication: JSON Web Tokens (JWT), bcrypt

Local Development Setup
To run this project on your local machine, follow these steps.

Prerequisites
Node.js (v16 or later recommended)

npm (usually comes with Node.js)

Git for version control

1. Clone the Repository
Open your terminal and clone the project to your local machine:

git clone [https://github.com/Gursharan-Reddy/store-rating-app.git](https://github.com/Gursharan-Reddy/store-rating-app.git)
cd store-rating-app

2. Backend Setup
The backend requires a connection to a PostgreSQL database.

Navigate to the backend directory:

cd backend

Install dependencies:

npm install

Set up the Environment File (.env):
You need to create a .env file in the backend folder to store your database connection string.

Create a new file named .env inside the backend directory.

Add one line to this file:

DATABASE_URL=postgres://YOUR_DATABASE_URL_HERE

Note: You will need a PostgreSQL database instance. You can either install one locally or use a free cloud service like the one on Render.com to get a connection URL.

Start the backend server:

npm start

The server will run on http://localhost:5000. You should see logs confirming the database connection.

3. Frontend Setup
Open a new, separate terminal window for these steps.

Navigate to the frontend directory:

cd frontend

Install dependencies:

npm install

Start the frontend development server:

npm start

Your browser should automatically open to http://localhost:3000, where you can see the application running.

How to Use the Application
The application has three distinct user roles. Here’s how to access them.

Logging in as System Administrator 🧑‍💻
The application comes with a pre-seeded default administrator account. Use these credentials on the login page to access the Admin Dashboard.

Email: admin@example.com

Password: AdminPassword1!

Creating and Logging in as a Store Owner 🏪
There is no default Store Owner account. You must create one using the Admin account.

Log in as the Administrator using the credentials above.

On the Admin Dashboard, find the "Create New User" form.

Fill in the details for your new user (Full Name, User Email, Password, User Address). Remember that the name must be at least 20 characters long.

Click the "Role" dropdown menu and select "Store Owner".

When you select "Store Owner," new fields will appear for the store's details. Fill these out (Store Name, Store Contact Email, Store Address).

Click the "Create User" button. You should see a success message.

Log out of the Admin account.

You can now go back to the login page and sign in with the email and password you just created for the Store Owner to see their dedicated dashboard.

Signing Up as a Normal User
Any new visitor can become a Normal User.

On the Login page, click the "Sign Up" link.

Fill out the registration form and click "Sign Up".

You will be redirected to the login page where you can sign in with your new account.