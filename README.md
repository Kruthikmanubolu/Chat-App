# Chat-App - A Real-Time Full-Stack Chat Application

This is a feature-rich, full-stack real-time chat application built with the latest web technologies. It's designed to provide a seamless, dynamic, and engaging user experience, complete with direct messaging, group chats, audio/video calls, and file sharing.

This project was developed as a hands-on learning experience, leveraging a modern stack to build a complex, production-ready application.

## 🚀 Live Demo

Check out the live deployment here: **[Your Live Demo URL]**

## 📸 Screenshots

*(Recommended: Add a GIF or a few high-quality screenshots of your application. Show off the chat interface, the video call feature, and the dark mode!)*

| Chat Interface | Video Call |
| :---: | :---: |
| ![Chat Interface](https://via.placeholder.com/400x300.png?text=Chat+Interface+Screenshot) | ![Video Call](https://via.placeholder.com/400x300.png?text=Video+Call+Screenshot) |

---

## ✨ Features

This application is packed with features that enable a modern and complete chat experience:

* **Real-Time Messaging:** Send and receive messages instantly in one-on-one or group chats using **Convex**.
* **Authentication:** Secure user login, registration, and management with **Clerk**.
* **Audio & Video Calls:** **LiveKit** integration for high-quality, real-time video and audio communication.
* **File Uploads:** Seamlessly share images, videos, and other files using **Uploadthing**.
* **Friend System:** Easily add and remove friends to manage your conversations.
* **Group Chats:** Create and manage group conversations with multiple participants.
* **Real-Time Notifications:** Stay updated on new messages and friend requests (even when the app is in the background).
* **Dark Mode:** Beautiful, theme-aware UI built with **Shadcn/UI** and Tailwind CSS.
* **Responsive Design:** Fully functional and great-looking on all devices, from mobile to desktop.
* **Emoji Picker:** Add expression to your messages with a built-in emoji picker.
* **Progressive Web App (PWA):** Installable on desktop, iOS, and Android for a native-like experience.

---

## 🛠️ Tech Stack

This project was built using a modern, type-safe, and scalable tech stack:

* **Framework:** **Next.js 14** (with App Router)
* **Programming Language:** **TypeScript**
* **Styling:** **Tailwind CSS**
* **UI Components:** **Shadcn/UI**
* **Database:** **Convex** (Real-time serverless database)
* **Authentication:** **Clerk**
* **Audio/Video:** **LiveKit**
* **File Storage:** **Uploadthing**
* **Deployment:** **Vercel**

---

## ⚡ Getting Started

Follow these instructions to get a local copy up and running for development and testing.

### Prerequisites

* **Node.js** (v18 or later)
* **npm** or **yarn**
* A **Clerk** account for authentication
* A **Convex** account for the database
* A **LiveKit** account for audio/video calls
* An **Uploadthing** account for file uploads

### 1. Clone the Repository

```bash
git clone https://github.com/Kruthikmanubolu/Chat-App.git
cd Chat-App
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environmental Variables

#### Create a .env.local file in the root of your project and add the following environment variables. You can get these API keys and URLs from your respective service dashboards.

```bash
# Deployment used by `npx convex dev` # team: XXXXX, project: XXXX
CONVEX_DEPLOYMENT=XXXXXXX 

NEXT_PUBLIC_CONVEX_URL=XXXXXXX

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=XXXXXXX
CLERK_SECRET_KEY=XXXXXXX
CLERK_WEBHOOK_SECRET=XXXXXXX
CLERK_JWT_ISSUER_DOMAIN="XXXXXXX"
```

### 4. Run the Convex Backend

#### In a separate terminal, run the Convex development server. This will sync your database schema (defined in the convex/ directory) with the Convex dashboard.

```bash
npx convex dev
```

### 5. Run the Development Server

#### In your main terminal, run the Next.js development server:

```bash
npm run dev
```

#### Open http://localhost:3000 in your browser to see the result.





