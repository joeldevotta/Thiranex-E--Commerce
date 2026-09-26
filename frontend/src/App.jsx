import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

async function api(path, options = {}) {
  const token = localStorage.getItem('thiranex_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

function useAuth() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('thiranex_user') || 'null'));
  const login = (data) => { localStorage.setItem('thiranex_token', data.token); localStorage.setItem('thiranex_user', JSON.stringify(data.user)); setUser(data.user); };
  const logout = () => { localStorage.removeItem('thiranex_token'); localStorage.removeItem('thiranex_user'); setUser(null); };
  return { user, login, logout };
}

function Layout({ user, logout, cartCount }) {
  return <>
    <header className="nav"><Link className="logo" to="/">THIRANEX<span>.</span></Link><nav>
      <Link to="/products">Shop</Link>{user && <Link to="/orders">Orders</Link>}{user?.role === 'admin' && <Link to="/admin">Admin</Link>}
      <Link className="cart-link" to="/cart">Cart <b>{cartCount}</b></Link>
      {user ? <button className="nav-user" onClick={logout}>Logout</button> : <Link className="login-link" to="/login">Login</Link>}
    </nav></header>
  </>;
}

function Home() {
  return <main>
    <section className="hero"><div><p className="eyebrow">THIRANEX STORE · 2026</p><h1>Good products.<br/><em>Simple shopping.</em></h1><p className="hero-copy">A clean online store built for browsing, checkout and real-time order tracking.</p><Link className="button" to="/products">Explore products →</Link></div><div className="hero-card"><span>NEW DROP</span><strong>Tech & lifestyle</strong><small>Curated products, delivered simply.</small></div></section>
    <section className="features"><div><strong>01</strong><h3>Browse</h3><p>Find products from the catalogue.</p></div><div><strong>02</strong><h3>Checkout</h3><p>Add items and place an order.</p></div><div><strong>03</strong><h3>Track</h3><p>Follow your order from placed to delivered.</p></div></section>
  </main>;
}

