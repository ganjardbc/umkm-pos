# 🚀 UMKM-POS App
Frontend application for **UMKM-POS** — a SaaS Point of Sale (POS) system for UMKM tourism businesses.

This is the client-facing application that consumes the UMKM-POS API, providing both POS terminal functionality and merchant dashboard capabilities.

---

## 🎯 App Scope & Features

### Core POS Terminal Features
- **Transaction Processing**
  - Create and commit transactions
  - Add/remove transaction items
  - Real-time stock validation
  - Price snapshot display
  - Transaction history & void capability

- **Product Management**
  - Browse products by category
  - Search products
  - View stock levels
  - Quick add to cart

- **Shift Management**
  - Start/end shifts
  - View shift transactions
  - Shift summary reports

- **Stock Management**
  - View current stock levels
  - Stock adjustment interface
  - Stock audit log viewer
  - Low stock alerts

### Merchant Dashboard Features
- **Business Overview**
  - Daily sales summary
  - Revenue metrics
  - Transaction count
  - Top products

- **Outlet Management**
  - Multi-outlet view
  - Outlet-specific reports
  - Outlet settings

- **User & Access Control**
  - User management (create/edit/deactivate)
  - Role assignment per outlet
  - Permission management
  - Activity logs

- **Reports & Analytics**
  - Daily reports
  - Sales by product
  - Sales by outlet
  - Revenue trends
  - Stock movement history

- **Settings**
  - Merchant profile
  - Outlet configuration
  - User roles & permissions
  - API integration settings

### Offline Support
- Offline transaction queue
- Sync when connection restored
- Conflict resolution
- Sync status indicator

---

## 🏗 Tech Stack

- **Framework:** Vue 3 (^3.5.18)
- **Build Tool:** Vite (^7.1.2)
- **Language:** TypeScript (~5.8.3)
- **Routing:** Vue Router (^4.5.1)
- **State Management:** Pinia (^3.0.3)
- **UI Framework:** PrimeVue (^4.3.7) + Tailwind CSS (^4.1.12)
- **UI Components:** PrimeUI (^1.2.3) + Tailwind CSS PrimeUI (^0.6.1)
- **Icons:** PrimeIcons (^7.0.0)
- **HTTP Client:** Axios (^1.11.0)
- **Charts:** Chart.js (^4.5.0)
- **Validation:** Zod (^4.1.3)
- **Date Handling:** Day.js (^1.11.18)
- **Code Generation:** Hygen (^6.2.11) - for module scaffolding
- **Component Auto-import:** unplugin-vue-components (^29.0.0)
- **CSS:** Tailwind CSS (^4.1.12) + PostCSS (^8.5.6)

---

## 📱 App Structure (Feature-Based Architecture)

