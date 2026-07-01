# Aurux — Real Estate Platform (Frontend)

A full-featured real estate web application built with **Next.js 14**, **TypeScript**, and **Apollo GraphQL**. Users can browse, filter, and interact with property listings; agents can manage their portfolios; and admins can moderate all content through a dedicated dashboard.

---

## Features

### Property Marketplace
- **Advanced property search** — filter by location, type (Apartment / Villa / House), price range, area (m²), rooms, beds, and rent/barter options
- **Trending, Popular, and Top Properties** — curated homepage sections based on likes, views, and rank scores
- **Property detail page** — full image gallery (Swiper), agent info, related listings, comment section
- **Like / Favorite** — authenticated users can like properties and save them to a favorites list
- **View tracking** — property view counts updated on every visit

### Agent Directory
- **Agent listing** with sorting and search
- **Agent profile page** — listed properties, follower count, contact info
- **Like agents** — support and follow your preferred agents

### Community Board
- **4 categories**: Free, Recommend, News, Humor
- **Rich text editor** (Toast UI Editor) — write formatted articles with color syntax and merged table plugins
- **Article detail** — view, like, comment, and reply on articles
- **Edit / Delete** — authors can manage their own articles

### User System
- **Authentication**: Sign Up / Login / Logout via Phone, Email, or Telegram OAuth
- **JWT tokens** — stored in cookies, auto-managed with `apollo-link-token-refresh`
- **My Page dashboard**:
  - My Properties (full CRUD with image upload)
  - My Articles
  - My Favorites
  - Recently Visited
  - Followers & Followings
  - Profile editor (avatar upload, bio, contact info)
- **Member profile pages** — view any member's properties, articles, and social stats

### Real-time Chat
- WebSocket-based live chat powered by Apollo subscriptions
- Intelligent offline fallback with automated responses when backend is unavailable

### Customer Service
- FAQ, Notices, and Inquiry pages — all admin-managed content

### Admin Dashboard (`/_admin`)
- **Users** — view, block, and promote members
- **Properties** — moderate listing statuses (Active / Sold / Deleted)
- **Community** — manage all articles across categories
- **CS** — create and manage FAQs, Notices, and Inquiries

### Internationalization
- **3 languages**: English, Korean (한국어), Russian (Русский)
- Powered by `next-i18next`, locale preference stored in `localStorage`

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 14.2 |
| Language | TypeScript 6.0 |
| UI Library | Material UI v5 (MUI) |
| Styling | SASS / SCSS |
| Data Fetching | Apollo Client 3 + GraphQL |
| Real-time | Apollo Subscriptions over WebSocket |
| Global State | Apollo Reactive Variables |
| Auth | JWT + `apollo-link-token-refresh` |
| Rich Text Editor | Toast UI Editor v3 |
| Carousel | Swiper.js v8 |
| Image Upload | `apollo-upload-client` + `browser-image-compression` |
| Alerts | SweetAlert2 |
| Animations | Animate.css + React Spring |
| i18n | next-i18next (EN / KR / RU) |
| Linting | ESLint + Prettier |

---

## Project Structure

