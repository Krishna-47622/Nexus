import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Search, ShoppingBag, Plus, Minus, Check } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface MenuItem {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export const CanteenMenu: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('canteen_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const navigate = useNavigate();

  useEffect(() => {
    api.get('/canteen/categories').then((res) => {
      setCategories(res.data);
      if (res.data.length > 0) setSelectedCatId(res.data[0].id);
    });

    api.get('/canteen/menu').then((res) => {
      setMenu(res.data);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('canteen_cart', JSON.stringify(cart));
  }, [cart]);

  const updateCartQty = (item: MenuItem, delta: number) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((ci) => ci.item.id === item.id);
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        const newQty = newCart[existingIndex].quantity + delta;
        if (newQty <= 0) {
          newCart.splice(existingIndex, 1);
        } else {
          newCart[existingIndex].quantity = newQty;
        }
        return newCart;
      } else if (delta > 0) {
        return [...prevCart, { item, quantity: 1 }];
      }
      return prevCart;
    });
  };

  const getItemQty = (itemId: number) => {
    const found = cart.find((ci) => ci.item.id === itemId);
    return found ? found.quantity : 0;
  };

  const totalCartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const totalCartPrice = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  const filteredMenu = menu.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCatId === null || item.categoryId === selectedCatId;
    const matchesVeg = !vegOnly || item.isVeg;
    return matchesSearch && matchesCat && matchesVeg;
  });

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Canteen Menu</h2>
        <Link to="/app/canteen/orders" className="text-xs font-semibold text-primary hover:underline">
          My Order History →
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search food items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-sm text-xs focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Dynamic Categories Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[70%] no-scrollbar">
            <button
              onClick={() => setSelectedCatId(null)}
              className={`px-3 py-1 text-xs font-semibold rounded-sm whitespace-nowrap border ${
                selectedCatId === null
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-sm whitespace-nowrap border ${
                  selectedCatId === cat.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              className="rounded-sm text-primary focus:ring-0"
            />
            Veg Only
          </label>
        </div>
      </div>

      {/* Menu List */}
      <div className="space-y-2">
        {filteredMenu.length === 0 ? (
          <div className="bg-white border border-slate-200 p-8 rounded-sm text-center text-xs text-slate-500">
            No items available in this category.
          </div>
        ) : (
          filteredMenu.map((item) => {
            const qty = getItemQty(item.id);
            return (
              <div key={item.id} className="bg-white border border-slate-200 p-3 rounded-sm flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 border flex items-center justify-center text-[8px] font-bold ${item.isVeg ? 'border-emerald-600 text-emerald-600' : 'border-red-600 text-red-600'}`}>
                      ●
                    </span>
                    <span className="font-bold text-sm text-slate-900">{item.name}</span>
                  </div>
                  {item.description && <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>}
                  <div className="text-sm font-bold text-slate-900">₹{item.price.toFixed(2)}</div>
                </div>

                <div>
                  {qty === 0 ? (
                    <button
                      onClick={() => updateCartQty(item, 1)}
                      className="px-3 py-1.5 bg-slate-100 border border-slate-300 text-primary font-bold text-xs rounded-sm hover:bg-primary hover:text-white transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> ADD
                    </button>
                  ) : (
                    <div className="flex items-center border border-primary rounded-sm bg-white overflow-hidden">
                      <button
                        onClick={() => updateCartQty(item, -1)}
                        className="px-2 py-1 bg-slate-100 text-primary hover:bg-slate-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-bold text-primary">{qty}</span>
                      <button
                        onClick={() => updateCartQty(item, 1)}
                        className="px-2 py-1 bg-primary text-white hover:bg-primary-dark"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Cart Summary Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-16 left-4 right-4 max-w-md mx-auto z-40 bg-primary text-white px-4 py-3 rounded-sm shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold">{totalCartCount} items selected</div>
            <div className="text-base font-bold">Total: ₹{totalCartPrice.toFixed(2)}</div>
          </div>
          <button
            onClick={() => navigate('/app/canteen/cart')}
            className="px-4 py-2 bg-white text-primary font-bold text-xs rounded-sm hover:bg-slate-100 flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" /> View Cart & Checkout
          </button>
        </div>
      )}
    </div>
  );
};