```
src/
├── assets/                  # Static assets
│   └── styles/
├── components/              # Global reusable UI components
│   ├── Ui*.vue             # UI primitives (Card, Button, etc.)
│   └── Sample*.vue         # Example components
├── core/                    # Core initialization
│   ├── global-components.ts # Register global components
│   ├── global-routes.ts     # Route registration
│   ├── global-styles.ts     # Global styles
│   └── initiate.ts          # App initialization
├── helpers/                 # Global utility functions
│   ├── auth.ts             # Auth helpers
│   ├── toast.ts            # Toast notifications
│   └── utils.ts            # General utilities
├── layouts/                 # Layout templates
│   ├── auth.vue            # Auth layout
│   └── default.vue         # Default layout
├── modules/                 # Feature modules (feature-based)
│   ├── auth/
│   │   ├── pages/          # Auth pages
│   │   ├── router/         # Auth routes
│   │   ├── services/       # Auth API services
│   │   ├── stores/         # Pinia stores (state, actions, getters)
│   │   ├── styles/         # Module-specific styles
│   │   └── README.md
│   ├── dashboard/
│   │   ├── components/     # Dashboard-specific components
│   │   ├── helpers/        # Dashboard composables
│   │   ├── pages/          # Dashboard pages
│   │   ├── router/         # Dashboard routes
│   │   ├── services/       # Dashboard API services
│   │   ├── stores/         # Pinia stores
│   │   └── README.md
│   ├── pos/                # POS terminal module (to be created)
│   │   ├── components/
│   │   ├── pages/
│   │   ├── router/
│   │   ├── services/
│   │   ├── stores/
│   │   └── README.md
│   ├── transactions/       # Transaction management (to be created)
│   │   ├── components/
│   │   ├── pages/
│   │   ├── router/
│   │   ├── services/
│   │   ├── stores/
│   │   └── README.md
│   ├── products/           # Product management (to be created)
│   │   ├── components/
│   │   ├── pages/
│   │   ├── router/
│   │   ├── services/
│   │   ├── stores/
│   │   └── README.md
│   ├── reports/            # Reports & analytics (to be created)
│   │   ├── components/
│   │   ├── pages/
│   │   ├── router/
│   │   ├── services/
│   │   ├── stores/
│   │   └── README.md
│   ├── users/              # User management (to be created)
│   │   ├── components/
│   │   ├── pages/
│   │   ├── router/
│   │   ├── services/
│   │   ├── stores/
│   │   └── README.md
│   ├── outlets/            # Outlet management (to be created)
│   │   ├── components/
│   │   ├── pages/
│   │   ├── router/
│   │   ├── services/
│   │   ├── stores/
│   │   └── README.md
│   ├── error/              # Error pages
│   │   ├── pages/
│   │   └── router/
│   ├── landing/            # Landing page
│   │   ├── pages/
│   │   ├── router/
│   │   └── services/
│   └── settings/           # Settings module
│       ├── components/
│       ├── pages/
│       ├── router/
│       ├── services/
│       ├── stores/
│       └── README.md
├── plugins/                 # Vue plugins
│   └── axios.ts            # Axios configuration
├── services/               # Global services
│   ├── menus.ts            # Menu configuration
│   └── permissions.ts      # Permission service
├── App.vue                 # Root component
└── main.ts                 # Entry point
```

### Module Structure Pattern

Each feature module follows this consistent structure:

```
modules/[feature-name]/
├── pages/                  # Page components (routable)
├── components/             # Feature-specific components
├── router/                 # Route definitions
├── services/               # API services & constants
├── stores/                 # Pinia store (state, actions, getters)
├── helpers/                # Composables & utilities (optional)
├── styles/                 # Module-specific styles (optional)
└── README.md              # Module documentation
```

---

## 🔐 Authentication & Authorization

- JWT token-based auth (managed in `auth` module)
- Login with email/password
- Token stored in secure storage
- Auto-logout on token expiry
- Permission-based UI rendering (via `services/permissions.ts`)
- Route guards for protected pages
- Permission decorator support

---

## 🛒 POS Terminal Workflow (pos module)

1. **Start Shift** (optional)
2. **Browse Products** → Search/Filter
3. **Add to Cart** → Quantity + Price validation
4. **Review Cart** → Edit items, apply discounts
5. **Checkout** → Select payment method
6. **Confirm Transaction** → Stock deduction
7. **Print Receipt** (optional)
8. **Transaction Complete** → Show summary

---

## 📊 Dashboard Workflow (dashboard module)

1. **Login** → Merchant dashboard
2. **View Overview** → Sales metrics, top products
3. **Navigate Modules:**
   - **Transactions** → View/void transactions
   - **Products** → Manage inventory
   - **Reports** → Analytics & trends
   - **Users** → Manage team
   - **Outlets** → Multi-outlet management
   - **Settings** → Configuration

---

## 🔄 Offline Sync Strategy

- **Queue Management:** Store failed transactions locally (managed in dedicated module)
- **Sync Trigger:** Manual sync button + auto-sync on connection
- **Conflict Resolution:** Server-authoritative (server wins)
- **Status Indicator:** Show sync status in UI
- **Retry Logic:** Exponential backoff for failed syncs
- **Module:** Offline sync logic integrated into `transactions` module

---

## 🎨 UI/UX Considerations

### POS Terminal (pos module)
- Large, touch-friendly buttons
- Minimal text, clear icons
- Fast transaction flow
- Keyboard shortcuts support
- Landscape orientation support
- Dark mode for reduced eye strain

### Dashboard (dashboard module)
- Clean, professional design
- Responsive (desktop-first, mobile-friendly)
- Data visualization with charts
- Sortable/filterable tables
- Bulk actions support
- Confirmation dialogs for destructive actions

### Global Components
- Reusable UI components in `components/` directory
- Consistent styling via Tailwind
- Accessible form components
- Toast notifications via `helpers/toast.ts`

---