```
aurux-client/
├── apollo/
│   ├── client.ts              # Apollo Client (HTTP + WebSocket split link, JWT auth link)
│   ├── store.ts               # Reactive variables (userVar, socketVar)
│   └── user/
│       ├── query.ts           # All GraphQL queries
│       └── mutation.ts        # All GraphQL mutations
│
├── libs/
│   ├── components/
│   │   ├── layout/            # LayoutHome, LayoutBasic, LayoutFull (HOC wrappers)
│   │   ├── homepage/          # TrendProperties, PopularProperties, TopAgents, CommunityBoards…
│   │   ├── property/          # PropertyCard, Filter, Review
│   │   ├── community/         # TEditor (write), TViewer (read)
│   │   ├── mypage/            # MyProperties, MyArticles, MyFavorites, MyProfile, RecentlyVisited…
│   │   ├── member/            # MemberProperties, MemberFollowers, MemberMenu…
│   │   ├── admin/             # MemberList, PropertyList, CommunityArticleList, FaqList…
│   │   ├── common/            # AgentCard, CommunityCard, PropertyBigCard
│   │   ├── Top.tsx            # Navigation bar (JWT init, language switcher)
│   │   ├── Footer.tsx
│   │   └── Chat.tsx           # Live chat widget (WebSocket + smart fallback)
│   ├── enums/                 # PropertyType, MemberType, BoardArticleCategory…
│   ├── hooks/                 # useDeviceDetect, useAuthSync
│   ├── types/                 # TypeScript interfaces for all domain entities
│   └── auth.ts                # JWT decode + cookie helpers
│
├── pages/
│   ├── index.tsx              # Homepage
│   ├── property/
│   │   ├── index.tsx          # Property listing + advanced filter
│   │   └── detail.tsx         # Property detail + comments + related properties
│   ├── agent/
│   │   ├── index.tsx          # Agent listing
│   │   └── detail.tsx         # Agent detail
│   ├── community/
│   │   ├── index.tsx          # Community board (tabs by category)
│   │   └── detail.tsx         # Article detail + comments
│   ├── mypage/index.tsx       # Authenticated user dashboard
│   ├── member/index.tsx       # Public member profile
│   ├── about/index.tsx
│   ├── cs/index.tsx           # FAQ / Notice / Inquiry
│   ├── account/join.tsx       # Login & Register
│   └── _admin/                # Admin panel (users, properties, community, CS)
│
├── scss/                      # SASS stylesheets (separate pc/ and mobile/ trees)
├── public/                    # Static assets (icons, banners, images)
├── next.config.js
├── tsconfig.json
└── next-i18next.config.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Running instance of the Aurux API (GraphQL backend, default port **3005**)

### Installation

```bash
git clone https://github.com/your-username/aurux-client.git
cd aurux-client
npm install --legacy-peer-deps
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
REACT_APP_API_URL=http://localhost:3005
REACT_APP_API_GRAPHQL_URL=http://localhost:3005/graphql
REACT_APP_API_WS_URL=ws://localhost:3005/graphql
REACT_APP_API_WS=ws://localhost:3005/graphql
```

### Running

```bash
# Development
npm run dev

# Production
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000).

---

## Architecture Highlights

### Apollo Client — Fetch Policy Strategy
User-facing pages use `cache-and-network`: cached data renders instantly on navigation while a background refetch silently updates content. Admin pages use `network-only` to always display the most current state without stale cache interference.

### Component Memoization
All homepage section components (`TrendProperties`, `PopularProperties`, `TopAgents`, `CommunityBoards`, etc.) and their card children are wrapped with `React.memo`. Like handlers are stabilized with `useCallback` so Swiper list items never re-render on unrelated state changes.

### Code Splitting with `next/dynamic`
Heavy third-party components are lazily loaded:
- `TViewer` (Toast UI Viewer) — bundled only when visiting article detail pages
- `TEditor` (Toast UI Editor, ~500 KB) — bundled only on the article write page

### Three Layout HOCs
Pages are wrapped at export time with one of three Higher-Order Components:
- `withLayoutMain` — homepage layout (includes `HeaderFilter` search bar)
- `withLayoutBasic` — inner pages with hero banner and breadcrumb
- `withLayoutFull` — full-width layout for property detail

### Authentication Flow
1. User signs in → receives a JWT `accessToken` from the GraphQL API
2. Token is decoded with `jwt-decode` and stored in cookies via `js-cookie`
3. `userVar` (Apollo reactive variable) holds the parsed user object app-wide
4. Every GraphQL request automatically includes `Authorization: Bearer <token>` via the Apollo auth link

### Multi-role Access Control
Three member types enforced both on the frontend and backend:
- **USER** — browse, like, comment, follow, manage own profile and listings
- **AGENT** — all user permissions plus property listing management
- **ADMIN** — full access to the `/_admin` dashboard for content moderation

---

## API Overview

The client communicates exclusively via GraphQL:

| Domain | Key Operations |
|---|---|
| Members | `signup`, `login`, `updateMember`, `getAgents`, `getMember`, `likeTargetMember` |
| Properties | `getProperties`, `getProperty`, `createProperty`, `updateProperty`, `deleteProperty`, `likeTargetProperty` |
| Board Articles | `getBoardArticles`, `getBoardArticle`, `createBoardArticle`, `updateBoardArticle`, `likeTargetBoardArticle` |
| Comments | `getComments`, `createComment`, `updateComment` |
| Follows | `subscribe`, `unsubscribe`, `getMemberFollowers`, `getMemberFollowings` |
| Views | Automatically tracked on property and article visits |
| Admin | Scoped resolvers for full CRUD on all entities |

---

## Author

**Abdullatif Sharipov**  
Full Stack Developer  

Built as a portfolio project demonstrating production-level Next.js frontend architecture: GraphQL data layer, real-time features, multi-role access control, and performance-optimized rendering.
