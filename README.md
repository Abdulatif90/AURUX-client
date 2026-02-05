  Aurux-client – Frontend for Aurux.uz Real Estate Platform

  Project Overview
Aurux-client is the frontend of  Aurux.uz , a comprehensive real estate platform connecting Users, Agents, and Admins.  
It allows users to explore, filter, and interact with properties, agents, and community features in real-time.  
Admins manage content, users, and system efficiently.  

This frontend is built with  Next.js, React, Apollo Client , and Material-UI, designed for scalability, performance, and maintainability.

---

  Tech Stack

 Frameworks & Libraries 
-  Next.js 14.x  – server-side rendering, routing, and performance optimizations  
-  React 18.x  – component-based UI  
-  Apollo Client  – GraphQL queries, mutations, and caching  
-  Material-UI (MUI)  – UI components & design system  
-  TypeScript  – type safety and maintainability  
-  Sass / SCSS  – styling  
-  Valtio  – lightweight state management  
-  Swiper, Chart.js, SweetAlert2  – interactive UX components  
-  i18next, next-i18next  – multilingual support  
-  Socket.io / subscriptions-transport-ws  – real-time subscriptions  
-  Three.js, react-three/fiber  – 3D visualizations  

 Dev & Tools 
- ESLint / Prettier – code quality  
- Nodemon – development server hot reload  
- Standard Version – versioning  
- Yarn / NPM  

---

 
  Main Features

-  Authentication & Authorization 
  - JWT-based auth and role-based access  
-  Property Management 
  - Browse, filter, like, follow properties  
  - Advanced filters: category, price, location, size, rooms  
-  Community & Social Features 
  - Comment, like, follow users  
  - Event boards, news, notifications  
-  Agent Management 
  - Agent profile pages, property management, follow/follower interactions  
-  Admin Panel 
  - Manage users, agents, properties, comments  
-  Real-Time Features 
  - Chat & live notifications using WebSockets  
-  Interactive Components 
  - Charts, sliders, and dynamic UI elements with Chart.js, Swiper, and Three.js  
-  Multilingual Support 
  - i18next + next-i18next for full language support  
-  Responsive Design 
  - Mobile-first approach with SCSS and MUI customization  

---

  Data Flow & Architecture

   1️⃣ GraphQL Queries & Mutations
Component → Apollo Client → GraphQL Query/Mutation → Backend → Cache
- Apollo Client caches queries to reduce network requests  
- Optimistic updates for likes, follows, and chat  
- Global state managed via `store.ts` + Valtio for reactivity  

   2️⃣ Real-Time Communication
Chat Component → WebSocket → Backend → Recipient Component
- Efficient 1:1 chat  
- Ready for scalable multi-user environment  

   3️⃣ Component Architecture
- Feature-based component organization  
- Reusable UI components (`libs/components/`)  
- Modular hooks & utilities for consistent behavior  
- Enums & types enforce type safety and reduce errors  

---

  Key Decisions

| Decision | Reason |
|----------|--------|
| Next.js | SSR, routing, performance optimizations |
| Apollo Client | Centralized data fetching, caching, and state management |
| Material-UI | Consistent, responsive design system |
| Valtio + Apollo Cache | Lightweight global state + GraphQL caching |
| Feature-based folder structure | Scalability and maintainability |
| Three.js / react-three/fiber | 3D visualizations for property previews |
| Socket.io | Real-time chat & notifications |

---

  Deployment & Infrastructure

- Dockerized frontend (if used in production)  
- PM2 for process management (optional for SSR)  
- Nginx as reverse proxy  
- Firewall configuration for production security  
- Ready for high-traffic and scalable environments  

---

  Future Improvements

- Server-side caching for high-traffic GraphQL queries  
- Infinite scroll & pagination for property listings  
- Enhanced offline support & PWA capabilities  
- Automated testing coverage (Jest + React Testing Library)  
- Performance monitoring & logging (Sentry, LogRocket)
