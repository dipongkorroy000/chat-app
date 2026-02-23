## chat app - fullstack microservice architecture

this project is a **chat application** built with a microservice architecture.  
it uses **express.js** and **mongoose** on the backend, **rabbitmq** for service communication, **nodemailer** for email delivery, **socket.io** for real-time chat, and **next.js** for the frontend.

---

### 🛠 tech stack

- **backend**
  - **express.js** → web framework for building rest apis
  - **mongoose** → odm for mongodb, used to manage user data, chat messages, and otp storage
  - **rabbitmq** → message broker for communication between services
  - **nodemailer** → email sending library used in mail service
  - **socket.io** → real-time bidirectional communication for chat features

- **frontend**
  - **next.js** → react-based framework for building the client-side ui

---

### 🔗 services overview

- **user service**
  - handles user registration, login, authentication, and otp verification
  - publishes otp messages to rabbitmq

- **mail service**
  - listens to rabbitmq queues
  - sends otp emails to users using nodemailer

- **chat service**
  - manages real-time messaging between users using socket.io

- **gateway/api layer**
  - routes client requests to the appropriate backend service

---

### 🔐 login & otp flow (step by step)

#### 1. client → user service
- the client sends a login request with email and password
- user service verifies credentials using **mongoose** (mongodb)

#### 2. otp generation
- if credentials are valid, user service generates a one-time password (otp)
- otp is stored in the database (via mongoose) for later verification

#### 3. publish otp to rabbitmq
- user service publishes a message to rabbitmq
- message contains:
  - user’s email
  - generated otp
  - message type (e.g., `"send_otp"`)

#### 4. mail service → consume message
- mail service subscribes to rabbitmq queue
- when a message arrives, mail service consumes it and extracts the email + otp

#### 5. send email
- mail service uses **nodemailer** to send the otp to the user’s email

#### 6. user verification
- the user submits the otp via the client (next.js frontend)
- user service checks otp against the database:
  - if correct → issues jwt/session token and completes login
  - if incorrect → returns an error

---

### 💬 real-time chat flow with socket.io (step by step)

#### 1. client connection
- the next.js frontend connects to the chat service via socket.io
- a persistent websocket connection is established

#### 2. authentication
- the client provides a valid jwt/session token
- chat service verifies the token before allowing the connection

#### 3. joining rooms
- each chat conversation or user is mapped to a socket.io room
- example: `socket.join("roomid")`
- this ensures messages are broadcast only to participants in the same room

#### 4. sending a message
- client emits a `message` event with message data
- chat service receives the event
- message is saved in mongodb using mongoose
- chat service broadcasts the message to all clients in the room

#### 5. receiving a message
- clients listening to the `message` event instantly receive the new message
- ui updates in real time without page reload

#### 6. disconnect
- when a client disconnects, socket.io triggers the `disconnect` event
- chat service cleans up resources or updates user presence

---

### 📊 benefits of rabbitmq + socket.io

- **rabbitmq**
  - decouples services (user ↔ mail)
  - ensures reliable otp delivery
  - enables scaling of mail service workers

- **socket.io**
  - provides instant, real-time communication for chat
  - supports rooms for private or group conversations
  - handles multiple concurrent connections efficiently
  - enables event-driven features like typing indicators and presence tracking

---

### ✅ summary

- **user service** generates otp and publishes it to rabbitmq
- **mail service** consumes the message and sends otp via email using nodemailer
- **user service** verifies otp with mongodb (via mongoose)
- **frontend (next.js)** provides the ui for login, otp input, and chat features
- **chat service (socket.io)** enables real-time messaging between users with rooms and events

---

### 🚀 future improvements

- add sms service for otp delivery via phone
- implement push notifications for chat messages
- scale mail service workers for high-volume email sending
- enhance chat features with typing indicators, read receipts, and presence tracking
