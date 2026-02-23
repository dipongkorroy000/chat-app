# Chat App - Fullstack Microservice Architecture

This project is a **chat application** built with a microservice architecture.  
It uses **Express.js** and **Mongoose** on the backend, **RabbitMQ** for service communication, **Nodemailer** for email delivery, **Socket.IO** for real-time chat, and **Next.js** for the frontend.

---

## 🛠 Tech Stack

- **Backend**
  - **Express.js** → Web framework for building REST APIs.
  - **Mongoose** → ODM for MongoDB, used to manage user data, chat messages, and OTP storage.
  - **RabbitMQ** → Message broker for communication between services.
  - **Nodemailer** → Email sending library used in Mail Service.
  - **Socket.IO** → Real-time bidirectional communication for chat features.

- **Frontend**
  - **Next.js** → React-based framework for building the client-side UI.

---

## 🔗 Services Overview

- **User Service**
  - Handles user registration, login, authentication, and OTP verification.
  - Publishes OTP messages to RabbitMQ.

- **Mail Service**
  - Listens to RabbitMQ queues.
  - Sends OTP emails to users using Nodemailer.

- **Chat Service**
  - Manages real-time messaging between users using Socket.IO.

- **Gateway/API Layer**
  - Routes client requests to the appropriate backend service.

---

## 🔐 Login & OTP Flow (Step by Step)

### 1. Client → User Service
- The client sends a login request with email and password.
- User Service verifies credentials using **Mongoose** (MongoDB).

### 2. OTP Generation
- If credentials are valid, User Service generates a One-Time Password (OTP).
- OTP is stored in the database (via Mongoose) for later verification.

### 3. Publish OTP to RabbitMQ
- User Service publishes a message to RabbitMQ.
- Message contains:
  - User’s email
  - Generated OTP
  - Message type (e.g., `"SEND_OTP"`)

### 4. Mail Service → Consume Message
- Mail Service subscribes to RabbitMQ queue.
- When a message arrives, Mail Service consumes it and extracts the email + OTP.

### 5. Send Email
- Mail Service uses **Nodemailer** to send the OTP to the user’s email.

### 6. User Verification
- The user submits the OTP via the client (Next.js frontend).
- User Service checks OTP against the database:
  - If correct → Issues JWT/Session token and completes login.
  - If incorrect → Returns an error.

---

## 💬 Real-Time Chat Flow with Socket.IO

### 1. Client Connection
- The Next.js frontend connects to the Chat Service via Socket.IO.

### 2. Authentication
- The client provides a valid JWT/session token to establish a secure socket connection.

### 3. Message Exchange
- When a user sends a message:
  - The message is stored in MongoDB (via Mongoose).
  - Socket.IO broadcasts the message to the recipient(s) in real time.

### 4. Event Handling
- Typical Socket.IO events:
  - `connection` → Establish socket connection.
  - `message` → Send/receive chat messages.
  - `disconnect` → Handle user disconnection.

---

## 📊 Benefits of RabbitMQ + Socket.IO

- **RabbitMQ**
  - Decouples services (User ↔ Mail).
  - Ensures reliable OTP delivery.
  - Enables scaling of Mail Service workers.

- **Socket.IO**
  - Provides instant, real-time communication for chat.
  - Handles multiple concurrent connections efficiently.
  - Supports event-driven architecture for messaging.

---

## 🔎 Flow Diagram


---

## ✅ Summary

- **User Service** generates OTP and publishes it to RabbitMQ.
- **Mail Service** consumes the message and sends OTP via email using Nodemailer.
- **User Service** verifies OTP with MongoDB (via Mongoose).
- **Frontend (Next.js)** provides the UI for login, OTP input, and chat features.
- **Chat Service (Socket.IO)** enables real-time messaging between users.

---

## 🚀 Future Improvements

- Add SMS Service for OTP delivery via phone.
- Implement push notifications for chat messages.
- Scale Mail Service workers for high-volume email sending.
- Enhance chat features with typing indicators, read receipts, and presence tracking.
