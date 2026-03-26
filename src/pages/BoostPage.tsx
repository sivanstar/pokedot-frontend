import React, { useState, useEffect, useCallback } from 'react';
import {
  Rocket, Search, Filter, ChevronDown, ChevronUp,
  Zap, CheckCircle, Clock, AlertCircle, RefreshCw,
  Instagram, Youtube, Twitter, Facebook, Send,
  TrendingUp, Users, Eye, Heart, Star, ArrowRight,
  Wallet, Package, X, ExternalLink
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import api from '../../api';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SmmService {
  _id: string;
  serviceId: number;
  name: string;
  category: string;
  type: string;
  pointsRequired: number;
  min: number;
  max: number;
  refill: boolean;
  cancel: boolean;
  description?: string;
}

interface SmmOrder {
  _id: string;
  serviceId: number;
  link: string;
  quantity: number;
  pointsSpent: number;
  status: string;
  externalOrderId: string;
  createdAt: string;
  service?: { name: string; customName?: string; category: string };
}

// ─── Category Icon Map ─────────────────────────────────────────────────────────
const getCategoryIcon = (cat: string) => {
  const l = cat.toLowerCase();
  if (l.includes('instagram')) return <Instagram className="w-4 h-4" />;
  if (l.includes('youtube')) return <Youtube className="w-4 h-4" />;
  if (l.includes('twitter') || l.includes('x ')) return <Twitter className="w-4 h-4" />;
  if (l.includes('facebook')) return <Facebook className="w-4 h-4" />;
  if (l.includes('telegram')) return <Send className="w-4 h-4" />;
  if (l.includes('tiktok')) return <TrendingUp className="w-4 h-4" />;
  return <Rocket className="w-4 h-4" />;
};

const getCategoryColor = (cat: string) => {
  const l = cat.toLowerCase();
  if (l.includes('instagram')) return 'from-pink-500 to-purple-600';
  if (l.includes('youtube')) return 'from-red-500 to-red-600';
  if (l.includes('twitter') || l.includes('x ')) return 'from-sky-400 to-blue-500';
  if (l.includes('facebook')) return 'from-blue-600 to-blue-700';
  if (l.includes('telegram')) return 'from-cyan-400 to-blue-500';
  if (l.includes('tiktok')) return 'from-gray-800 to-gray-900';
  return 'from-primary-500 to-secondary-500';
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:     { label: 'Pending',     color: 'text-yellow-600 bg-yellow-50',  icon: <Clock className="w-3.5 h-3.5" /> },
  processing:  { label: 'Processing',  color: 'text-blue-600 bg-blue-50',      icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" /> },
  in_progress: { label: 'In Progress', color: 'text-indigo-600 bg-indigo-50',  icon: <Zap className="w-3.5 h-3.5" /> },
  completed:   { label: 'Completed',   color: 'text-green-600 bg-green-50',    icon: <CheckCircle className="w-3.5 h-3.5" /> },
  partial:     { label: 'Partial',     color: 'text-orange-600 bg-orange-50',  icon: <AlertCircle className="w-3.5 h-3.5" /> },
  cancelled:   { label: 'Cancelled',   color: 'text-gray-500 bg-gray-100',     icon: <X className="w-3.5 h-3.5" /> },
  failed:      { label: 'Failed',      color: 'text-red-600 bg-red-50',        icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

// ─── Order Modal ───────────────────────────────────────────────────────────────
const OrderModal: React.FC<{
  service: SmmService;
  balance: number;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ service, balance, onClose, onSuccess }) => {
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState(service.min);
  const [loading, setLoading] = useState(false);

  const pointsCost = Math.max(
    service.pointsRequired,
    Math.ceil((quantity / service.min) * service.pointsRequired)
  );
  const canAfford = balance >= pointsCost;

  const handleSubmit = async () => {
    if (!link.trim()) return toast.error('Please enter a valid URL');
    if (!link.startsWith('http')) return toast.error('URL must start with http:// or https://');
    if (quantity < service.min || quantity > service.max)
      return toast.error(`Quantity must be between ${service.min} and ${service.max}`);
    if (!canAfford) return toast.error('Insufficient points');

    setLoading(true);
    try {
      const res = await api.post('/smm/order', {
        serviceId: service._id,
        link: link.trim(),
        quantity
      });
      if (res.data.success) {
        toast.success('Order placed! Your boost is being processed 🚀');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getCategoryColor(service.category)} p-5 rounded-t-2xl`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-xs mb-1">{service.category}</p>
              <h3 className="text-white font-bold text-lg leading-tight">{service.name}</h3>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Service info */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Min</p>
              <p className="font-bold text-gray-800">{service.min.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Max</p>
              <p className="font-bold text-gray-800">{service.max.toLocaleString()}</p>
            </div>
            <div className="bg-primary-50 rounded-xl p-3">
              <p className="text-xs text-primary-600">Base Cost</p>
              <p className="font-bold text-primary-700">{service.pointsRequired.toLocaleString()} pts</p>
            </div>
          </div>

          {/* Link input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Profile / Post URL
            </label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="url"
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
              />
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={e => setQuantity(Math.max(service.min, Math.min(service.max, parseInt(e.target.value) || service.min)))}
              min={service.min}
              max={service.max}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Range: {service.min.toLocaleString()} – {service.max.toLocaleString()}</p>
          </div>

          {/* Cost summary */}
          <div className={`rounded-xl p-4 ${canAfford ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Points Required</p>
                <p className={`text-2xl font-black ${canAfford ? 'text-green-700' : 'text-red-600'}`}>
                  {pointsCost.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Your Balance</p>
                <p className="text-lg font-bold text-gray-700">{balance.toLocaleString()}</p>
              </div>
            </div>
            {!canAfford && (
              <p className="text-xs text-red-600 mt-2">
                ⚠️ Need {(pointsCost - balance).toLocaleString()} more points
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !canAfford}
            className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Processing...</>
            ) : (
              <><Rocket className="w-4 h-4" /> Place Order</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Service Card ──────────────────────────────────────────────────────────────
const ServiceCard: React.FC<{
  service: SmmService;
  balance: number;
  onOrder: (s: SmmService) => void;
}> = ({ service, balance, onOrder }) => {
  const canAfford = balance >= service.pointsRequired;

  return (
    <div className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${canAfford ? 'border-gray-100 hover:border-primary-200' : 'border-gray-100 opacity-80'}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">{service.type}</p>
            <p className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">{service.name}</p>
          </div>
          <div className={`flex-shrink-0 rounded-lg p-1.5 bg-gradient-to-br ${getCategoryColor(service.category)} text-white`}>
            {getCategoryIcon(service.category)}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {service.min.toLocaleString()}–{service.max.toLocaleString()}
          </span>
          {service.refill && (
            <span className="flex items-center gap-1 text-green-600">
              <RefreshCw className="w-3 h-3" /> Refill
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">from</p>
            <p className={`font-black text-lg ${canAfford ? 'text-primary-600' : 'text-gray-400'}`}>
              {service.pointsRequired.toLocaleString()} <span className="text-xs font-semibold">pts</span>
            </p>
          </div>
          <button
            onClick={() => onOrder(service)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${
              canAfford
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Boost <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export const BoostPage: React.FC = () => {
  const { balance, syncWalletFromBackend } = useWallet();

  const [tab, setTab] = useState<'services' | 'orders'>('services');
  const [services, setServices] = useState<Record<string, SmmService[]>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [orders, setOrders] = useState<SmmOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedService, setSelectedService] = useState<SmmService | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/smm/services');
      if (res.data.success) {
        setServices(res.data.services);
        setCategories(res.data.categories);
        // Expand first category by default
        if (res.data.categories.length > 0) {
          setExpandedCategories(new Set([res.data.categories[0]]));
        }
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No services synced yet
        setServices({});
      } else {
        toast.error('Failed to load services');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/smm/orders');
      if (res.data.success) setOrders(res.data.orders);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => { loadServices(); }, [loadServices]);
  useEffect(() => { if (tab === 'orders') loadOrders(); }, [tab, loadOrders]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  // Filter services
  const filteredServices = Object.entries(services).reduce<Record<string, SmmService[]>>((acc, [cat, list]) => {
    if (selectedCategory && cat !== selectedCategory) return acc;
    const filtered = list.filter(s =>
      !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length) acc[cat] = filtered;
    return acc;
  }, {});

  const totalServices = Object.values(services).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-5xl">

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-violet-600 via-primary-500 to-secondary-500 rounded-2xl p-6 md:p-8 text-white mb-6 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute rounded-full bg-white" style={{
                width: `${60 + i * 20}px`, height: `${60 + i * 20}px`,
                top: `${-20 + i * 15}%`, right: `${-5 + i * 8}%`, opacity: 0.3
              }} />
            ))}
          </div>
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-6 h-6" />
                <h1 className="text-xl md:text-2xl font-black">Social Media Boost</h1>
              </div>
              <p className="text-white/85 text-sm md:text-base mb-3">
                Use your points to grow your social media presence
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
                  <Wallet className="w-3 h-3 inline mr-1" />
                  {balance.toLocaleString()} pts available
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
                  {totalServices} services
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
                  Min. 5,000 pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6 w-fit">
          {(['services', 'orders'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                tab === t
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'services' ? <><Package className="w-4 h-4 inline mr-1.5" />Services</> : <><Clock className="w-4 h-4 inline mr-1.5" />My Orders</>}
            </button>
          ))}
        </div>

        {/* ── SERVICES TAB ── */}
        {tab === 'services' && (
          <>
            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white text-sm"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white text-sm appearance-none w-full sm:w-auto"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <RefreshCw className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading services...</p>
              </div>
            ) : Object.keys(filteredServices).length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Rocket className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No services available yet</p>
                <p className="text-gray-400 text-sm mt-1">Services will appear here once synced by admin</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(filteredServices).map(([category, list]) => (
                  <div key={category} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Category header */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getCategoryColor(category)} text-white flex items-center justify-center`}>
                          {getCategoryIcon(category)}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-800">{category}</p>
                          <p className="text-xs text-gray-400">{list.length} services</p>
                        </div>
                      </div>
                      {expandedCategories.has(category)
                        ? <ChevronUp className="w-4 h-4 text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />
                      }
                    </button>

                    {expandedCategories.has(category) && (
                      <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {list.map(service => (
                          <ServiceCard
                            key={service._id}
                            service={service}
                            balance={balance}
                            onOrder={setSelectedService}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">My Boost Orders</h2>
              <button
                onClick={loadOrders}
                disabled={ordersLoading}
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {ordersLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-primary-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No orders yet</p>
                <p className="text-gray-400 text-sm mt-1">Place a boost order to see it here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {orders.map(order => {
                  const sc = statusConfig[order.status] || statusConfig.pending;
                  return (
                    <div key={order._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm line-clamp-1">
                            {order.service?.customName || order.service?.name || `Service #${order.serviceId}`}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{order.link}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span>Qty: {order.quantity.toLocaleString()}</span>
                            <span className="text-primary-600 font-semibold">
                              {order.pointsSpent.toLocaleString()} pts
                            </span>
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${sc.color}`}>
                          {sc.icon}
                          {sc.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Modal */}
      {selectedService && (
        <OrderModal
          service={selectedService}
          balance={balance}
          onClose={() => setSelectedService(null)}
          onSuccess={() => { syncWalletFromBackend(); loadOrders(); }}
        />
      )}
    </div>
  );
};