function Products({ addToCart }) {
  const [products, setProducts] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [query, setQuery] = useState('');
  useEffect(() => { api('/products').then(setProducts).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  const filtered = products.filter(p => `${p.name} ${p.category || ''}`.toLowerCase().includes(query.toLowerCase()));
  return <main className="page"><div className="page-head"><div><p className="eyebrow">CATALOGUE</p><h2>Shop products</h2></div><input className="search" placeholder="Search products..." value={query} onChange={e => setQuery(e.target.value)} /></div>
    {loading && <div className="notice">Loading products...</div>}{error && <div className="notice error">{error}. Start the backend and connect MongoDB to load products.</div>}
    {!loading && !error && !filtered.length && <div className="empty"><h3>No products yet</h3><p>Use the admin dashboard to add your first product.</p></div>}
    <div className="grid">{filtered.map(p => <ProductCard key={p._id} product={p} addToCart={addToCart} />)}</div>
  </main>;
}

function ProductCard({ product, addToCart }) {
  return <article className="product-card"><Link to={`/products/${product._id}`}><div className="product-image">{product.image ? <img src={product.image} alt={product.name} /> : <span>{(product.name || 'P').slice(0,1)}</span>}</div><div className="product-info"><small>{product.category || 'PRODUCT'}</small><h3>{product.name}</h3><strong>{money(product.price)}</strong></div></Link><button className="add" disabled={product.stock === 0} onClick={() => addToCart(product)}>{product.stock === 0 ? 'Out of stock' : 'Add to cart +'}</button></article>;
}

function ProductDetails({ addToCart }) {
  const { id } = useParams(); const [p, setP] = useState(null); const [error, setError] = useState('');
  useEffect(() => { api(`/products/${id}`).then(setP).catch(e => setError(e.message)); }, [id]);
  if (error) return <main className="page"><div className="notice error">{error}</div></main>;
  if (!p) return <main className="page"><div className="notice">Loading...</div></main>;
  return <main className="page detail"><div className="detail-image">{p.image ? <img src={p.image} alt={p.name}/> : <span>{p.name.slice(0,1)}</span>}</div><div className="detail-copy"><p className="eyebrow">{p.category || 'PRODUCT'}</p><h2>{p.name}</h2><p className="price">{money(p.price)}</p><p>{p.description || 'A quality product from the Thiranex catalogue.'}</p><p className="stock">{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</p><button className="button" disabled={!p.stock} onClick={() => addToCart(p)}>Add to cart</button></div></main>;
}

function Auth({ login, mode = 'login' }) {
  const navigate = useNavigate(); const [form, setForm] = useState({ name: '', email: '', password: '' }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async e => { e.preventDefault(); setBusy(true); setError(''); try { const data = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(form) }); login(data); navigate('/products'); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <main className="auth"><form className="auth-card" onSubmit={submit}><p className="eyebrow">THIRANEX ACCOUNT</p><h2>{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h2><p>{mode === 'login' ? 'Login to view orders and checkout.' : 'Join to start shopping.'}</p>{mode === 'register' && <input placeholder="Full name" required value={form.name} onChange={e => setForm({...form,name:e.target.value})}/>}<input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({...form,email:e.target.value})}/><input type="password" placeholder="Password" required minLength="6" value={form.password} onChange={e => setForm({...form,password:e.target.value})}/>{error && <div className="notice error">{error}</div>}<button className="button" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}</button><Link to={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}</Link></form></main>;
}

function Cart({ cart, updateQty, remove, user }) {
  const navigate = useNavigate(); const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return <main className="page"><div className="page-head"><div><p className="eyebrow">YOUR BAG</p><h2>Shopping cart</h2></div></div>{!cart.length ? <div className="empty"><h3>Your cart is empty.</h3><Link className="button" to="/products">Start shopping</Link></div> : <div className="cart-layout"><div>{cart.map(i => <div className="cart-row" key={i._id}><div className="mini-image">{i.image ? <img src={i.image} alt=""/> : i.name[0]}</div><div><h3>{i.name}</h3><p>{money(i.price)} each</p></div><div className="qty"><button onClick={() => updateQty(i._id, -1)}>−</button><b>{i.qty}</b><button onClick={() => updateQty(i._id, 1)}>+</button></div><strong>{money(i.price*i.qty)}</strong><button className="remove" onClick={() => remove(i._id)}>×</button></div>)}</div><aside className="summary"><h3>Order summary</h3><div><span>Subtotal</span><strong>{money(total)}</strong></div><div><span>Delivery</span><strong>Free</strong></div><hr/><div className="total"><span>Total</span><strong>{money(total)}</strong></div><button className="button full" onClick={() => user ? navigate('/checkout') : navigate('/login')}>Checkout</button></aside></div>}</main>;
}

function Checkout({ cart, clearCart, user }) {
  const navigate = useNavigate(); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const placeOrder=async()=>{ if(!cart.length)return; setBusy(true); try { await api('/orders',{method:'POST',body:JSON.stringify({items:cart.map(i=>({product:i._id,quantity:i.qty,price:i.price})),totalPrice:total})}); clearCart(); navigate('/orders'); } catch(e){setError(e.message)} finally{setBusy(false)} };
  if(!user) return <main className="page"><div className="notice error">Please login before checkout.</div></main>;
  return <main className="page checkout"><div><p className="eyebrow">CHECKOUT</p><h2>Complete your order</h2><div className="checkout-box"><h3>Customer</h3><p>{user.name} · {user.email}</p><h3>Payment</h3><div className="fake-payment">Demo checkout · No real payment is processed</div><button className="button full" disabled={busy||!cart.length} onClick={placeOrder}>{busy?'Placing order...':`Place order · ${money(total)}`}</button>{error&&<div className="notice error">{error}</div>}</div></div></main>;
}

function Orders() {
  const [orders,setOrders]=useState([]); const [error,setError]=useState('');
  useEffect(()=>{api('/orders/myorders').then(setOrders).catch(e=>setError(e.message));},[]);
  return <main className="page"><p className="eyebrow">ACCOUNT</p><h2>My orders</h2>{error&&<div className="notice error">{error}</div>}{!orders.length&&!error&&<div className="empty"><h3>No orders yet.</h3><Link className="button" to="/products">Browse products</Link></div>}<div className="orders">{orders.map(o=><OrderCard key={o._id} order={o}/>)}</div></main>;
}

function OrderCard({order}) { const steps=['Pending','Processing','Shipped','Delivered']; const active=steps.indexOf(order.status); return <article className="order-card"><div className="order-top"><div><small>ORDER #{order._id.slice(-8).toUpperCase()}</small><h3>{money(order.totalPrice)}</h3></div><span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span></div><div className="tracker">{steps.map((s,i)=><div className={i<=active?'step active':'step'} key={s}><span>{i<=active?'✓':i+1}</span><small>{s}</small></div>)}</div><p className="order-date">Placed {new Date(order.createdAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</p></article>; }

function Admin() {
  const [products,setProducts]=useState([]); const [orders,setOrders]=useState([]); const [form,setForm]=useState({name:'',price:'',stock:'',category:'',image:'',description:''}); const [editing,setEditing]=useState(null); const [message,setMessage]=useState('');
  const load=()=>Promise.all([api('/products'),api('/orders')]).then(([p,o])=>{setProducts(p);setOrders(o)}).catch(e=>setMessage(e.message)); useEffect(()=>{load()},[]);
  const save=async e=>{e.preventDefault(); try { const path=editing?`/products/${editing}`:'/products'; const method=editing?'PUT':'POST'; await api(path,{method,body:JSON.stringify({...form,price:Number(form.price),stock:Number(form.stock)})}); setForm({name:'',price:'',stock:'',category:'',image:'',description:''});setEditing(null);setMessage('Saved');load(); }catch(e){setMessage(e.message)} };
  const del=async id=>{if(!confirm('Delete this product?'))return;try{await api(`/products/${id}`,{method:'DELETE'});load()}catch(e){setMessage(e.message)}};
  const status=async(id,s)=>{try{await api(`/orders/${id}/status`,{method:'PUT',body:JSON.stringify({status:s})});load()}catch(e){setMessage(e.message)}};
  return <main className="page admin"><div className="page-head"><div><p className="eyebrow">ADMIN</p><h2>Store dashboard</h2></div></div><div className="stats"><div><b>{products.length}</b><span>Products</span></div><div><b>{orders.length}</b><span>Orders</span></div><div><b>{money(orders.reduce((s,o)=>s+o.totalPrice,0))}</b><span>Order value</span></div></div><div className="admin-grid"><form className="admin-form" onSubmit={save}><h3>{editing?'Edit product':'Add product'}</h3>{['name','price','stock','category','image','description'].map(k=><input key={k} required={['name','price','stock'].includes(k)} placeholder={k[0].toUpperCase()+k.slice(1)} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>)}<button className="button">{editing?'Update':'Add product'}</button>{editing&&<button type="button" className="ghost" onClick={()=>{setEditing(null);setForm({name:'',price:'',stock:'',category:'',image:'',description:''})}}>Cancel</button>}{message&&<p>{message}</p>}</form><div className="admin-list"><h3>Products</h3>{products.map(p=><div className="admin-row" key={p._id}><span><b>{p.name}</b><small>{money(p.price)} · {p.stock} stock</small></span><span><button className="ghost" onClick={()=>{setEditing(p._id);setForm({...p,price:String(p.price),stock:String(p.stock)})}}>Edit</button><button className="danger" onClick={()=>del(p._id)}>Delete</button></span></div>)}<h3 className="orders-title">Orders</h3>{orders.map(o=><div className="admin-row" key={o._id}><span><b>#{o._id.slice(-8).toUpperCase()}</b><small>{o.user?.name || 'Customer'} · {money(o.totalPrice)}</small></span><select value={o.status} onChange={e=>status(o._id,e.target.value)}><option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option></select></div>)}</div></div></main>;
}

export default function App(){
  const {user,login,logout}=useAuth(); const [cart,setCart]=useState(()=>JSON.parse(localStorage.getItem('thiranex_cart')||'[]')); const saveCart=(c)=>{setCart(c);localStorage.setItem('thiranex_cart',JSON.stringify(c))};
  const addToCart=p=>saveCart(cart.some(i=>i._id===p._id)?cart.map(i=>i._id===p._id?{...i,qty:Math.min(i.qty+1,p.stock)}:i):[...cart,{...p,qty:1}]);
  const updateQty=(id,d)=>saveCart(cart.map(i=>i._id===id?{...i,qty:Math.max(1,Math.min(i.qty+d,i.stock))}:i)); const remove=id=>saveCart(cart.filter(i=>i._id!==id)); const clearCart=()=>saveCart([]); const count=useMemo(()=>cart.reduce((s,i)=>s+i.qty,0),[cart]);
  return <><Layout user={user} logout={logout} cartCount={count}/><Routes><Route path="/" element={<Home/>}/><Route path="/products" element={<Products addToCart={addToCart}/>}/><Route path="/products/:id" element={<ProductDetails addToCart={addToCart}/>}/><Route path="/login" element={<Auth login={login}/>}/><Route path="/register" element={<Auth login={login} mode="register"/>}/><Route path="/cart" element={<Cart cart={cart} updateQty={updateQty} remove={remove} user={user}/>}/><Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} user={user}/>}/><Route path="/orders" element={user?<Orders/>:<Auth login={login}/>}/><Route path="/admin" element={user?.role==='admin'?<Admin/>:<main className="page"><div className="notice error">Admin access required.</div></main>}/><Route path="*" element={<main className="page"><h2>Page not found</h2><Link to="/">Back home</Link></main>}/></Routes><footer>© 2026 Thiranex · Full-stack MERN e-commerce project</footer></>;
}
