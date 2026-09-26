import { Link, Route, Routes } from 'react-router-dom';

function Home() {
  return (
    <main className="hero">
      <p className="eyebrow">THIRANEX STORE</p>
      <h1>Everything you need. One simple store.</h1>
      <p>Browse products, add them to your cart, checkout, and track your orders.</p>
      <Link className="button" to="/products">Shop products</Link>
    </main>
  );
}

function Products() {
  return (
    <main className="page">
      <h2>Products</h2>
      <p>The product catalogue is connected to the backend API next.</p>
    </main>
  );
}

export default function App() {
  return (
    <>
      <header className="nav">
        <Link className="logo" to="/">Thiranex</Link>
        <nav>
          <Link to="/products">Products</Link>
          <Link to="/login">Login</Link>
          <Link to="/cart">Cart</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="*" element={<main className="page"><h2>Coming next</h2></main>} />
      </Routes>
    </>
  );
}
