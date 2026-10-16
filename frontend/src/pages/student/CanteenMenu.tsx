import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  ExternalLink,
  Store,
  Info,
  X
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  sellingPrice?: number;
  basePrice?: number;
  taxValue?: number;
  taxPercent?: number;
  istharaItemId?: string;
  istharaVendorId?: string;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl: string;
  vendorName?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

const OUTLETS = [
  'All Outlets',
  'Burger Haven',
  'DL Kitchen',
  'SHIVAN FOODS',
  'Brown Bear',
];

export const CanteenMenu: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [selectedOutlet, setSelectedOutlet] = useState<string>('All Outlets');
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
  const totalCartPrice = cart.reduce(
    (sum, ci) => sum + (ci.item.sellingPrice ?? ci.item.price) * ci.quantity,
    0
  );

  const filteredMenu = menu.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.vendorName && item.vendorName.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCatId === null || item.categoryId === selectedCatId;
    const matchesVeg = !vegOnly || item.isVeg;
    const matchesOutlet =
      selectedOutlet === 'All Outlets' ||
      (item.vendorName && item.vendorName.toLowerCase().includes(selectedOutlet.toLowerCase()));
    return matchesSearch && matchesCat && matchesVeg && matchesOutlet;
  });

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* ──────── HEADER ──────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              MR Food Court - 1
            </h1>
            <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
              Live Campus Outlets
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Malla Reddy University • In partnership with Isthara Parks & Food Court
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://isthara.com/mbd/%2BMR%20FOOD%20COURT%20-%201"
            target="_blank"
            rel="noopener noreferrer"
            className="clay-btn-secondary text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
          >
            Open Isthara Web
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            to="/app/canteen/orders"
            className="clay-btn-secondary text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
          >
            My Orders
          </Link>
        </div>
      </div>

      {/* ──────── FILTER BAR: SEARCH, OUTLETS & CATEGORIES ──────── */}
      <div className="space-y-3">
        {/* Search & Veg toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search dishes, burgers, biryanis, dosa, rolls..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="clay-input pl-9 pr-8"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 cursor-pointer hover:bg-zinc-50 transition-colors shrink-0">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 w-3.5 h-3.5"
            />
            <span>Veg Only</span>
          </label>
        </div>

        {/* Outlet Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-zinc-400 text-xs font-medium mr-1 flex items-center gap-1 shrink-0">
            <Store className="w-3.5 h-3.5" /> Outlet:
          </span>
          {OUTLETS.map((outlet) => {
            const isActive = selectedOutlet === outlet;
            return (
              <button
                key={outlet}
                onClick={() => setSelectedOutlet(outlet)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border ${
                  isActive
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                {outlet}
              </button>
            );
          })}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedCatId(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border ${
              selectedCatId === null
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border ${
                selectedCatId === cat.id
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ──────── RESPONSIVE MENU GRID (Laptop 3-Col, Tablet 2-Col, Mobile 1-Col) ──────── */}
      {filteredMenu.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-xs text-zinc-500 space-y-2">
          <Info className="w-6 h-6 text-zinc-400 mx-auto" />
          <p className="font-semibold text-zinc-800 text-sm">No items found</p>
          <p>Try switching outlets or clearing your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMenu.map((item) => {
            const qty = getItemQty(item.id);
            const selling = item.sellingPrice ?? item.price;

            return (
              <div
                key={item.id}
                className="bg-white border border-zinc-200/90 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-300 transition-all hover:shadow-xs group"
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover bg-zinc-100 shrink-0 border border-zinc-100"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-400 text-xs font-medium">
                      Food
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      {/* Veg / Non-Veg Indicator */}
                      <span
                        className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                          item.isVeg
                            ? 'border-emerald-600'
                            : 'border-rose-600'
                        }`}
                        title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                      </span>

                      {item.vendorName && (
                        <span className="text-[10px] font-medium text-zinc-500 truncate">
                          {item.vendorName}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-sm text-zinc-900 leading-snug line-clamp-1 group-hover:text-zinc-950">
                      {item.name}
                    </h3>

                    <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                      {item.description || item.categoryName}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Price & Quantity Stepper */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-zinc-900">
                      ₹{selling.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">incl. 5% tax</span>
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => updateCartQty(item, 1)}
                      className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800 transition-colors shadow-xs"
                    >
                      Add +
                    </button>
                  ) : (
                    <div className="flex items-center border border-zinc-300 rounded-lg overflow-hidden bg-white shadow-xs">
                      <button
                        onClick={() => updateCartQty(item, -1)}
                        className="px-2.5 py-1 text-zinc-700 hover:bg-zinc-100 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 py-1 text-xs font-semibold text-zinc-900 min-w-[24px] text-center">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateCartQty(item, 1)}
                        className="px-2.5 py-1 text-zinc-700 hover:bg-zinc-100 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ──────── FLOATING / STICKY CART FOOTER BAR ──────── */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-16 md:bottom-6 left-0 right-0 z-30 px-4 pointer-events-none">
          <div className="max-w-xl mx-auto bg-zinc-900 text-white rounded-xl shadow-xl px-4 py-3 flex items-center justify-between pointer-events-auto border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-xs text-white">
                {totalCartCount}
              </div>
              <div>
                <div className="text-xs font-semibold">
                  {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} in Cart
                </div>
                <div className="text-[11px] text-zinc-400">
                  Total: <span className="text-white font-bold">₹{totalCartPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/app/canteen/cart')}
              className="px-4 py-2 bg-white text-zinc-900 rounded-lg text-xs font-semibold hover:bg-zinc-100 transition-colors inline-flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              View Cart & Checkout →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
