 Aurux.uz – Real Estate Platform

Project Overview
Aurux.uz is a scalable real estate platform connecting Users, Agents, and Admins.  
It allows users to explore, filter, and interact with properties, agents, and community events in real-time.  
Admins manage content, users, and system operations efficiently.  

This project is designed to handle high traffic, real-time interactions, and role-based access with modular architecture.

---
Tech Stack

Frontend
- Next.js (14.x) – server-side rendering & routing
- React (18.x)
- Apollo Client + GraphQL – efficient data fetching and caching
- Material-UI (MUI) – component library
- Chart.js – analytics
- Swiper, SweetAlert2, react-spring – UX enhancements
- TypeScript – type safety
- Sass / SCSS – styling

Backend
- NestJS – modular architecture & GraphQL server
- GraphQL – flexible querying
- MongoDB + Mongoose – database & schema management
- JWT – authentication
- WebSocket (Socket.io) – real-time messaging

Infra / Deployment
- Docker – containerized deployment
- Nginx – reverse proxy
- PM2 – process management
- Firewall – security

Dev Tools
- ESLint / Prettier – code quality
- Nodemon – development server auto-reload
- Standard Version – versioning
- TypeScript



Folder Structure (Frontend)

aurux-client/
├─ apollo/
│ ├─ admin/
│ ├─ user/
│ ├─ client.ts # Apollo client setup
│ └─ store.ts # global state / cache
├─ libs/
│ ├─ auth/ # authentication utilities
│ ├─ components/ # reusable UI components
│ ├─ enums/
│ ├─ hooks/
│ ├─ types/
│ ├─ config.ts # project configuration
│ ├─ sweetalert.ts
│ └─ utils/
├─ pages/
│ ├─ _admin/ # admin dashboard
│ ├─ about/
│ ├─ account/
│ ├─ commit/
│ ├─ agent/
│ ├─ community/
│ ├─ member/
│ ├─ mypage/
│ ├─ property/
│ ├─ _app.tsx
│ ├─ _document.tsx
│ └─ index.tsx
├─ public/
├─ scss/
└─ package.json


---

Architecture Overview & Data Flow

1️⃣ Frontend → Backend
User Action → Next.js Page → Apollo Client → GraphQL Query/Mutation → NestJS Resolver → MongoDB

- Apollo cache stores frequently accessed property lists & user data
- Optimistic UI updates for likes, follows, and chat
- Role-based access: Admin vs Agent vs User

2️⃣ Real-Time Chat

User Message → Apollo Client → WebSocket → NestJS Gateway → Recipient Client
- 1:1 chat implemented for agents and users
- Handles multiple simultaneous connections
- Scalable for thousands of active users

 3️⃣ Admin Dashboard
- CRUD operations for properties, users, and agents
- GraphQL mutations with role-based access
- Analytics charts using Chart.js
- Secure & efficient data handling

---

Main Features

- Authentication & Authorization – JWT, role-based access
-  Property Management  – advanced multi-criteria filters (category, price, location, rooms)
-  Community & Events  – like, follow, comment
-  Agent Management  – add/edit properties, communicate with users
-  Real-Time Messaging  – Socket.io chat
-  Admin Panel  – user/product/agent management
-  Analytics  – property and user statistics
-  Responsive UI  – MUI + custom components
-  Multilingual support  – i18next

---

 Key Decisions & Trade-offs

| Decision | Reason |
|----------|--------|
| Next.js | SSR for SEO & performance; routing & static optimization |
| Apollo Client | GraphQL caching & state management; reduces network calls |
| WebSocket | Required real-time chat; scalable with NestJS gateways |
| Docker + Nginx + PM2 | Standardized deploy, reverse proxy & process management |
| Folder Structure | Feature-based structure for scalability & maintainability |

>  Trade-offs:   
> - Advanced filters handled client-side + GraphQL queries for performance  
> - Some caching handled in Apollo for speed, server-side caching deferred for future scaling  
> - Real-time chat optimized for 1:1; group chat is future enhancement

---

 Challenges

-  Advanced Filtering:  Optimizing GraphQL queries for multiple filter criteria  
-  Real-Time Messaging:  Managing multiple connections efficiently  
-  State Management:  Deciding between local state vs Apollo cache for various components  
-  Deployment:  Securing Docker containers & Nginx configuration with firewall rules

---

  Deployment

- Dockerized Next.js frontend & NestJS backend  
- PM2 for process management  
- Nginx as reverse proxy for frontend  
- Firewall configured for security  
- Ready for horizontal scaling

---

  Future Improvements

- Implement server-side caching (Redis) for high-traffic queries  
- Pagination and infinite scroll for property listings  
- Group chat support & message history optimization  
- UI/UX enhancements (loading skeletons, empty states)  
- Automated frontend & backend testing








