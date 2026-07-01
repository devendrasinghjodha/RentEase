import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CalendarDays,
  CreditCard,
  Filter,
  HandCoins,
  Home,
  Layers3,
  PackageSearch,
  Repeat,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Truck,
  UserCircle2,
  Wrench,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Footer, Hero, SectionHeader, SiteHeader } from './components/Layout';
import { categories, kpis, productSeed, stats, workflow } from './data/catalog';
import {
  addToCart,
  clearCart,
  createMaintenanceRequest,
  createOrder,
  fetchAdminInventory,
  fetchAdminMaintenance,
  fetchAdminOrders,
  fetchAdminStats,
  fetchCart,
  fetchMaintenanceRequests,
  fetchOrders,
  fetchProducts,
  removeCartItem,
  updateCartItem,
} from './lib/api';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const normalizeProduct = (item) => {
  const specificationEntries = Object.entries(item.specifications || {}).slice(0, 3);

  return {
    id: item._id,
    name: item.name,
    category: item.category,
    subcategory: item.subcategory,
    monthlyRent: item.monthlyRent,
    securityDeposit: item.securityDeposit,
    tenureOptions: (item.tenureOptions || []).map((option) => option.months),
    availability: item.available ? `${item.stock} in stock` : 'Unavailable',
    description: item.description,
    features: specificationEntries.map(([key, value]) => `${key}: ${value}`),
    image: item.image,
  };
};

const metricCards = [
  { icon: Home, label: 'Rental-first onboarding' },
  { icon: Truck, label: 'Delivery and pickup scheduling' },
  { icon: Wrench, label: 'Maintenance support workflows' },
  { icon: Repeat, label: 'Return and extension handling' },
];

