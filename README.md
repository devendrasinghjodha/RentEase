# RentEase - Furniture & Appliance Rental Platform

RentEase is a full-stack web application designed to simplify the process of renting furniture and appliances. It provides a seamless experience for users to browse, rent, and manage their rented items, while offering robust tools for administrators to manage inventory, orders, and maintenance requests.

## 🚀 Features

- **User Authentication**: Secure signup and login using JSON Web Tokens (JWT).
- **Product Catalog**: Browse a wide range of furniture and appliances available for rent.
- **Shopping Cart**: Easily add and manage items in the cart before checkout.
- **Order Management**: Track past and current rental orders.
- **Maintenance Requests**: Submit and track maintenance or repair requests for rented items.
- **Admin Dashboard**: Comprehensive dashboard for admins to manage products, users, orders, and maintenance tasks.

## 🛠️ Technology Stack

- **Frontend**: React (with Vite), React Router DOM, Axios, Lucide React (Icons)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT, bcryptjs (password hashing)
- **Workspace**: npm workspaces (monorepo setup)

## 📦 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB instance (local or MongoDB Atlas)

### Installation

1. Clone the repository and navigate into the project directory.
2. Install dependencies for the root, client, and server:
   ```bash
   npm install
   ```

3. Environment Setup:
   - Navigate to the `server` directory.
   - Create a `.env` file using the provided `.env.example` as a template.
   - Configure your MongoDB connection string and JWT secret.

### Running the Application

You can run the frontend and backend from the root directory using the provided workspace scripts.

- **Start the Backend Server (Development)**
  ```bash
  npm run dev:server
  ```
  
- **Start the Frontend Application (Development)**
  ```bash
  npm run dev:client
  ```
  
- **Seed the Database (Optional)**
  To populate the database with sample products and an admin user:
  ```bash
  npm run seed
  ```

## 📂 Project Structure

- `/client` - React frontend application (Vite template).
- `/server` - Express backend API.
  - `/server/models` - Mongoose database schemas (User, Product, Order, Cart, Maintenance).
  - `/server/routes` - API endpoints and route handlers.
  - `/server/config` - Database connection and setup.
  - `/server/middleware` - Authentication and role-based access control.

## 📄 License

This project is licensed under the MIT License.
