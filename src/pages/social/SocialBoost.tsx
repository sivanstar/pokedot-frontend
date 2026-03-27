import React, { useState, useEffect } from 'react';
import { 
  Instagram, Facebook, Twitter, Music, Youtube, Send,
  Award, Coins, TrendingUp, Wallet, AlertCircle, CheckCircle, XCircle,
  ExternalLink, Copy, Clock, Loader, Eye
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { usePoke } from '../../context/PokeContext';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

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
}

interface Order {
  _id: string;
  serviceName: string;
  username: string;
  link: string;
  quantity: number;
  pointsSpent: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

export const SocialBoost: React.FC = () => {
  const [services, setServices] = useState<Record<string, Service[]>>({});
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState({ services: true, orders: true });
  const [activeTab, setActiveTab] = useState<'services' | 'orders'>('services');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [username, setUsername] = useState('');
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { balance, syncWalletFromBackend } = useWallet();
  const { user, syncUserFromBackend } = usePoke();

  const loadServices = async () => {
    setLoading(prev => ({ ...prev, services: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/social/services`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setServices(data.services);
        setAllServices(data.allServices || []);
      } else {
        toast.error('Failed to load services');
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/social/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  useEffect(() => {
    loadServices();
    loadOrders();
    syncWalletFromBackend();
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedService) return;
    
    const totalPoints = selectedService.pointsCost * quantity;
    
    if (balance < totalPoints) {
      toast.error(`Insufficient points. You need ${totalPoints.toLocaleString()} points`);
      return;
    }
    
    if (!username.trim()) {
      toast.error('Please enter your username');
      return;
    }
    
    if (!link.trim()) {
      toast.error('Please enter the link to your profile/post');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/social/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: selectedService._id,
          username: username.trim(),
          link: link.trim(),
          quantity
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(`Order placed! ${totalPoints.toLocaleString()} points deducted`);
        setShowOrderModal(false);
        setSelectedService(null);
        setUsername('');
        setLink('');
        setQuantity(1);
        await syncWalletFromBackend();
        await syncUserFromBackend();
        loadOrders();
      } else {
        toast.error(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'instagram': return <Instagram className="w-6 h-6" />;
      case 'facebook': return <Facebook className="w-6 h-6" />;
      case 'twitter': return <Twitter className="w-6 h-6" />;
      case 'tiktok': return <Music className="w-6 h-6" />;
      case 'youtube': return <Youtube className="w-6 h-6" />;
      case 'telegram': return <Send className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'instagram': return 'from-pink-500 to-purple-600';
      case 'facebook': return 'from-blue-500 to-blue-700';
      case 'twitter': return 'from-blue-400 to-cyan-500';
      case 'tiktok': return 'from-black to-gray-800';
      case 'youtube': return 'from-red-500 to-red-700';
      case 'telegram': return 'from-blue-400 to-blue-600';
      default: return 'from-primary-500 to-secondary-500';
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

  const categories = Object.keys(services);
  const filteredServices = allServices.filter(service => 
    selectedCategory === 'all' || service.category === selectedCategory
  );

  if (loading.services) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4 shadow-lg">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Social Media Boost</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Use your earned points to boost your social media presence. Get real followers, likes, and engagement!
          </p>
          <div className="mt-4 inline-flex items-center bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
            <Wallet className="w-4 h-4 mr-2" />
            <span className="font-semibold">Your Balance: {balance.toLocaleString()} points</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white rounded-xl shadow p-1 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'services'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Available Services
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            My Orders
          </button>
        </div>

        {activeTab === 'services' ? (
          <>
            {/* Category Filter */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                      selectedCategory === cat
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <div
                  key={service._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden group"
                >
                  <div className={`bg-gradient-to-r ${getCategoryColor(service.category)} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-white/20 rounded-lg">
                        {getCategoryIcon(service.category)}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mt-3">{service.displayName}</h3>
                    <p className="text-sm opacity-90 mt-1">
                      {service.quantity} {service.quantityUnit}
                    </p>
                  </div>
                  
                  <div className="p-5">
                    <p className="text-gray-600 text-sm mb-4">
                      {service.description || `Get ${service.quantity} ${service.quantityUnit} for your ${service.category} account`}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-gray-800">{service.pointsCost.toLocaleString()} pts / unit</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Min: {service.minPoints.toLocaleString()} pts
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setShowOrderModal(true);
                      }}
                      className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Boost Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Orders Tab */
          <div className="space-y-4">
            {loading.orders ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Orders Yet</h3>
                <p className="text-gray-600">You haven't placed any social boost orders yet.</p>
                <button
                  onClick={() => setActiveTab('services')}
                  className="mt-4 btn-primary px-6 py-2"
                >
                  Browse Services
                </button>
              </div>
            ) : (
              orders.map(order => (
                <div key={order._id} className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="w-5 h-5 text-primary-600" />
                        <h3 className="font-bold text-gray-800">{order.serviceName}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Username: <span className="font-medium">{order.username}</span>
                      </p>
                      <p className="text-sm text-gray-600 mb-1 break-all">
                        Link: <span className="font-medium text-blue-600">{order.link}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: <span className="font-medium">{order.quantity}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-2 mb-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-gray-800">{order.pointsSpent.toLocaleString()} pts</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </p>
                      {order.completedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Completed {formatDistanceToNow(new Date(order.completedAt), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Place Order</h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className={`bg-gradient-to-r ${getCategoryColor(selectedService.category)} p-4 rounded-xl text-white`}>
                  <div className="flex items-center space-x-3">
                    {getCategoryIcon(selectedService.category)}
                    <div>
                      <h3 className="font-bold">{selectedService.displayName}</h3>
                      <p className="text-sm opacity-90">
                        {selectedService.quantity} {selectedService.quantityUnit}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cost per unit:</span>
                    <span className="font-bold text-gray-800">{selectedService.pointsCost.toLocaleString()} pts</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-600">Total cost:</span>
                    <span className="font-bold text-primary-600 text-lg">
                      {(selectedService.pointsCost * quantity).toLocaleString()} pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t">
                    <span className="text-gray-600">Your balance:</span>
                    <span className={`font-bold ${balance >= selectedService.pointsCost * quantity ? 'text-green-600' : 'text-red-600'}`}>
                      {balance.toLocaleString()} pts
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={`Your ${selectedService.category} username`}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile/Post Link
                  </label>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder={`https://${selectedService.category}.com/...`}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity (min 1)
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    step="1"
                    className="input-field"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Important</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Orders are processed within 24-48 hours. Points are non-refundable once order is placed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={balance < selectedService.pointsCost * quantity}
                    className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