function Workspace() {
  const navigate = useNavigate();
  const { user, logout, login, register } = useAuth();
  const [products, setProducts] = useState(productSeed.map((item) => ({ ...item })));
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(productSeed[0]);
  const [selectedTenure, setSelectedTenure] = useState(productSeed[0].tenureOptions[0]);
  const [adminStats, setAdminStats] = useState(null);
  const [adminInventory, setAdminInventory] = useState(null);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminMaintenance, setAdminMaintenance] = useState([]);
  const [cart, setCart] = useState(null);
  const [orders, setOrders] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('success');
  const [loadingData, setLoadingData] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [checkoutForm, setCheckoutForm] = useState({ deliveryDate: '', street: '', city: '', state: '', pincode: '' });
  const [supportForm, setSupportForm] = useState({ orderId: '', productId: '', issueType: 'repair', priority: 'medium', description: '' });

  useEffect(() => {
    fetchProducts()
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          const normalized = items.map(normalizeProduct);
          setProducts(normalized);
          setSelectedProduct(normalized[0]);
          setSelectedTenure(normalized[0]?.tenureOptions?.[0] || 3);
        }
      })
      .catch(() => setProducts(productSeed));
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setSelectedTenure(selectedProduct.tenureOptions?.[0] || 3);
    }
  }, [selectedProduct]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setCart(null);
        setOrders([]);
        setMaintenanceRequests([]);
        setAdminStats(null);
        setAdminInventory(null);
        setAdminOrders([]);
        setAdminMaintenance([]);
        return;
      }

      setLoadingData(true);
      try {
        const tasks = [
          fetchCart().then(setCart).catch(() => setCart(null)),
          fetchOrders().then(setOrders).catch(() => setOrders([])),
          fetchMaintenanceRequests().then(setMaintenanceRequests).catch(() => setMaintenanceRequests([])),
        ];

        if (user.role === 'admin') {
          tasks.push(fetchAdminStats().then(setAdminStats).catch(() => setAdminStats(null)));
          tasks.push(fetchAdminInventory().then(setAdminInventory).catch(() => setAdminInventory(null)));
          tasks.push(fetchAdminOrders().then(setAdminOrders).catch(() => setAdminOrders([])));
          tasks.push(fetchAdminMaintenance().then(setAdminMaintenance).catch(() => setAdminMaintenance([])));
        }

        await Promise.allSettled(tasks);
      } finally {
        setLoadingData(false);
      }
    };

    loadUserData();
  }, [user]);

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesQuery = [product.name, product.subcategory, product.description].join(' ').toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [products, query, selectedCategory]);

  const cartItems = cart?.items || [];
  const cartTotals = cartItems.reduce((totals, item) => {
    const monthlyRent = item.product?.monthlyRent || 0;
    const securityDeposit = item.product?.securityDeposit || 0;
    return { rent: totals.rent + monthlyRent * item.quantity, deposit: totals.deposit + securityDeposit * item.quantity };
  }, { rent: 0, deposit: 0 });

  const dashboardCards = [
    { title: 'Active rentals', value: adminStats?.activeRentals ?? orders.length, note: 'Current live rentals' },
    { title: 'Monthly recurring revenue', value: adminStats ? currency.format(adminStats.monthlyRevenue || 0) : currency.format(cartTotals.rent), note: 'Rental income' },
    { title: 'Product utilization', value: adminStats ? `${adminStats.utilizationRate}%` : '63%', note: 'Inventory occupancy' },
    { title: 'Open maintenance', value: adminStats?.openMaintenance ?? maintenanceRequests.length, note: 'Service requests' },
  ];

  const showToast = (message, tone = 'success') => {
    setStatusMessage(message);
    setStatusTone(tone);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setStatusMessage(''), 3500);
  };

  const handleAddToCart = async (product, tenureMonths = selectedTenure) => {
    if (!user) {
      showToast('Sign in to add items to your rental cart.', 'error');
      navigate('/auth');
      return;
    }

    try {
      const updatedCart = await addToCart({ productId: product.id, quantity: 1, tenure: tenureMonths });
      setCart(updatedCart);
      showToast(`${product.name} added to cart.`);
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to add item to cart.', 'error');
    }
  };

  const handleUpdateCartItem = async (itemId, payload) => {
    try {
      const updatedCart = await updateCartItem(itemId, payload);
      setCart(updatedCart);
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to update cart item.', 'error');
    }
  };

  const handleRemoveCartItem = async (itemId) => {
    try {
      const updatedCart = await removeCartItem(itemId);
      setCart(updatedCart);
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to remove cart item.', 'error');
    }
  };

  const handleCheckout = async (event) => {
    event.preventDefault();

    if (!user) {
      showToast('Sign in before checkout.', 'error');
      navigate('/auth');
      return;
    }

    try {
      const order = await createOrder({
        deliveryDate: checkoutForm.deliveryDate,
        deliveryAddress: {
          street: checkoutForm.street,
          city: checkoutForm.city,
          state: checkoutForm.state,
          pincode: checkoutForm.pincode,
        },
      });

      setOrders((currentOrders) => [order, ...currentOrders]);
      setCart({ user: cart?.user || user._id, items: [] });
      await clearCart().catch(() => null);
      showToast('Order placed successfully.');
      navigate('/rentals');
    } catch (error) {
      showToast(error.response?.data?.message || 'Checkout failed.', 'error');
    }
  };

  const handleSupportSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      showToast('Sign in to raise maintenance requests.', 'error');
      navigate('/auth');
      return;
    }

    try {
      const request = await createMaintenanceRequest(supportForm);
      setMaintenanceRequests((currentRequests) => [request, ...currentRequests]);
      setSupportForm((current) => ({ ...current, description: '' }));
      showToast('Maintenance request submitted.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to create maintenance request.', 'error');
    }
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      name: authForm.name,
      email: authForm.email,
      password: authForm.password,
      phone: authForm.phone,
      address: {
        street: authForm.street,
        city: authForm.city,
        state: authForm.state,
        pincode: authForm.pincode,
      },
    };

    try {
      if (authMode === 'login') {
        await login(authForm.email, authForm.password);
        showToast('Logged in successfully.');
      } else {
        await register(payload);
        showToast('Account created successfully.');
      }
      navigate('/shop');
    } catch (error) {
      showToast(error.response?.data?.message || 'Authentication failed.', 'error');
    }
  };

  return (
    <div className="app-shell">
      <SiteHeader user={user} onLogout={logout} />
      {statusMessage ? <div className={`toast ${statusTone === 'error' ? 'toast-error' : 'toast-success'}`}>{statusMessage}</div> : null}
      <Routes>
        <Route path="/" element={<HomePage onBrowse={() => navigate('/shop')} onAuth={() => navigate('/auth')} onAddToCart={handleAddToCart} products={filteredProducts} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} setQuery={setQuery} query={query} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} selectedTenure={selectedTenure} setSelectedTenure={setSelectedTenure} />} />
        <Route path="/shop" element={<ShopPage products={filteredProducts} categories={categories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} query={query} setQuery={setQuery} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} selectedTenure={selectedTenure} setSelectedTenure={setSelectedTenure} onAddToCart={handleAddToCart} />} />
        <Route path="/catalog" element={<ShopPage products={filteredProducts} categories={categories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} query={query} setQuery={setQuery} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} selectedTenure={selectedTenure} setSelectedTenure={setSelectedTenure} onAddToCart={handleAddToCart} />} />
        <Route path="/cart" element={<CartPage user={user} loadingData={loadingData} cartItems={cartItems} cartTotals={cartTotals} checkoutForm={checkoutForm} setCheckoutForm={setCheckoutForm} onCheckout={handleCheckout} onUpdateCartItem={handleUpdateCartItem} onRemoveCartItem={handleRemoveCartItem} />} />
        <Route path="/rentals" element={<RentalsPage user={user} orders={orders} />} />
        <Route path="/support" element={<SupportPage user={user} orders={orders} maintenanceRequests={maintenanceRequests} supportForm={supportForm} setSupportForm={setSupportForm} onSubmit={handleSupportSubmit} />} />
        <Route path="/admin" element={<AdminPage user={user} adminStats={adminStats} adminInventory={adminInventory} adminOrders={adminOrders} adminMaintenance={adminMaintenance} dashboardCards={dashboardCards} />} />
        <Route path="/dashboard" element={<DashboardPage user={user} dashboardCards={dashboardCards} loadingData={loadingData} onNavigateShop={() => navigate('/shop')} onNavigateAuth={() => navigate('/auth')} />} />
        <Route path="/auth" element={<AuthPage user={user} authMode={authMode} setAuthMode={setAuthMode} authForm={authForm} setAuthForm={setAuthForm} onSubmit={handleAuthSubmit} />} />
        <Route path="/documentation" element={<DocumentationPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

function HomePage({ onBrowse, onAuth, onAddToCart, products, selectedCategory, setSelectedCategory, setQuery, query, selectedProduct, setSelectedProduct, selectedTenure, setSelectedTenure }) {
  return (
    <main>
      <Hero
        title="Rent furniture and appliances without the ownership burden."
        subtitle="RentEase gives students and working professionals a monthly rental path for beds, sofas, tables, refrigerators, washing machines, TVs, and more."
        actions={(
          <>
            <button type="button" className="btn btn-primary btn-lg" onClick={onBrowse}>Explore catalog</button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={onAuth}>Sign in</button>
          </>
        )}
        highlight={(
          <div className="highlight-grid">
            {metricCards.map((item) => {
              const Icon = item.icon;
              return <div key={item.label} className="highlight-card"><Icon size={20} /><span>{item.label}</span></div>;
            })}
          </div>
        )}
        metrics={stats}
      />

      <section className="section">
        <div className="container">
          <SectionHeader eyebrow="Why this platform" title="Designed around rental constraints, not retail assumptions." description="The workflow prioritizes affordability, flexible tenure plans, scheduled logistics, and service tracking." />
          <div className="grid grid-4">
            {workflow.map((step, index) => (
              <article key={step.title} className="step-card glass-card animate-in">
                <div className="step-number">0{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt-section">
        <div className="container">
          <SectionHeader eyebrow="Catalog preview" title="Product catalog for furniture and appliances" description="Filter by category and inspect pricing, security deposit, and tenure options." />
          <div className="products-toolbar">
            <div className="search-bar"><Filter className="search-icon" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, categories, or use cases" /></div>
            <div className="pill-group">{categories.map((category) => <button key={category.key} type="button" className={`pill ${selectedCategory === category.key ? 'active' : ''}`} onClick={() => setSelectedCategory(category.key)}>{category.label}</button>)}</div>
          </div>
          <div className="products-grid">
            {products.map((product) => (
              <article key={product.id} className="product-card animate-in" onClick={() => setSelectedProduct(product)}>
                <div className="product-card-image"><img src={product.image} alt={product.name} /><span className="product-card-category badge badge-primary">{product.category}</span></div>
                <div className="product-card-body">
                  <h3>{product.name}</h3>
                  <div className="product-subcategory">{product.subcategory}</div>
                  <p className="product-card-copy">{product.description}</p>
                  <div className="product-card-price"><span className="price">{currency.format(product.monthlyRent)}</span><span className="period">/ month</span></div>
                  <div className="product-card-meta"><div className="product-card-deposit">Deposit <span>{currency.format(product.securityDeposit)}</span></div><div className="product-card-rating"><Star size={14} fill="currentColor" /> 4.6</div></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container product-detail-grid-shell">
          <div className="product-detail-grid">
            <div className="product-image-main glass-card"><img src={selectedProduct.image} alt={selectedProduct.name} /></div>
            <div className="product-info glass-card">
              <span className="eyebrow">Selected rental</span>
              <h1>{selectedProduct.name}</h1>
              <p>{selectedProduct.description}</p>
              <div className="price-section"><span className="price">{currency.format(selectedProduct.monthlyRent)}</span><span className="period">per month</span></div>
              <div className="tenure-selector">
                <label>Rental tenure options</label>
                <div className="tenure-options">
                  {selectedProduct.tenureOptions.map((months) => <button key={months} type="button" className={`tenure-option ${selectedTenure === months ? 'selected' : ''}`} onClick={() => setSelectedTenure(months)}><span className="months">{months} mo</span><span className="discount">Flexible extension supported</span></button>)}
                </div>
              </div>
              <table className="specs-table"><tbody><tr><td>Security deposit</td><td>{currency.format(selectedProduct.securityDeposit)}</td></tr><tr><td>Availability</td><td>{selectedProduct.availability}</td></tr><tr><td>Category</td><td>{selectedProduct.category}</td></tr></tbody></table>
              <div className="feature-list">{selectedProduct.features.map((feature) => <span key={feature} className="badge badge-accent">{feature}</span>)}</div>
              <button type="button" className="btn btn-primary" onClick={() => onAddToCart(selectedProduct, selectedTenure)}><ShoppingBag size={16} /> Add to cart</button>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader eyebrow="KPIs and scope" title="Technical documentation coverage" description="This reference implementation maps directly to the stated deliverables, requirements, and measurable outcomes." />
          <div className="grid grid-2">
            <div className="glass-card doc-card"><h3>Key performance indicators</h3><ul className="check-list">{kpis.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div className="glass-card doc-card"><h3>Scope and constraints</h3><p>Responsive web app, catalog browsing, monthly plans, delivery scheduling, and admin monitoring are in scope. Native apps, cross-border rentals, and AI pricing are out of scope.</p></div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ShopPage({ products, categories, selectedCategory, setSelectedCategory, query, setQuery, selectedProduct, setSelectedProduct, selectedTenure, setSelectedTenure, onAddToCart }) {
  return (
    <main className="section">
      <div className="container">
        <SectionHeader eyebrow="Catalog" title="Browse the rental inventory" description="Use the filters to inspect category coverage and monthly pricing." />
        <div className="products-toolbar">
          <div className="search-bar"><Filter className="search-icon" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, categories, or use cases" /></div>
          <div className="pill-group">{categories.map((category) => <button key={category.key} type="button" className={`pill ${selectedCategory === category.key ? 'active' : ''}`} onClick={() => setSelectedCategory(category.key)}>{category.label}</button>)}</div>
        </div>
        <div className="products-grid">
          {products.map((product) => (
            <article key={product.id} className={`product-card ${selectedProduct?.id === product.id ? 'selected' : ''}`} onClick={() => setSelectedProduct(product)}>
              <div className="product-card-image"><img src={product.image} alt={product.name} /><span className="product-card-category badge badge-primary">{product.category}</span></div>
              <div className="product-card-body">
                <h3>{product.name}</h3>
                <div className="product-subcategory">{product.subcategory}</div>
                <p className="product-card-copy">{product.description}</p>
                <div className="product-card-price"><span className="price">{currency.format(product.monthlyRent)}</span><span className="period">/ month</span></div>
                <div className="product-card-meta"><div className="product-card-deposit">Deposit <span>{currency.format(product.securityDeposit)}</span></div><div className="product-card-rating"><Star size={14} fill="currentColor" /> 4.6</div></div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={(event) => { event.stopPropagation(); onAddToCart(product, selectedTenure); }}><ShoppingBag size={14} /> Add to cart</button>
              </div>
            </article>
          ))}
        </div>

        {selectedProduct ? (
          <div className="section compact-section">
            <div className="product-detail-grid">
              <div className="product-image-main glass-card"><img src={selectedProduct.image} alt={selectedProduct.name} /></div>
              <div className="product-info glass-card">
                <span className="eyebrow">Selected product</span>
                <h1>{selectedProduct.name}</h1>
                <p>{selectedProduct.description}</p>
                <div className="price-section"><span className="price">{currency.format(selectedProduct.monthlyRent)}</span><span className="period">per month</span></div>
                <div className="tenure-selector">
                  <label>Tenure options</label>
                  <div className="tenure-options">{selectedProduct.tenureOptions.map((months) => <button key={months} type="button" className={`tenure-option ${selectedTenure === months ? 'selected' : ''}`} onClick={() => setSelectedTenure(months)}><span className="months">{months} mo</span><span className="discount">Best for longer stays</span></button>)}</div>
                </div>
                <div className="feature-list">{selectedProduct.features.map((feature) => <span key={feature} className="badge badge-accent">{feature}</span>)}</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function CartPage({ user, loadingData, cartItems, cartTotals, checkoutForm, setCheckoutForm, onCheckout, onUpdateCartItem, onRemoveCartItem }) {
  if (!user) {
    return (
      <main className="section"><div className="container"><SectionHeader eyebrow="Cart" title="Sign in to view your rental cart" description="The cart and checkout flow is backed by JWT-protected APIs." /><div className="glass-card doc-card"><p>Use the auth page to log in with the demo account or create a new renter profile.</p><Link to="/auth" className="btn btn-primary">Go to sign in</Link></div></div></main>
    );
  }

  return (
    <main className="cart-page section">
      <div className="container">
        <SectionHeader eyebrow="Cart" title="Review items, adjust tenure, and schedule delivery" description="Checkout creates a rental order and clears the cart after successful submission." />
        {loadingData ? <div className="loader-container"><div className="loader" /></div> : null}
        <div className="cart-layout">
          <div>
            {cartItems.length === 0 ? (
              <div className="empty-state glass-card"><ShoppingBag size={40} /><h3>Your cart is empty</h3><p>Add a bed, sofa, or appliance from the catalog to start a rental.</p><Link to="/shop" className="btn btn-primary">Browse catalog</Link></div>
            ) : cartItems.map((item) => {
              const monthlyRent = item.product?.monthlyRent || 0;
              const securityDeposit = item.product?.securityDeposit || 0;
              return (
                <article key={item._id} className="cart-item">
                  <div className="cart-item-image"><img src={item.product?.image} alt={item.product?.name} /></div>
                  <div className="cart-item-info">
                    <h3>{item.product?.name}</h3>
                    <div className="cart-item-details"><span>{item.product?.subcategory}</span><span>{item.tenure} months</span><span>{currency.format(securityDeposit)} deposit</span></div>
                    <div className="cart-item-actions">
                      <div className="quantity-controls"><button type="button" onClick={() => onUpdateCartItem(item._id, { quantity: Math.max(1, item.quantity - 1) })}>-</button><span>{item.quantity}</span><button type="button" onClick={() => onUpdateCartItem(item._id, { quantity: item.quantity + 1 })}>+</button></div>
                      <select className="form-control" style={{ width: 'auto' }} value={item.tenure} onChange={(event) => onUpdateCartItem(item._id, { tenure: Number(event.target.value) })}><option value={3}>3 months</option><option value={6}>6 months</option><option value={12}>12 months</option></select>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => onRemoveCartItem(item._id)}>Remove</button>
                    </div>
                    <div className="cart-item-price">{currency.format(monthlyRent * item.quantity)} / month</div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="cart-summary">
            <h3>Checkout summary</h3>
            <div className="cart-summary-row"><span>Monthly rent</span><span>{currency.format(cartTotals.rent)}</span></div>
            <div className="cart-summary-row"><span>Security deposit</span><span>{currency.format(cartTotals.deposit)}</span></div>
            <div className="cart-summary-row total"><span>Payable now</span><span>{currency.format(cartTotals.rent + cartTotals.deposit)}</span></div>
            <form onSubmit={onCheckout}>
              <div className="form-group"><label>Delivery date</label><input className="form-control" type="date" value={checkoutForm.deliveryDate} onChange={(event) => setCheckoutForm((current) => ({ ...current, deliveryDate: event.target.value }))} required /></div>
              <div className="form-group"><label>Street</label><input className="form-control" value={checkoutForm.street} onChange={(event) => setCheckoutForm((current) => ({ ...current, street: event.target.value }))} required /></div>
              <div className="grid grid-2"><div className="form-group"><label>City</label><input className="form-control" value={checkoutForm.city} onChange={(event) => setCheckoutForm((current) => ({ ...current, city: event.target.value }))} required /></div><div className="form-group"><label>State</label><input className="form-control" value={checkoutForm.state} onChange={(event) => setCheckoutForm((current) => ({ ...current, state: event.target.value }))} required /></div></div>
              <div className="form-group"><label>Pincode</label><input className="form-control" value={checkoutForm.pincode} onChange={(event) => setCheckoutForm((current) => ({ ...current, pincode: event.target.value }))} required /></div>
              <button type="submit" className="btn btn-primary" disabled={cartItems.length === 0}><CreditCard size={16} /> Place rental order</button>
            </form>
          </aside>
        </div>
      </div>
    </main>
  );
}

function RentalsPage({ user, orders }) {
  if (!user) {
    return <main className="section"><div className="container"><SectionHeader eyebrow="Rentals" title="Sign in to view active rentals" description="Order history is stored per user account." /><Link to="/auth" className="btn btn-primary">Sign in</Link></div></main>;
  }

  return (
    <main className="dashboard section">
      <div className="container">
        <SectionHeader eyebrow="Rentals" title="Track active rental orders" description="Monitor status, payment state, and return timelines." />
        {orders.length === 0 ? <div className="empty-state glass-card"><Repeat size={40} /><h3>No rental orders yet</h3><p>Your checkout history will appear here after your first order.</p><Link to="/shop" className="btn btn-primary">Start renting</Link></div> : <div className="grid grid-2">{orders.map((order) => (<article key={order._id} className="glass-card doc-card"><div className="badge badge-primary">{order.status}</div><h3>{currency.format(order.totalMonthlyRent)} / month</h3><p>{order.items.length} items, delivery on {new Date(order.deliveryDate).toLocaleDateString()}</p><div className="stack-list">{order.items.map((item) => <div key={item._id || item.product?._id} className="checkout-line"><span>{item.productName || item.product?.name}</span><span>{item.tenure} mo</span></div>)}</div></article>))}</div>}
      </div>
    </main>
  );
}

function SupportPage({ user, orders, maintenanceRequests, supportForm, setSupportForm, onSubmit }) {
  if (!user) {
    return <main className="section"><div className="container"><SectionHeader eyebrow="Support" title="Sign in to request maintenance" description="Maintenance requests are tied to a specific order and product." /><Link to="/auth" className="btn btn-primary">Sign in</Link></div></main>;
  }

  const activeOrder = orders[0];
  const activeOrderItems = activeOrder?.items || [];

  return (
    <main className="section">
      <div className="container">
        <SectionHeader eyebrow="Support" title="Raise maintenance requests and monitor resolution" description="Requests are tied to the renter's active or past orders." />
        <div className="grid grid-2">
          <div className="glass-card doc-card">
            <h3>New request</h3>
            {orders.length === 0 ? <p>You need at least one order before submitting maintenance.</p> : null}
            <form onSubmit={onSubmit}>
              <div className="form-group"><label>Order</label><select className="form-control" value={supportForm.orderId} onChange={(event) => { const order = orders.find((item) => item._id === event.target.value); const firstProduct = order?.items?.[0]?.product; setSupportForm((current) => ({ ...current, orderId: event.target.value, productId: firstProduct?._id || '' })); }} required><option value="">Select order</option>{orders.map((order) => <option key={order._id} value={order._id}>{order._id.slice(-6)} - {order.status}</option>)}</select></div>
              <div className="form-group"><label>Product</label><select className="form-control" value={supportForm.productId} onChange={(event) => setSupportForm((current) => ({ ...current, productId: event.target.value }))} required><option value="">Select product</option>{activeOrderItems.map((item) => <option key={item.product?._id || item.product} value={item.product?._id || item.product}>{item.productName || item.product?.name}</option>)}</select></div>
              <div className="grid grid-2"><div className="form-group"><label>Issue type</label><select className="form-control" value={supportForm.issueType} onChange={(event) => setSupportForm((current) => ({ ...current, issueType: event.target.value }))}><option value="repair">Repair</option><option value="replacement">Replacement</option><option value="cleaning">Cleaning</option><option value="installation">Installation</option><option value="other">Other</option></select></div><div className="form-group"><label>Priority</label><select className="form-control" value={supportForm.priority} onChange={(event) => setSupportForm((current) => ({ ...current, priority: event.target.value }))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div></div>
              <div className="form-group"><label>Description</label><textarea className="form-control" value={supportForm.description} onChange={(event) => setSupportForm((current) => ({ ...current, description: event.target.value }))} required /></div>
              <button type="submit" className="btn btn-primary"><Wrench size={16} /> Submit request</button>
            </form>
          </div>
          <div className="glass-card doc-card">
            <h3>Previous requests</h3>
            {maintenanceRequests.length === 0 ? <p>No maintenance requests yet.</p> : null}
            <div className="stack-list">{maintenanceRequests.map((request) => <article key={request._id} className="support-card"><div className="badge badge-accent">{request.status}</div><h4>{request.productName}</h4><p>{request.issueType} · {request.priority}</p><small>{request.description}</small></article>)}</div>
          </div>
        </div>
      </div>
    </main>
  );
}

function AdminPage({ user, adminStats, adminInventory, adminOrders, adminMaintenance, dashboardCards }) {
  if (!user || user.role !== 'admin') {
    return <main className="section"><div className="container"><SectionHeader eyebrow="Admin" title="Admin access required" description="Use the demo admin account to view inventory, orders, and maintenance data." /><Link to="/auth" className="btn btn-primary">Sign in as admin</Link></div></main>;
  }

  return (
    <main className="dashboard section">
      <div className="container">
        <SectionHeader eyebrow="Admin dashboard" title="Monitor inventory, rentals, and service queues" description="This panel summarizes the backend analytics and operational lists required by the brief." />
        <div className="stats-grid">{dashboardCards.map((card, index) => { const iconKeys = [Home, PackageSearch, Truck, Wrench]; const Icon = iconKeys[index] || Home; return <article key={card.title} className="stat-card"><div className="stat-card-icon"><Icon size={20} /></div><h3>{card.value}</h3><p>{card.title}</p><span className="stat-note">{card.note}</span></article>; })}</div>
        <div className="grid grid-2">
          <div className="glass-card doc-card"><h3>Inventory summary</h3><p>Total products: {adminInventory?.totalProducts ?? 0}</p><p>Available products: {adminInventory?.availableProducts ?? 0}</p><p>Low stock products: {adminInventory?.lowStockProducts?.length ?? 0}</p><div className="stack-list">{(adminInventory?.lowStockProducts || []).map((product) => <div key={product._id} className="checkout-line"><span>{product.name}</span><span>Stock {product.stock}</span></div>)}</div></div>
          <div className="glass-card doc-card"><h3>Financial and service metrics</h3><p>Total revenue: {currency.format(adminStats?.totalRevenue || 0)}</p><p>Monthly revenue: {currency.format(adminStats?.monthlyRevenue || 0)}</p><p>Open maintenance: {adminStats?.openMaintenance || 0}</p><p>Utilization: {adminStats?.utilizationRate || 0}%</p></div>
        </div>
        <div className="grid grid-2">
          <div className="glass-card doc-card"><h3>Recent orders</h3><div className="stack-list">{adminOrders.map((order) => <article key={order._id} className="support-card"><div className="badge badge-primary">{order.status}</div><h4>{order.user?.name}</h4><p>{order.items.length} items · {currency.format(order.totalMonthlyRent)} / month</p></article>)}</div></div>
          <div className="glass-card doc-card"><h3>Maintenance queue</h3><div className="stack-list">{adminMaintenance.map((request) => <article key={request._id} className="support-card"><div className="badge badge-accent">{request.status}</div><h4>{request.productName}</h4><p>{request.user?.name} · {request.priority}</p></article>)}</div></div>
        </div>
      </div>
    </main>
  );
}

function DashboardPage({ user, dashboardCards, loadingData, onNavigateShop, onNavigateAuth }) {
  return (
    <main className="dashboard section">
      <div className="container">
        <SectionHeader eyebrow="Dashboard" title="Project delivery and operations summary" description="This page ties together the core solution areas required by the brief." />
        <div className="stats-grid">{dashboardCards.map((card, index) => { const iconKeys = [Home, PackageSearch, Truck, Wrench]; const Icon = iconKeys[index] || Home; return <article key={card.title} className="stat-card"><div className="stat-card-icon"><Icon size={20} /></div><h3>{card.value}</h3><p>{card.title}</p><span className="stat-note">{card.note}</span></article>; })}</div>
        {loadingData ? <div className="loader-container"><div className="loader" /></div> : null}
        <div className="grid grid-2">
          <div className="glass-card doc-card"><h3>What is implemented</h3><ul className="check-list"><li>Responsive public storefront</li><li>User authentication with JWT</li><li>Cart and checkout flow</li><li>Rental history and maintenance requests</li><li>Admin inventory and analytics</li></ul></div>
          <div className="glass-card doc-card"><h3>Next actions</h3><p>{user ? 'Open the shop or cart to continue the workflow.' : 'Sign in to enable cart, checkout, and support flows.'}</p><div className="hero-actions"><button type="button" className="btn btn-primary" onClick={onNavigateShop}>Open shop</button>{!user ? <button type="button" className="btn btn-secondary" onClick={onNavigateAuth}>Sign in</button> : null}</div></div>
        </div>
      </div>
    </main>
  );
}

function AuthPage({ user, authMode, setAuthMode, authForm, setAuthForm, onSubmit }) {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <h2>{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="subtitle">Use the renter demo account or create a new profile to test checkout and support.</p>
        <div className="dashboard-tabs"><button type="button" className={`dashboard-tab ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>Login</button><button type="button" className={`dashboard-tab ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>Register</button></div>
        <form onSubmit={onSubmit}>
          {authMode === 'register' ? <><div className="form-group"><label>Name</label><input className="form-control" value={authForm.name} onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))} required /></div><div className="form-group"><label>Phone</label><input className="form-control" value={authForm.phone} onChange={(event) => setAuthForm((current) => ({ ...current, phone: event.target.value }))} required /></div></> : null}
          <div className="form-group"><label>Email</label><input className="form-control" type="email" value={authForm.email} onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))} required /></div>
          <div className="form-group"><label>Password</label><input className="form-control" type="password" value={authForm.password} onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))} required /></div>
          {authMode === 'register' ? <><div className="form-group"><label>Street</label><input className="form-control" value={authForm.street} onChange={(event) => setAuthForm((current) => ({ ...current, street: event.target.value }))} required /></div><div className="grid grid-2"><div className="form-group"><label>City</label><input className="form-control" value={authForm.city} onChange={(event) => setAuthForm((current) => ({ ...current, city: event.target.value }))} required /></div><div className="form-group"><label>State</label><input className="form-control" value={authForm.state} onChange={(event) => setAuthForm((current) => ({ ...current, state: event.target.value }))} required /></div></div><div className="form-group"><label>Pincode</label><input className="form-control" value={authForm.pincode} onChange={(event) => setAuthForm((current) => ({ ...current, pincode: event.target.value }))} required /></div></> : null}
          <button type="submit" className="btn btn-primary btn-lg">{authMode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>
        <div className="glass-card" style={{ marginTop: '1.5rem', padding: '1rem' }}>
          <p className="muted-copy">Demo accounts</p>
          <p><strong>User:</strong> user@rentease.com / user123</p>
          <p><strong>Admin:</strong> admin@rentease.com / admin123</p>
          {user ? <p className="badge badge-success">Logged in as {user.name}</p> : null}
        </div>
      </div>
    </main>
  );
}

function DocumentationPage() {
  return (
    <main className="section">
      <div className="container">
        <SectionHeader eyebrow="Technical documentation" title="RentEase analysis and project requirements" description="A concise PRD-style summary for the rental marketplace build." />
        <div className="grid grid-2">
          <div className="glass-card doc-card">
            <h3>Problem statement</h3>
            <p>Renters need a lower-cost, lower-friction path to temporary living setups, but current market options are limited, inflexible, and hard to manage during relocation.</p>
            <h3>Primary objectives</h3>
            <ul className="check-list"><li>Affordable monthly rental options</li><li>Flexible tenure plans</li><li>Simple furniture and appliance access</li><li>Convenient urban relocation support</li></ul>
          </div>
          <div className="glass-card doc-card">
            <h3>Functional requirements</h3>
            <ul className="check-list"><li>User registration and login</li><li>Browse furniture and appliance categories</li><li>View rental price, deposit, and tenure options</li><li>Add to cart, checkout, and schedule delivery</li><li>Manage active rentals and maintenance support</li></ul>
            <h3>Non-functional requirements</h3>
            <ul className="check-list"><li>Page load time under 3 seconds</li><li>Secure login and payment readiness</li><li>Accurate inventory tracking</li><li>Simple mobile-first UI</li></ul>
          </div>
          <div className="glass-card doc-card">
            <h3>Data and KPIs</h3>
            <p>Products track category, monthly rent, security deposit, tenure options, availability, and ratings. KPIs cover active rentals, MRR, utilization, retention, and maintenance resolution time.</p>
          </div>
          <div className="glass-card doc-card">
            <h3>Technology stack</h3>
            <p>Frontend uses React with Vite. Backend uses Node.js, Express, MongoDB, and JWT authentication. Deployment targets include Vercel, Netlify, or AWS.</p>
            <p className="muted-copy">This repository now contains a full client shell, API integration points, admin monitoring, and technical documentation for a deployment-ready demo.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  return <AuthProvider><BrowserRouter><Workspace /></BrowserRouter></AuthProvider>;
}
