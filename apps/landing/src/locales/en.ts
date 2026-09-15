export default {
  nav: {
    fitur: 'Features',
    harga: 'Pricing',
    caraKerja: 'How It Works',
    register: 'Register',
  },
  hero: {
    tagline: 'The simple point of sale for UMKM.',
    deskripsi: 'All-in-one digital POS solution for Indonesian UMKM. Manage sales, inventory, financial reports, and employees in one easy-to-use platform.',
    masuk: 'Login',
    daftar: 'Register',
    cocokUntuk: 'Built for',
    segments: ['Cafés & Restaurants', 'Souvenir Shops', 'Agro-tourism', 'Retail Stores'],
    kepercayaan: 'Start free, no credit card required',
  },
  features: {
    title: 'Key Features',
    subtitle: 'Everything you need to manage your UMKM business.',
    items: [
      { title: 'POS Cashier', description: 'Fast and intuitive cashier interface for daily transactions.' },
      { title: 'Stock Management', description: 'Per-outlet stock updated automatically on every sale, with full adjustment history.' },
      { title: 'Reports & Export', description: 'Daily sales, top products, and outlet comparison dashboards. Export anytime.' },
      { title: 'Multi-Outlet', description: 'Manage multiple outlets from one merchant account with centralized data.' },
      { title: 'Cashier Shifts', description: 'Open and close shifts with cash counts, handoffs, and an audit log.' },
      { title: 'Staff & Permissions', description: 'Set roles and permissions per outlet — cashier at one outlet, owner at another.' },
      { title: 'Customer Self-Order', description: 'Customers order from a digital menu and orders go straight to the cashier.' },
      { title: 'Table Management', description: 'Set up outlet tables and link orders to tables for cafés and restaurants.' },
      { title: 'Notifications', description: 'Get notified about new orders and important activity at your outlets.' },
    ],
  },
  pricing: {
    title: 'Pricing Plans',
    subtitle: 'Start free, upgrade as your business grows.',
    badge: 'Recommended',
    plans: [
      {
        name: 'Free',
        price: 'Rp 0',
        period: '/month',
        features: ['1 outlet', 'POS cashier & transactions', 'Product & stock management', 'Basic reports'],
        cta: 'Start Free',
        featured: false,
      },
      {
        name: 'Pro',
        price: 'Rp 99,000',
        period: '/month',
        features: ['Multiple outlets', 'Everything in Free', 'Customer self-order & table management', 'Cashier shifts & audit log', 'Full reports & data export', 'Priority support'],
        cta: 'Choose Pro',
        featured: true,
      },
    ],
  },
  howItWorks: {
    title: 'Get Started in 3 Steps',
    subtitle: 'No special hardware needed. Just a browser on your phone, tablet, or laptop.',
    steps: [
      { title: 'Create an Account', description: 'Set up your merchant and first outlet in minutes.' },
      { title: 'Add Products', description: 'Enter your products, categories, prices, and opening stock.' },
      { title: 'Start Selling', description: 'Open a shift, serve customers, and track sales in real time.' },
    ],
  },
  register: {
    kicker: 'Create New Account',
    title: 'Start Using UMKM POS',
    subtitle: 'Fill in the form below to create a new customer account.',
    fields: {
      name: 'Full Name',
      email: 'Email',
      password: 'Password',
      merchantName: 'Merchant Name',
      merchantSlug: 'Merchant Slug',
      outletName: 'Outlet Name',
      outletSlug: 'Outlet Slug',
    },
    actions: {
      submit: 'Register Now',
      loading: 'Processing...',
    },
    messages: {
      success: 'Registration successful. Please continue login in the web app.',
      failed: 'Registration failed. Please try again.',
    },
  },
  footer: {
    hakCipta: 'UMKM POS. All rights reserved.',
  },
}
