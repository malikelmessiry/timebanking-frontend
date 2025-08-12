
# TimeBanking (Front-End)

Frontend for our group project built with **React**, **TypeScript**, and **Vite**.

## 🌐 Overview

This app is the client-side of our service marketplace platform where users can exchange time-based services with one another.

It supports features such as:

- User sign-up and log-in with authentication
- Viewing and editing profiles
- Creating and booking services
- Browsing services via an interactive map

It connects to a Django backend via REST API:
* [Community TimeBanking (Backend) Repo](https://github.com/florasmile/timebanking-backend)

## 🛠️ Tech Stack

- **React** + **TypeScript**
- **Vite** (frontend build tool)
- **Axios** for HTTP requests
- **React Router** for navigation
- **Cloudinary** for image uploads
- **Jest/React Testing Library** for UI tests

## 🚀 Getting Started

1. **Clone the repo**:

```bash
git clone https://github.com/malikelmessiry/timebanking-frontend.git
````

2. **Install dependencies**:

```bash
npm install
```

3. **Start the development server**:

```bash
npm run dev
```

4. **Run UI tests** (if applicable):

```bash
npm run test
```

## 📁 Folder Structure

```
src/
├── assets/         # Images and static files
├── components/     # Reusable UI components
├── pages/          # Page-level components
├── services/       # API requests
├── App.tsx         # Main app component
└── main.tsx        # Entry point
```

## 🌍 Deployment

The frontend is deployed via **Render** and accessible at:

🔗 [Live URL](https://timebanking-frontend.onrender.com)

---

## 🤝 Team

* Dehui Hu
* Malik Elmessiry
* Mikaela Baluyot
* Natasha Gaye


---

## 📌 Notes

* Environment variables are stored in `.env`.
