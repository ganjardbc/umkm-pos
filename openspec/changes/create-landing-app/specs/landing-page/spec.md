## ADDED Requirements

### Requirement: Landing page renders with all sections
The landing page SHALL display five sections visible on a single scrollable page: Hero, Features, Pricing, Testimonials, and Footer.

#### Scenario: Hero section renders
- **WHEN** a user visits the landing page
- **THEN** the Hero section SHALL display the UMKM POS logo, a headline "UMKM POS", a tagline "The simple point of sale for UMKM.", and two CTA buttons: "Masuk" (Login) and "Daftar" (Register)

#### Scenario: Features section renders
- **WHEN** a user scrolls to the Features section
- **THEN** the system SHALL display a grid of feature cards including but not limited to: Manajemen Stok (Stock Management), Laporan Penjualan (Sales Reports), Multi-Outlet, Manajemen Produk (Product Management), Manajemen Karyawan (Employee Management), and POS Kasir (POS Cashier)

#### Scenario: Pricing section renders
- **WHEN** a user scrolls to the Pricing section
- **THEN** the system SHALL display pricing tier cards with plan names, prices, feature lists, and a CTA button per tier

#### Scenario: Testimonials section renders
- **WHEN** a user scrolls to the Testimonials section
- **THEN** the system SHALL display customer testimonial cards with avatar, name, role, and quote

#### Scenario: Footer section renders
- **WHEN** a user scrolls to the Footer section
- **THEN** the system SHALL display the logo, quick navigation links, social media icons, and copyright text

### Requirement: CTA buttons navigate to web app login/register
The CTA buttons in the Hero section SHALL link to the existing web application's login and register pages.

#### Scenario: Masuk button navigates to login
- **WHEN** a user clicks the "Masuk" / "Login" button
- **THEN** the browser SHALL navigate to `{VITE_WEB_BASE_URL}/`

#### Scenario: Daftar button navigates to register
- **WHEN** a user clicks the "Daftar" / "Register" button
- **THEN** the browser SHALL navigate to `{VITE_WEB_BASE_URL}/register`

### Requirement: Bilingual toggle (ID/EN)
The landing page SHALL support two languages: Indonesian (default) and English, with a toggle in the header.

#### Scenario: Language toggle switches content
- **WHEN** a user clicks the language toggle
- **THEN** the system SHALL switch all visible text between Indonesian and English

#### Scenario: Language persists across refresh
- **WHEN** a user selects a language and refreshes the page
- **THEN** the system SHALL display the page in the previously selected language

### Requirement: Dark mode toggle
The landing page SHALL support light and dark themes with a toggle in the header.

#### Scenario: Dark mode toggle switches theme
- **WHEN** a user clicks the dark mode toggle
- **THEN** the system SHALL switch between light and dark visual themes using Tailwind's `dark:` variant

#### Scenario: Dark mode persists across refresh
- **WHEN** a user selects dark mode and refreshes the page
- **THEN** the system SHALL display the page in the previously selected theme

#### Scenario: Default follows system preference
- **WHEN** a user visits the page for the first time without a saved preference
- **THEN** the system SHALL follow the `prefers-color-scheme` media query

### Requirement: Responsive layout
The landing page SHALL be fully responsive and render correctly on mobile, tablet, and desktop viewports.

#### Scenario: Mobile layout
- **WHEN** the page is viewed on a screen width below 768px
- **THEN** the layout SHALL stack sections vertically, navigation SHALL use a hamburger menu, and cards SHALL display in a single column
