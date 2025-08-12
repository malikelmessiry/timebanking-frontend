
# TimeBank (Front-End)

Frontend for our group project built with **React**, **TypeScript**, and **Vite**.

### 🤝 Team

* Dehui Hu
* Malik Elmessiry
* Mikaela Baluyot
* Natasha Gaye

---

## 🌐 Overview

The TimeBank app is the client-side of our service marketplace platform where users can exchange time-based services with one another.

It supports features such as:

- User sign-up and login with authentication
- Viewing and editing profiles
- Creating and booking services
- Browsing services through an interactive map

It connects to a Django backend via REST API:
* [TimeBank (Back-end) Repo](https://github.com/florasmile/timebanking-backend)

---

## 🛠️ Tech Stack

- **React** + **TypeScript**
- **Vite** (frontend build tool)
- **Axios** for HTTP requests
- **React Router** for navigation
- **Cloudinary** for image uploads
- **Vitest/React Testing Library** for UI tests

<details>
<summary>📦 Dependencies</summary>

```
leaflet ^1.9.4
react ^19.1.0
react-dom ^19.1.0
react-leaflet ^5.0.0
react-router-dom ^7.7.0
@eslint/js ^9.30.1
@testing-library/jest-dom ^6.6.4
@testing-library/react ^16.3.0
@types/leaflet ^1.9.20
@types/react ^19.1.8
@types/react-dom ^19.1.6
@types/testing-library__jest-dom ^5.14.9
@vitejs/plugin-react ^4.6.0
@vitest/ui ^3.2.4
eslint ^9.30.1
eslint-plugin-react-hooks ^5.2.0
eslint-plugin-react-refresh ^0.4.20
globals ^16.3.0
jsdom ^26.1.0
typescript ~5.8.3
typescript-eslint ^8.35.1
vite ^7.0.4
vitest ^3.2.4
```
</details>

---

## 🌍 Deployment

The frontend is deployed via **Render** and accessible at:

🔗 [TimeBank Live URL](https://timebanking-frontend.onrender.com)

---

## 🚀 Getting Started

1. **Clone the repo**:

```bash
git clone https://github.com/malikelmessiry/timebanking-frontend.git
cd timebanking-frontend
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

---


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


---

## 📌 Notes

* Environment variables are stored in `.env`

---

### Thank You! 🤝
