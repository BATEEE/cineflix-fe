# CineFlix Frontend Client

Welcome to the **CineFlix Frontend** repository! CineFlix is a premium, feature-rich movie and TV show streaming web platform. It delivers a gorgeous user interface with micro-interactions, dark mode aesthetics, and dedicated spaces for clients, movie production studios, and administrators.

Built on **React 19**, **TypeScript**, **Vite 8**, and powered by **Tailwind CSS v4**, this application boasts modular layouts, automated authentication interceptors, state persistence, and responsive interfaces.

---

## Technology Stack & Libraries

The CineFlix Frontend is engineered with a modern, high-performance web stack:

- **Core Framework**: [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) for robust type safety.
- **Build Tool**: [Vite 8](https://vite.dev/) for extremely fast Hot Module Replacement (HMR) and optimized build times.
- **Styling & UI**:
  - [Tailwind CSS v4](https://tailwindcss.com/) for high-performance utility-first styling.
  - [Lucide React](https://lucide.dev/) for clean, sleek vector icons.
  - [Radix UI](https://www.radix-ui.com/) & [Shadcn UI](https://ui.shadcn.com/) for accessible, headless primitive UI components.
  - [Swiper](https://swiperjs.com/) for fluid touch-responsive carousels/sliders.
- **State Management**: [Zustand 5](https://github.com/pmndrs/zustand) with localStorage persistence for user sessions.
- **Data Fetching & Cache**: [TanStack React Query v5](https://tanstack.com/query/latest) for efficient async server-state caching.
- **HTTP Client**: [Axios](https://axios-http.com/) configured with request/response interceptors to handle token attachment and automatic redirect on session expiration.
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) combined with [Zod](https://zod.dev/) schemas.
- **Visualizations**: [Recharts](https://recharts.org/) for studio revenue breakdowns and admin statistics.
- **Media Streaming**: [React Player](https://github.com/cookpete/react-player) for versatile video rendering.
- **Notifications**: [Sonner](https://react-hot-toast.com/) for modern, smooth toast messages.

---

## Key Features & Portals

CineFlix separates logic and permissions into three main dashboards:

### 1. Client / Viewer Portal (`/`)

- **Immersive Homepage**: Promoted hero banner with dynamic trailer preview and horizontal carousels sorted by trending, newest, and top-rated categories.
- **Content Catalog**: Filterable **Movies** and **TV Shows** libraries, as well as an **Explore** page with multi-criteria search.
- **Detailed View & Streaming**: Showcases movie descriptions, ratings, cast lists, trailers, episode selectors, and recommendations. Includes a comment section with live reviews.
- **Premium VIP Upgrades**:
  - **MoMo E-Wallet**: Direct MoMo checkout and callback handling page (`/momo-callback`).
  - **VietQR Invoice Gateway**: Generates dynamic QR codes for manual bank transfer invoice payments.
- **User Workspace**: Manage bookmarks, watch history, profile pictures (avatar upload), and settings.

### 2. Studio Partner Portal (`/studio`)

Designed for production companies and movie publishers (Studio owners) to distribute their catalog:

- **Revenue Dashboard**: Interactive charts displaying subscription splits, monthly payouts, and earnings summaries.
- **Movie Submission**: Modals to add/edit movies, upload posters/backdrops, and configure genres.
- **Episode & Trailer Uploader**: Dynamic multi-file upload controls for movie episodes, trailers, and stream sources.
- **User Feedback Board**: View comments and feedback left on the studio's movies to engage with the audience.

### 3. Admin Management Console (`/admin`)

An advanced management panel for system administrators:

- **System Metrics**: Quick overview of site traffic, new users, and total subscription income.
- **Partner Curation**: Review, approve, or suspend Studio applications.
- **Catalog Control**: Edit and publish movie metadata, verify content, and toggle visibility.
- **Episodes & Tracks Manager**: Structured 2-column interface featuring paginated movie lists (5 movies/page) to easily inspect and add episodes.
- **Ledger Audits**: Track payment history, verify VIP package subscription transactions, and confirm invoice states.
- **Comment Moderation**: Review and flag toxic or spam comments across the entire site.

---

## Folder Structure

```bash
src/
├── api/             # Axios client configuration and middleware/interceptors
├── assets/          # Static assets (images, logos)
├── components/      # Shared components (Navbar, Footer, VideoPlayer, Modals)
│   └── ui/          # Radix UI primitives / Custom styled UI components
├── features/        # Feature-based logic and hooks
├── layouts/         # Structural wrappers (MainLayout, AdminLayout, StudioLayout)
├── lib/             # Helper utilities (cn tailwind merge, etc.)
├── pages/           # Pages divided by domain/roles
│   ├── client/      # Public streaming and profile pages
│   ├── studio/      # Publisher dashboard pages and upload modals
│   ├── admin/       # Administrator panels (Users, Movies, Transactions)
│   └── auth/        # Login, signup, and portal registration screens
├── router/          # Client-side routes (using React Router v7 createBrowserRouter)
├── services/        # Clean API services mapped to backend controllers
├── stores/          # Zustand global stores (e.g. authStore.ts)
├── types/           # TypeScript definitions and interfaces
├── App.tsx          # Main App shell
└── main.tsx         # Application entry point
```

---

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (recommended version >= 18).

### Installation

1.  **Clone the project** and navigate to the frontend directory:

    ```bash
    cd frontend/cineflix-fe
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root of the `cineflix-fe` folder. You can duplicate `.env.example` and customize it:

    ```env
    VITE_BANK_ID=VCB
    VITE_BANK_ACCOUNT_NO=1234567890
    VITE_BANK_ACCOUNT_NAME=CINEFLIX
    ```

4.  **Backend Integration**:
    By default, the HTTP client points to `http://localhost:5063` (specified in [axiosClient.ts](src/api/axiosClient.ts)). Ensure your backend application is up and running on this port, or adjust the `baseURL` in:
    [axiosClient.ts](src/api/axiosClient.ts)

### Running Locally

To launch the project in development mode:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173` (or the port specified in the console output).

### Building for Production

To compile production-ready assets into the `dist/` directory:

```bash
npm run build
```

To test the production build locally:

```bash
npm run preview
```

---

## Authentication & Authorization

Permissions are enforced on the client side using:

- [ProtectedRoute.tsx](src/components/ProtectedRoute.tsx) which decodes permissions and roles from the authentication token.
- **Role Mapping**:
  - `1` - Administrator (`/admin`)
  - `2` - Viewer / Client (`/`)
  - `3` - Studio Owner / Partner (`/studio`)