## 🧪 Testing Strategy

- Unit tests for composables, helpers & utilities
- Integration tests for API services (per module)
- E2E tests for critical flows:
  - Login flow (auth module)
  - Transaction creation (pos module)
  - Offline sync (transactions module)
  - Permission-based access (global)
- Module-specific test files alongside source code

---

## 🔧 Development Setup

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint code
npm run lint
```

---

## 📋 Key Pages & Routes

Each module manages its own routes. Key routes by module:

| Module | Route | Purpose | Role |
|--------|-------|---------|------|
| **auth** | `/auth/login` | User login | Public |
| **auth** | `/auth/register` | User registration | Public |
| **dashboard** | `/dashboard` | Overview & metrics | Admin |
| **pos** | `/pos` | POS terminal | Cashier/Admin |
| **transactions** | `/transactions` | Transaction history | Admin |
| **transactions** | `/transactions/:id` | Transaction details | Admin |
| **products** | `/products` | Product management | Admin |
| **products** | `/products/:id` | Product details | Admin |
| **reports** | `/reports` | Analytics & reports | Admin |
| **reports** | `/reports/daily` | Daily reports | Admin |
| **users** | `/users` | User management | Admin |
| **users** | `/users/:id` | User details | Admin |
| **outlets** | `/outlets` | Outlet management | Admin |
| **outlets** | `/outlets/:id` | Outlet details | Admin |
| **settings** | `/settings` | Configuration | Admin |
| **error** | `/403` | Forbidden | Public |
| **error** | `/404` | Not found | Public |

---

## 🔌 API Integration Points

Each module handles its own API integration via `services/api.ts`:

- **auth module:** POST /auth/login, POST /auth/register
- **transactions module:** GET/POST /transactions, POST /transactions/sync
- **products module:** GET /products, POST/PUT /products
- **reports module:** GET /reports/daily, GET /reports/summary
- **users module:** GET/POST/PUT /users
- **outlets module:** GET /outlets
- **dashboard module:** GET /dashboard/summary

---

## � Module Development Guidelines

### Creating a New Module

1. Create folder: `src/modules/[feature-name]/`
2. Add subdirectories: `pages/`, `router/`, `services/`, `stores/`
3. Create `router/index.ts` with route definitions
4. Create `services/api.ts` for API calls
5. Create `stores/index.ts` for Pinia store
6. Create `pages/index.vue` as entry page
7. Add `README.md` with module documentation
8. Register routes in `core/global-routes.ts`

### Module Responsibilities

- **pages/:** Routable page components
- **components/:** Feature-specific reusable components
- **router/:** Route definitions for the module
- **services/:** API calls & constants
- **stores/:** Pinia store (state, actions, getters)
- **helpers/:** Composables & utilities (optional)
- **styles/:** Module-specific styles (optional)

---

## 🎯 MVP Priorities

**Phase 1 (Core POS):**
- Auth & login
- POS terminal (add to cart, checkout)
- Transaction history
- Basic product browser

**Phase 2 (Dashboard):**
- Dashboard overview
- Transaction management
- Product management
- Daily reports

**Phase 3 (Advanced):**
- User management
- Offline sync
- Advanced reports
- Settings & configuration

---

## 🚫 Out of Scope (MVP)

- Mobile app (web-responsive only)
- Advanced analytics
- Loyalty program integration
- Multi-language support (initially)
- Accounting export
- Tax calculations

---

## 📝 Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=UMKM-POS
VITE_APP_VERSION=1.0.0
```

---

## 🤝 Integration Notes

- API base URL configurable via env
- JWT token stored in localStorage/sessionStorage
- Axios interceptors for auth headers
- Error handling with user-friendly messages
- Loading states for all async operations
- Toast notifications for feedback

---

## 📚 Related Documentation

- API Documentation: See `apps/api/README.md`
- API Conventions: See `apps/api/API_CONVENTIONS.md`
- Domain Rules: See `apps/api/DOMAIN_RULES.md`

---

## ✅ Success Criteria

- [ ] Users can login securely
- [ ] POS terminal can create transactions
- [ ] Dashboard shows accurate metrics
- [ ] Offline transactions sync correctly
- [ ] Multi-outlet support works
- [ ] Permission-based access enforced
- [ ] Responsive on desktop & tablet
- [ ] Performance: <3s page load
- [ ] 95%+ API integration coverage
