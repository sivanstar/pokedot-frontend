import React, { useState, useEffect } from 'react';
import {
  Instagram, Facebook, Twitter, Music, Youtube, Send,
  Plus, Edit2, Trash2, Save, X, RefreshCw, Search,
  CheckCircle, XCircle, AlertCircle, DollarSign, Coins,
  Eye, Filter, Clock, Loader, TrendingUp, Award, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Service {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  category: string;
  minPoints: number;
  pointsCost: number;
  quantity: number;
  quantityUnit: string;
  isActive: boolean;
  apiServiceId: string;
  apiServiceName: string;
  apiKey: string;
  apiUrl: string;
  orderCount: number;
  createdAt: string;
}

interface Order {
  _id: string;
  user: { username: string; email: string };
  service: { displayName: string; category: string };
  serviceName: string;
  username: string;
  link: string;
  quantity: number;
  pointsSpent: number;
  status: string;
  adminNotes: string;
  createdAt: string;
  completedAt?: string;
}

export const AdminSocial: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Record<string, { count: number; totalPoints: number }>>({});
  const [loading, setLoading] = useState({ services: true, orders: true });
  const [activeTab, setActiveTab] = useState<'services' | 'orders'>('services');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const loadServices = async () => {
    setLoading(prev => ({ ...prev, services: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/social/services`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setServices(data.services);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  };

  const loadOrders = async () => {
    setLoading(prev => ({ ...prev, orders: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/social/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  useEffect(() => {
    loadServices();
    loadOrders();
  }, []);

  const handleCreateService = async () => {
    if (!serviceForm.name || !serviceForm.displayName || !serviceForm.category || !serviceForm.pointsCost || !serviceForm.apiServiceId) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/social/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...serviceForm,
          quantity: serviceForm.quantity || 100,
          quantityUnit: serviceForm.quantityUnit || 'followers',
          minPoints: serviceForm.minPoints || 5000
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Service created successfully');
        setShowServiceModal(false);
        setEditingService(null);
        setServiceForm({});
        loadServices();
      } else {
        toast.error(data.message || 'Failed to create service');
      }
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
    }
  };

  const handleUpdateService = async () => {
    if (!editingService) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/social/services/${editingService._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(serviceForm)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Service updated successfully');
        setShowServiceModal(false);
        setEditingService(null);
        setServiceForm({});
        loadServices();
      } else {
        toast.error(data.message || 'Failed to update service');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
    }
  };

  const handleToggleServiceStatus = async (serviceId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/social/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !isActive })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Service ${!isActive ? 'activated' : 'deactivated'}`);
        loadServices();
      }
    } catch (error) {
      console.error('Error toggling service:', error);
      toast.error('Failed to update service');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/social/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, adminNotes })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Order ${status}`);
        setShowOrderModal(false);
        setSelectedOrder(null);
        setAdminNotes('');
        loadOrders();
      } else {
        toast.error(data.message || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'tiktok': return <Music className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredServices = services.filter(s =>
    s.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    o.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-6 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8" />
                <h1 className="text-2xl font-bold">Social Media Management</h1>
              </div>
              <p className="text-white/80 mt-2">Manage boost services and orders</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => {
                  setEditingService(null);
                  setServiceForm({});
                  setShowServiceModal(true);
                }}
                className="bg-white text-primary-600 px-6 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-gray-800">{stats?.total || 0}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Services</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-800">{stats?.active || 0}</span>
            </div>
            <p className="text-gray-600 text-sm">Active Services</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Coins className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-800">{stats?.totalOrders || 0}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Orders</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold text-gray-800">{stats?.totalPointsSpent || 0}</span>
            </div>
            <p className="text-gray-600 text-sm">Points Spent</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white rounded-xl shadow p-1 max-w-md">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'services'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Orders
          </button>
        </div>

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Services Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {loading.services ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading services...</p>
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No services found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points Cost</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredServices.map(service => (
                        <tr key={service._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                {getCategoryIcon(service.category)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{service.displayName}</p>
                                <p className="text-xs text-gray-500">{service.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="capitalize px-2 py-1 rounded-full text-xs bg-gray-100">
                              {service.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <Coins className="w-4 h-4 text-yellow-500" />
                              <span className="font-bold">{service.pointsCost.toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-gray-500">Min: {service.minPoints.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {service.quantity} {service.quantityUnit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {service.orderCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {service.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingService(service);
                                  setServiceForm(service);
                                  setShowServiceModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleServiceStatus(service._id, service.isActive)}
                                className={`${service.isActive ? 'text-red-600' : 'text-green-600'} hover:opacity-80`}
                              >
                                {service.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by username or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {loading.orders ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No orders found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map(order => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-xs">{order._id.slice(-8)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="font-medium text-gray-900">{order.user?.username}</p>
                              <p className="text-xs text-gray-500">{order.user?.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getCategoryIcon(order.service?.category)}
                              <span>{order.serviceName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm">@{order.username}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">{order.link}</p>
                              <p className="text-xs text-gray-500">x{order.quantity}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <Coins className="w-4 h-4 text-yellow-500" />
                              <span>{order.pointsSpent.toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h3>
                <button onClick={() => setShowServiceModal(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                    <input
                      type="text"
                      value={serviceForm.name || ''}
                      onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                      className="input-field"
                      placeholder="instagram_followers"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name *</label>
                    <input
                      type="text"
                      value={serviceForm.displayName || ''}
                      onChange={(e) => setServiceForm({ ...serviceForm, displayName: e.target.value })}
                      className="input-field"
                      placeholder="Instagram Followers"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={serviceForm.category || ''}
                      onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select Category</option>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter</option>
                      <option value="tiktok">TikTok</option>
                      <option value="youtube">YouTube</option>
                      <option value="telegram">Telegram</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Service ID *</label>
                    <input
                      type="text"
                      value={serviceForm.apiServiceId || ''}
                      onChange={(e) => setServiceForm({ ...serviceForm, apiServiceId: e.target.value })}
                      className="input-field"
                      placeholder="SMM panel service ID"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Points Cost *</label>
                    <input
                      type="number"
                      value={serviceForm.pointsCost || ''}
                      onChange={(e) => setServiceForm({ ...serviceForm, pointsCost: parseInt(e.target.value) })}
                      className="input-field"
                      placeholder="7000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Points</label>
                    <input
                      type="number"
                      value={serviceForm.minPoints || 5000}
                      onChange={(e) => setServiceForm({ ...serviceForm, minPoints: parseInt(e.target.value) })}
                      className="input-field"
                      placeholder="5000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={serviceForm.quantity || 100}
                      onChange={(e) => setServiceForm({ ...serviceForm, quantity: parseInt(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Unit</label>
                    <input
                      type="text"
                      value={serviceForm.quantityUnit || 'followers'}
                      onChange={(e) => setServiceForm({ ...serviceForm, quantityUnit: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={serviceForm.description || ''}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Service description..."
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-800 mb-3">API Configuration</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                      <input
                        type="text"
                        value={serviceForm.apiKey || ''}
                        onChange={(e) => setServiceForm({ ...serviceForm, apiKey: e.target.value })}
                        className="input-field"
                        placeholder="API key from SMM panel"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
                      <input
                        type="text"
                        value={serviceForm.apiUrl || ''}
                        onChange={(e) => setServiceForm({ ...serviceForm, apiUrl: e.target.value })}
                        className="input-field"
                        placeholder="https://api.smm-panel.com/v1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowServiceModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingService ? handleUpdateService : handleCreateService}
                    className="flex-1 btn-primary py-3"
                  >
                    {editingService ? 'Update Service' : 'Create Service'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Order Details</h3>
                <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-mono text-sm">{selectedOrder._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p>{format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">User Information</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Username</p>
                      <p className="font-medium">{selectedOrder.user?.username}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium">{selectedOrder.user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Service Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Service Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Service:</span>
                      <span className="font-medium">{selectedOrder.serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Username:</span>
                      <span className="font-medium">@{selectedOrder.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Link:</span>
                      <a href={selectedOrder.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm break-all">
                        {selectedOrder.link}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <span className="font-medium">x{selectedOrder.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Points Spent:</span>
                      <span className="font-medium text-yellow-600">{selectedOrder.pointsSpent.toLocaleString()} pts</span>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Update Status</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['pending', 'processing', 'completed', 'failed', 'cancelled'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleUpdateOrderStatus(selectedOrder._id, status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedOrder.status === status
                            ? getStatusColor(status) + ' ring-2 ring-offset-2'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="input-field"
                    placeholder="Add admin notes..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
