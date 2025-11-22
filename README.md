
# Task Poster
**Platforms:** Android (Expo / React Native), potentially iOS in the future  
**Framework:** React Native with Expo Router  
**Database / Backend:** Firebase (Auth, Firestore)  

---

## Project Overview

**Task Poster** is a mobile task/job marketplace where users can post tasks they want done and other users can accept or complete those tasks in exchange for payment. The app tracks ratings, reviews, wallet balances, and provides admin functionality for user management.

---

## App Purpose

- Users can post tasks/jobs.  
- Other users can browse tasks and accept jobs.  
- Ratings and reviews are tracked for users.  
- Wallet balances and transactions are maintained.  
- Admins can manage users, verify accounts, and delete users.  

---

## Features

- Posting and accepting jobs  
- Ratings & reviews after work completion  
- Wallet & transaction management  
- Admin panel to manage users (verification & deletion)  
- Skill/progress tracking of users (accepted/posted tasks)  
- Notifications for job acceptance and other actions  

---

## Firebase Integration

### Authentication
- Firebase Authentication for sign-up/sign-in  
- Login persistence using `AsyncStorage`  

### Firestore Database Schema

The app uses several collections in Firestore:

#### 1. `admins`
Stores admin users.

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Admin user ID |
| `role` | string | `"admin"` |

#### 2. `users`
Stores all user profiles.

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | User ID |
| `fullName` | string | Full name of the user |
| `email` | string | Email address |
| `phone` | string | Phone number |
| `nid` | string | National ID |
| `postedWorks` | array | List of posted tasks |
| `rating` | number | Average rating |
| `verified` | boolean | Verification status |
| `createdAt` | timestamp | Account creation time |

#### 3. `worked`
Stores tasks/jobs posted by users.

| Field | Type | Description |
|-------|------|-------------|
| `workId` | string | Unique work/task ID |
| `userId` | string | ID of the user who posted the task |
| `acceptedBy` | string | User ID of the person accepting the work |
| `jobTitle` | string | Task/job title |
| `description` | string | Task description |
| `category` | string | Task category |
| `location` | string | Task location |
| `price` | number | Task price |
| `status` | string | `"pending"`, `"accepted"`, `"completed"` |
| `startDate` | timestamp | Task start date |
| `endDate` | timestamp | Task end date |
| `acceptedAt` | timestamp | When task was accepted |
| `transactionId` | string | Payment/transaction reference |
| `images` | array | Optional task images |

#### 4. `complains`
Stores user complaints.

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Complaint title |
| `details` | string | Complaint description |
| `fromUserId` | string | User ID of complainant |
| `toUser` | string | Recipient or target of complaint |
| `status` | string | `"pending"`, `"resolved"` |
| `createdAt` | timestamp | Complaint creation time |

#### 5. `notifications`
Stores notifications related to jobs, acceptance, or other app events.

| Field | Type | Description |
|-------|------|-------------|
| `notificationId` | string | Unique notification ID |
| `toUserId` | string | Recipient user ID |
| `fromUserId` | string | Sender user ID |
| `message` | string | Notification message |
| `type` | string | e.g., `"accepted_sent"` |
| `workId` | string | Related task/work ID |
| `read` | boolean | Whether the notification is read |
| `createdAt` | timestamp | Notification creation time |

---

## Wallet & Transactions

- Each user has a wallet balance stored in Firestore.  
- Transactions are stored as a subcollection under each user.  

---

## Core Screens / Components

| Screen             | Purpose                 | Key Features                                   |
| ------------------ | ----------------------- | ---------------------------------------------- |
| `Index`            | Welcome screen          | Start button navigates to login                |
| `Login / Register` | Auth screens            | Firebase Auth login/signup                     |
| `Home / Tabs`      | Main app navigation     | Access tasks, wallet, profile                  |
| `RatingScreen`     | Rate a user after work  | Submit rating & review, updates Firestore      |
| `ViewUserScreen`   | View user profile       | Shows rating, works, skill progress           |
| `WalletScreen`     | Wallet and transactions | Shows balance and transaction list            |
| `WorkDetails`      | Detailed task view      | Accept work, updates Firestore & notifications|
| `ShowAllUsers`     | Admin screen            | Lists all users, toggle verified, delete user |

---

## UI / Design

- **Theme:** Aqua Gradient Modern / BlueMint Modern  
- **Primary Gradient:** `#3B7CF5 → #5AD9D5`  
- **Background Color:** `#E6F2FF`  
- **Header Gradient:** `#4A8FF0 → #65D4C9`  
- **Text Colors:** Title `#FFFFFF`, Subtitle `#F0F0F0`  
- **Card Style:** Rounded corners (`borderRadius: 20`), soft shadows, gradient emphasis  
- **UI/UX Feel:** Polished, modern, light, rounded, and readable  

---

## Admin Features

Admins can:  
- Verify/unverify users  
- Delete users  

Non-admin users can only see verified status.

---

## App Flow

1. User opens app → sees welcome screen → navigates to login  
2. After login, user accesses tabs:  
   - Browse jobs → see details → accept work  
   - Complete work → rate user  
   - Wallet → view balance & transactions  
3. Admins can access all users → verify or delete users  
4. Ratings, accepted/posted works, and skills are tracked  
5. Notifications are stored in Firestore (no push notifications yet)  

---

## Installation

1. Clone the repo:

```bash
git clone https://github.com/MasudRanaMushfiq/Task_Poster_App.git
cd Task_Poster_App
```

2. Install dependencies:
`npm install # or yarn install`

3. Start Expo:
`npm run start # or expo start`

---

## License

This project is private. For contributions or usage, please contact with me.

---

**Developed by Masud Rana Mushfiq**



