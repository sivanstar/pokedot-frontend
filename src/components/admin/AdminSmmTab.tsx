import React, { useState, useEffect, useCallback } from 'react';
import {
  Rocket, RefreshCw, Search, Edit2, Eye, EyeOff,
  ChevronDown, ChevronUp, Save, X, AlertTriangle,
  Package, TrendingUp, Users, Zap, Filter, CheckCircle,
  RotateCcw
} from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface SmmService {
  _id: string;
  serviceId: number;
  name: string;
  customName: string;
  category: string;
  type: string;
  originalRate: number;
  pointsRequired: number;
  min: number;
  max: number;
  refill: boolean;
  cancel: boolean;
  isActive: boolean;
  isVisible: boolean;
  customDescription: string;
  displayOrder: number;
}

interface SmmOrder {
  _id: string;
  user: { username: string; email: string };
  service: { name: string; customName?: string; category: string };
  serviceId: number;
  link: string;
  quantity: number;
  pointsSpent: number;
  status: string;
  externalOrderId: string;
  createdAt: string;
}

interface EditState {
  pointsRequired: number;
  customName: string;
  customDescription: string;
  isActive: boolean;
  isVisible: boolean;
  displayOrder: number;
}

// ─── Service Edit Row ──────────────────────────────────────────────────────────
const ServiceEditRow: React.FC<{
  service: SmmService;
  onSave: (id: string, data: Partial<EditState>) => Promise<void>;
}> = ({ service, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditState>({
    pointsRequired: service.pointsRequired,
    customName: service.customName || '',
    customDescription: service.customDescription || '',
    isActive: service.isActive,
    isVisible: service.isVisible,
    displayOrder: service.displayOrder
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(service._id, form);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${isEditing ? 'border-primary-300 shadow-md' : 'border-gray-100'}`}>
      {/* Summary row */}
      <div className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
              #{service.serviceId}
            </span>
            <p className="text-sm font-semibold text-gray-800 truncate">
              {service.customName || service.name}
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{service.type} · {service.min}–{service.max}</p>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Original rate */}
          <div className="hidden md:block text-right">
            <p className="text-xs text-gray-400">API Rate/1k</p>
            <p className="text-xs font-mono text-gray-600">${service.originalRate}</p>
          </div>

          {/* Points */}
          <div className="text-right">
            <p className="text-xs text-gray-400">Points</p>
            <p className="text-sm font-black text-primary-600">{service.pointsRequired.toLocaleString()}</p>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${service.isActive ? 'bg-green-400' : 'bg-gray-300'}`} title={service.isActive ? 'Active' : 'Inactive'} />
            <span className={`w-2 h-2 rounded-full ${service.isVisible ? 'bg-blue-400' : 'bg-gray-300'}`} title={service.isVisible ? 'Visible' : 'Hidden'} />
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-1.5 rounded-lg transition-colors ${isEditing ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Edit panel */}
      {isEditing && (
        <div className="bg-primary-50 border-t border-primary-200 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Points Required (min 5,000)
              </label>
              <input
                type="number"
                value={form.pointsRequired}
                min={5000}
                step={100}
                onChange={e => setForm(f => ({ ...f, pointsRequired: parseInt(e.target.value) || 5000 }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                Custom Display Name
              </label>
              <input
                type="text"
                value={form.customName}
                placeholder={service.name}
                onChange={e => setForm(f => ({ ...f, customName: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Description (optional)</label>
            <input
              type="text"
              value={form.customDescription}
              placeholder="Short description shown to users..."
              onChange={e => setForm(f => ({ ...f, customDescription: e.target.value }))}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 rounded accent-primary-600" />
              <span className="text-sm text-gray-700">Active (accepts orders)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isVisible} onChange={e => setForm(f => ({ ...f, isVisible: e.target.checked }))}
                className="w-4 h-4 rounded accent-primary-600" />
              <span className="text-sm text-gray-700">Visible to users</span>
            </label>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Admin SMM Tab ─────────────────────────────────────────────────────────────
export const AdminSmmTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'services' | 'orders'>('services');

  // Services state
  const [services, setServices] = useState<SmmService[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  // Bulk edit state
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkPoints, setBulkPoints] = useState(5000);
  const [bulkSaving, setBulkSaving] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<SmmOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStats, setOrderStats] = useState<Record<string, { count: number; totalPoints: number }>>({});
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderStatus, setOrderStatus] = useState('');

  const loadServices = useCallback(async () => {
    setServicesLoading(true);
    try {
      const res = await api.get('/admin/smm/services?limit=200');
      if (res.data.success) {
        setServices(res.data.services);
        setCategories(res.data.categories);
        if (res.data.categories.length > 0) {
          setExpandedCats(new Set([res.data.categories[0]]));
        }
      }
    } catch (err: any) {
      if (err.response?.status !== 404) toast.error('Failed to load services');
    } finally {
      setServicesLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const params = new URLSearchParams({ page: String(orderPage), limit: '20' });
      if (orderStatus) params.append('status', orderStatus);
      const res = await api.get(`/admin/smm/orders?${params}`);
      if (res.data.success) {
        setOrders(res.data.orders);
        setOrderStats(res.data.stats || {});
        setOrderTotal(res.data.pagination?.total || 0);
      }
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  }, [orderPage, orderStatus]);

  useEffect(() => { loadServices(); }, [loadServices]);
  useEffect(() => { if (activeSubTab === 'orders') loadOrders(); }, [activeSubTab, loadOrders]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/admin/smm/sync');
      if (res.data.success) {
        toast.success(res.data.message);
        loadServices();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveService = async (id: string, data: Partial<EditState>) => {
    try {
      const res = await api.put(`/admin/smm/services/${id}`, data);
      if (res.data.success) {
        toast.success('Service updated');
        setServices(prev => prev.map(s => s._id === id ? { ...s, ...data } : s));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
      throw err;
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkCategory) return toast.error('Select a category');
    if (bulkPoints < 5000) return toast.error('Minimum 5,000 points');
    setBulkSaving(true);
    try {
      const res = await api.put('/admin/smm/services/bulk/update', {
        category: bulkCategory,
        pointsRequired: bulkPoints
      });
      if (res.data.success) {
        toast.success(`Updated ${res.data.modified} services`);
        loadServices();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Bulk update failed');
    } finally {
      setBulkSaving(false);
    }
  };

  // Filtered & grouped services
  const grouped = services.reduce<Record<string, SmmService[]>>((acc, s) => {
    if (filterCategory && s.category !== filterCategory) return acc;
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !s.customName?.toLowerCase().includes(searchQuery.toLowerCase())) return acc;
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700',
    partial: 'bg-orange-100 text-orange-700',
    cancelled: 'bg-gray-100 text-gray-600',
    failed: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary-500" />
            SMM Boost Management
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage social media boost services and orders
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold text-sm hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 shadow-sm"
        >
          <RotateCcw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync from API'}
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['services', 'orders'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveSubTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              activeSubTab === t ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'services' ? `Services (${services.length})` : `Orders (${orderTotal})`}
          </button>
        ))}
      </div>

      {/* ── SERVICES SUBTAB ── */}
      {activeSubTab === 'services' && (
        <>
          {/* Bulk Update Card */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Bulk Update Points by Category
            </h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-xs font-semibold text-amber-700 block mb-1">Category</label>
                <select
                  value={bulkCategory}
                  onChange={e => setBulkCategory(e.target.value)}
                  className="px-3 py-2 border border-amber-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-amber-700 block mb-1">Points (min 5,000)</label>
                <input
                  type="number"
                  value={bulkPoints}
                  min={5000}
                  step={500}
                  onChange={e => setBulkPoints(parseInt(e.target.value) || 5000)}
                  className="w-32 px-3 py-2 border border-amber-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <button
                onClick={handleBulkUpdate}
                disabled={bulkSaving || !bulkCategory}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 disabled:opacity-50"
              >
                {bulkSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Apply to All
              </button>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
              />
            </div>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {servicesLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-7 h-7 animate-spin text-primary-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Loading services...</p>
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No services found</p>
              <p className="text-gray-400 text-sm mt-1">Click "Sync from API" to fetch services</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([category, list]) => (
                <div key={category} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedCats(prev => {
                      const n = new Set(prev);
                      n.has(category) ? n.delete(category) : n.add(category);
                      return n;
                    })}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-700">{category}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{list.length}</span>
                    </div>
                    {expandedCats.has(category)
                      ? <ChevronUp className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />
                    }
                  </button>
                  {expandedCats.has(category) && (
                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                      {list.map(s => (
                        <ServiceEditRow key={s._id} service={s} onSave={handleSaveService} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── ORDERS SUBTAB ── */}
      {activeSubTab === 'orders' && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['pending', 'processing', 'completed', 'failed'].map(s => (
              <div key={s} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className="text-2xl font-black text-gray-800">{orderStats[s]?.count || 0}</p>
                <p className="text-xs text-gray-500 capitalize mt-0.5">{s}</p>
                {orderStats[s]?.totalPoints ? (
                  <p className="text-xs text-primary-600 font-semibold mt-0.5">
                    {orderStats[s].totalPoints.toLocaleString()} pts
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          {/* Filter + Refresh */}
          <div className="flex gap-3 items-center">
            <select
              value={orderStatus}
              onChange={e => { setOrderStatus(e.target.value); setOrderPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none"
            >
              <option value="">All Statuses</option>
              {['pending', 'processing', 'in_progress', 'completed', 'partial', 'cancelled', 'failed'].map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
            <button onClick={loadOrders} className="text-sm text-primary-600 flex items-center gap-1">
              <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {ordersLoading ? (
              <div className="text-center py-10">
                <RefreshCw className="w-6 h-6 animate-spin text-primary-500 mx-auto mb-2" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10">
                <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left p-3 text-xs font-semibold text-gray-500">User</th>
                      <th className="text-left p-3 text-xs font-semibold text-gray-500">Service</th>
                      <th className="text-left p-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Link</th>
                      <th className="text-right p-3 text-xs font-semibold text-gray-500">Qty</th>
                      <th className="text-right p-3 text-xs font-semibold text-gray-500">Points</th>
                      <th className="text-center p-3 text-xs font-semibold text-gray-500">Status</th>
                      <th className="text-right p-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map(order => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="p-3">
                          <p className="font-semibold text-gray-800">{order.user?.username}</p>
                          <p className="text-xs text-gray-400">{order.user?.email}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-gray-700 line-clamp-1">
                            {order.service?.customName || order.service?.name || `#${order.serviceId}`}
                          </p>
                          <p className="text-xs text-gray-400">{order.service?.category}</p>
                        </td>
                        <td className="p-3 hidden md:table-cell max-w-[150px]">
                          <a href={order.link} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline truncate block">
                            {order.link}
                          </a>
                        </td>
                        <td className="p-3 text-right text-gray-700">{order.quantity.toLocaleString()}</td>
                        <td className="p-3 text-right font-bold text-primary-600">{order.pointsSpent.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-right text-xs text-gray-400 hidden md:table-cell">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {orderTotal > 20 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                disabled={orderPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-sm text-gray-500">
                Page {orderPage} of {Math.ceil(orderTotal / 20)}
              </span>
              <button
                onClick={() => setOrderPage(p => p + 1)}
                disabled={orderPage >= Math.ceil(orderTotal / 20)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};