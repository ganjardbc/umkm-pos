export default {
  nav: {
    fitur: 'Features',
    harga: 'Pricing',
    testimoni: 'Testimonials',
    register: 'Register',
  },
  hero: {
    tagline: 'The simple point of sale for UMKM.',
    deskripsi: 'All-in-one digital POS solution for Indonesian UMKM. Manage sales, inventory, financial reports, and employees in one easy-to-use platform.',
    masuk: 'Login',
    daftar: 'Register',
    stats: {
      pengguna: 'Active Users',
      transaksi: 'Transactions',
      outlet: 'Outlets',
      tahun: 'Experience',
    },
    kepercayaan: 'Trusted by thousands of UMKM across Indonesia',
  },
  features: {
    title: 'Key Features',
    subtitle: 'Everything you need to manage your UMKM business.',
    items: [
      { title: 'Stock Management', description: 'Real-time inventory tracking with low-stock notifications.' },
      { title: 'Sales Reports', description: 'Daily, monthly, and yearly sales analysis with interactive charts.' },
      { title: 'Multi-Outlet', description: 'Manage multiple outlets from one account with centralized data.' },
      { title: 'Product Management', description: 'Easily manage categories, variants, and pricing.' },
      { title: 'Employee Management', description: 'Manage shifts, roles, and access for your employees.' },
      { title: 'POS Cashier', description: 'Fast and intuitive cashier interface for daily transactions.' },
    ],
  },
  pricing: {
    title: 'Pricing Plans',
    subtitle: 'Choose the plan that fits your business needs.',
    plans: [
      {
        name: 'Free',
        price: 'Rp 0',
        period: '/month',
        features: ['Up to 50 transactions/month', '1 outlet', 'Basic reports', 'Email support'],
        cta: 'Get Started',
        featured: false,
      },
      {
        name: 'Business',
        price: 'Rp 99,000',
        period: '/month',
        features: ['Unlimited transactions', 'Up to 3 outlets', 'Full reports', 'Priority support', 'Data export'],
        cta: 'Start Trial',
        featured: true,
      },
      {
        name: 'Enterprise',
        price: 'Rp 299,000',
        period: '/month',
        features: ['Unlimited transactions', 'Unlimited outlets', 'Custom reports', '24/7 support', 'API access', 'Dedicated account'],
        cta: 'Contact Us',
        featured: false,
      },
    ],
  },
  testimonials: {
    title: 'What Customers Say',
    subtitle: 'Join thousands of UMKM businesses already using UMKM POS.',
    items: [
      { quote: 'UMKM POS helps me manage stock and reports very easily. My business is more organized!', name: 'Siti Rahmawati', role: 'Grocery Store Owner' },
      { quote: 'I used to struggle with financial reports. Now I just check the dashboard, done!', name: 'Budi Santoso', role: 'Food Stall Owner' },
      { quote: 'The multi-outlet feature is amazing. I can monitor all stores from one place.', name: 'Dewi Lestari', role: 'Fashion Store Owner' },
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
