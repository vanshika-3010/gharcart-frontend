import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiArrowLeft, FiChevronDown, FiChevronUp, FiPlus, FiMinus, FiSearch } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { itemsPageStyles } from "../assets/dummyStyles";

// Backend base URL
const BACKEND_URL = import.meta.env.VITE_API_URL;

const ProductCard = ({ item }) => {
  const { addToCart, removeFromCart, updateQuantity, cart } = useCart();

  const productId = item._id;
  const cartItem = cart.find(ci => ci.productId === productId);
  const lineId = cartItem?.id;
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => addToCart(productId, 1);
  const handleIncrement = () => updateQuantity(lineId, quantity + 1);
  const handleDecrement = () => {
    if (quantity <= 1) removeFromCart(lineId);
    else updateQuantity(lineId, quantity - 1);
  };

  // Image URL handling
  const rawImage = item.imageUrl || item.image;
  const imgSrc = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${BACKEND_URL}${rawImage}`
    : "/placeholder.png"; // fallback if missing

  return (
    <div className={itemsPageStyles.productCard}>
      <div className={itemsPageStyles.imageContainer}>
        <img src={imgSrc} alt={item.name} className={itemsPageStyles.productImage} />
      </div>
      <div className={itemsPageStyles.cardContent}>
        <h3 className={itemsPageStyles.productTitle}>{item.name}</h3>
        <p className={itemsPageStyles.productDescription}>
          {item.description || `Fresh organic ${item.name.toLowerCase()} sourced locally`}
        </p>
        <div className={itemsPageStyles.priceContainer}>
          <span className={itemsPageStyles.currentPrice}>₹{item.price.toFixed(2)}</span>
          {item.oldPrice && <span className={itemsPageStyles.oldPrice}>₹{item.oldPrice.toFixed(2)}</span>}
        </div>
        <div className="mt-3">
          {quantity > 0 ? (
            <div className={itemsPageStyles.quantityControls}>
              <button onClick={handleDecrement} className={`${itemsPageStyles.quantityButton} ${itemsPageStyles.quantityButtonLeft}`}><FiMinus /></button>
              <span className={itemsPageStyles.quantityValue}>{quantity}</span>
              <button onClick={handleIncrement} className={`${itemsPageStyles.quantityButton} ${itemsPageStyles.quantityButtonRight}`}><FiPlus /></button>
            </div>
          ) : (
            <button onClick={handleAddToCart} className={itemsPageStyles.addButton}>
              <span>Add to Cart</span>
              <span className={itemsPageStyles.addButtonArrow}>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Items = () => {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [allExpanded, setAllExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Read search query from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const search = queryParams.get("search");
    if (search) setSearchTerm(search);
  }, [location]);

  // Fetch items from backend
  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/items`)
      .then(res => {
        const products = Array.isArray(res.data) ? res.data : res.data.products || [];
        const grouped = products.reduce((acc, item) => {
          const cat = item.category || "Uncategorized";
          if (!acc[cat]) acc[cat] = { id: cat, name: cat, items: [] };
          acc[cat].items.push(item);
          return acc;
        }, {});
        setCategories(Object.values(grouped));
      })
      .catch(err => console.error("Items fetch error:", err));
  }, []);

  const itemMatchesSearch = (item, term) => {
    if (!term) return true;
    const words = term.trim().toLowerCase().split(/\s+/);
    return words.every(w => item.name.toLowerCase().includes(w));
  };

  const filteredCategories = searchTerm
    ? categories
        .map(cat => ({ ...cat, items: cat.items.filter(item => itemMatchesSearch(item, searchTerm)) }))
        .filter(cat => cat.items.length > 0)
    : categories;

  const clearSearch = () => {
    setSearchTerm("");
    navigate("/items");
  };

  const toggleCategory = catId => setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  const toggleAllCategories = () => {
    if (allExpanded) setExpandedCategories({});
    else {
      const expanded = {};
      categories.forEach(cat => (expanded[cat.id] = true));
      setExpandedCategories(expanded);
    }
    setAllExpanded(!allExpanded);
  };

  return (
    <div className={itemsPageStyles.page}>
      <div className={itemsPageStyles.container}>
        <header className={itemsPageStyles.header}>
          <Link to="/" className={itemsPageStyles.backLink}><FiArrowLeft className="mr-2" /> Back</Link>
          <h1 className={itemsPageStyles.mainTitle}><span className={itemsPageStyles.titleSpan}>ORGANIC</span> PANTRY</h1>
          <p className={itemsPageStyles.subtitle}>Premium quality groceries sourced from local organic farms</p>
        </header>

        {/* Search Bar */}
        <div className={itemsPageStyles.searchContainer}>
          <form
            onSubmit={e => { e.preventDefault(); if (searchTerm.trim()) navigate(`/items?search=${encodeURIComponent(searchTerm)}`); }}
            className={itemsPageStyles.searchForm}
          >
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search fruits, vegetables, meats..."
              className={itemsPageStyles.searchInput}
            />
            <button type="submit" className={itemsPageStyles.searchButton}><FiSearch /></button>
          </form>
        </div>

        <div className="flex justify-center mb-10">
          <button onClick={toggleAllCategories} className={itemsPageStyles.expandButton}>
            <span className="mr-2 font-medium">{allExpanded ? "Collapse All" : "Expand All"}</span>
            {allExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>

        {filteredCategories.length > 0 ? filteredCategories.map(cat => {
          const isExpanded = expandedCategories[cat.id] || allExpanded;
          const visibleItems = isExpanded ? cat.items : cat.items.slice(0, 4);
          const hasMore = cat.items.length > 4;
          return (
            <section key={cat.id} className={itemsPageStyles.categorySection}>
              <div className={itemsPageStyles.categoryHeader}><h2 className={itemsPageStyles.categoryTitle}>{cat.name}</h2></div>
              <div className={itemsPageStyles.productsGrid}>
                {visibleItems.map(item => <ProductCard key={item._id} item={item} />)}
              </div>
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button onClick={() => toggleCategory(cat.id)} className={itemsPageStyles.showMoreButton}>
                    <span className="mr-2 font-medium">
                      {isExpanded ? `Show Less ${cat.name}` : `Show More ${cat.name} (${cat.items.length - 4}+)`}
                    </span>
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                </div>
              )}
            </section>
          );
        }) : (
          <div className={itemsPageStyles.noProductsContainer}>
            <h3 className={itemsPageStyles.noProductsTitle}>No products found</h3>
            <button onClick={clearSearch} className={itemsPageStyles.clearSearchButton}>Clear Search</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Items;