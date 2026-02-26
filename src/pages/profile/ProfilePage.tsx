import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Edit2, Camera, Save, X, 
  Coins, Zap, Trophy, Calendar, 
  Link as LinkIcon, Users, TrendingUp,
  Mail, Globe, Lock, Shield,
  Upload, XCircle, CheckCircle,
  Banknote, AlertCircle, Wallet,
  Award, Medal, Target, Clock,
  Flame, Copy, RefreshCw
} from 'lucide-react';
import { usePoke } from '../../context/PokeContext';
import { useWallet } from '../../context/WalletContext';
import { useNotifications } from '../../context/NotificationsContext';
import { authApi } from '../../api/auth';
import { walletApi } from '../../api/wallet';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface AccountDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export const ProfilePage: React.FC = () => {
  const { user, updateUserProfile, syncUserFromBackend } = usePoke();
  const { balance, totalEarned, totalWithdrawn, bankDetails, syncWalletFromBackend } = useWallet();
  const { addNotification } = useNotifications();
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'security' | 'stats'>('profile');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile Form
  const [profileForm, setProfileForm] = useState({
    username: '',
    bio: '',
    email: ''
  });
  
  // Account Details Form
  const [accountForm, setAccountForm] = useState<AccountDetails>({
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [hasAccountDetails, setHasAccountDetails] = useState(false);
  const [position, setPosition] = useState<{
    position: number;
    totalUsers: number;
    percentage: number;
  } | null>(null);
  
  // Security Form
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // ==================== LOAD USER DATA FROM CONTEXT ====================
  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        bio: user.bio || 'Poke enthusiast! Ready for some friendly competition.',
        email: user.email || ''
      });
      
      // Load avatar from user data if available (from backend)
      if (user.avatar) {
        setAvatarUrl(user.avatar);
      }
    }
  }, [user]);

  // ==================== AVATAR PERSISTENCE ====================
  // Load avatar from localStorage as fallback (on mount only)
  useEffect(() => {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar && !avatarUrl) {
      setAvatarUrl(savedAvatar);
    }
  }, []); // Empty dependency array - run once on mount

  // Save avatar to localStorage whenever it changes (for persistence)
  useEffect(() => {
    if (avatarUrl) {
      localStorage.setItem('userAvatar', avatarUrl);
    }
  }, [avatarUrl]);

  // ==================== BANK DETAILS FROM WALLET CONTEXT ====================
  useEffect(() => {
    if (bankDetails) {
      setAccountForm({
        bankName: bankDetails.bankName || '',
        accountNumber: bankDetails.accountNumber || '',
        accountName: bankDetails.accountName || '',
      });
      setHasAccountDetails(!!bankDetails.bankName && !!bankDetails.accountNumber && !!bankDetails.accountName);
    }
  }, [bankDetails]);

  // ==================== GET USER POSITION ====================
  useEffect(() => {
    const getPosition = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/position`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setPosition(data);
        }
      } catch (error) {
        console.error('Error getting position:', error);
      }
    };
    getPosition();
  }, [user]);

  // ==================== HANDLE REFRESH ====================
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await syncUserFromBackend();
      await syncWalletFromBackend();
      
      // Refresh position
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/position`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPosition(data);
      }
      
      toast.success('Profile refreshed!');
    } catch (error) {
      console.error('Error refreshing:', error);
      toast.error('Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  // ==================== AVATAR UPLOAD ====================
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const simulateUpload = () => {
        return new Promise<void>((resolve) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 5;
            setUploadProgress(progress);
            
            if (progress >= 95) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      };

      await simulateUpload();

      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Update local state (will trigger localStorage save via useEffect)
        setAvatarUrl(base64String);
        
        // Update user profile in backend
        try {
          await authApi.updateProfile({ avatar: base64String });
          await syncUserFromBackend();
          
          addNotification({
            userId: '1',
            type: 'system',
            title: 'Avatar Updated',
            message: 'Profile picture uploaded successfully'
          });

          toast.success('Profile picture updated successfully!');
        } catch (error) {
          console.error('Error updating avatar:', error);
          toast.error('Failed to save avatar to server');
          // Revert on error
          setAvatarUrl(null);
          localStorage.removeItem('userAvatar');
        }
      };
      reader.readAsDataURL(file);

      setTimeout(() => {
        setUploadProgress(null);
        setIsUploading(false);
      }, 500);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
      setUploadProgress(null);
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ==================== REMOVE AVATAR ====================
  const removeAvatar = async () => {
    if (avatarUrl && avatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(avatarUrl);
    }
    setAvatarUrl(null);
    localStorage.removeItem('userAvatar');
    
    // Update backend
    try {
      await authApi.updateProfile({ avatar: '' });
      await syncUserFromBackend();
      
      addNotification({
        userId: '1',
        type: 'system',
        title: 'Avatar Removed',
        message: 'Profile picture has been removed'
      });

      toast.success('Profile picture removed');
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove avatar');
    }
  };

  // ==================== PROFILE SAVE ====================
  const handleProfileSave = async () => {
    try {
      // Update bio only (username can't be changed for now)
      await authApi.updateProfile({
        bio: profileForm.bio
      });
      
      await syncUserFromBackend();
      
      addNotification({
        userId: '1',
        type: 'system',
        title: 'Profile Updated',
        message: 'Your profile information has been updated successfully'
      });
      
      setIsEditing(false);
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  };

  // ==================== ACCOUNT SAVE (TO BACKEND) ====================
  const handleAccountSave = async () => {
    // Validate required fields
    if (!accountForm.bankName.trim() || !accountForm.accountNumber.trim() || !accountForm.accountName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate account number (basic validation)
    if (!/^\d+$/.test(accountForm.accountNumber)) {
      toast.error('Account number must contain only digits');
      return;
    }

    if (accountForm.accountNumber.length < 10) {
      toast.error('Account number must be at least 10 digits');
      return;
    }

    try {
      // Save to backend via API
      const response = await walletApi.updateBankDetails(accountForm);
      
      if (response.success) {
        setHasAccountDetails(true);
        setIsEditingAccount(false);
        
        // Refresh wallet data to get updated bank details
        await syncWalletFromBackend();
        
        addNotification({
          userId: '1',
          type: 'system',
          title: 'Account Details Updated',
          message: 'Your bank account details have been saved'
        });

        toast.success('Account details saved successfully!');
      }
    } catch (error: any) {
      console.error('Error saving bank details:', error);
      toast.error(error.response?.data?.message || 'Failed to save bank details');
    }
  };

  // ==================== ACCOUNT CANCEL ====================
  const handleAccountCancel = () => {
    // Reset to previously saved values from wallet context
    if (bankDetails) {
      setAccountForm({
        bankName: bankDetails.bankName || '',
        accountNumber: bankDetails.accountNumber || '',
        accountName: bankDetails.accountName || '',
      });
    }
    setIsEditingAccount(false);
  };

  // ==================== COPY REFERRAL ====================
  const handleCopyReferral = () => {
    const referralCode = user?.referralCode || `POKE-${user?.username?.toUpperCase().substring(0, 6)}`;
    navigator.clipboard.writeText(`https://pokedot.com/ref/${referralCode}`);
    
    addNotification({
      userId: '1',
      type: 'system',
      title: 'Link Copied!',
      message: 'Referral link copied to clipboard'
    });
    
    toast.success('Referral link copied!');
  };

  // ==================== FORMAT HELPERS ====================
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const formatPoints = (points: number) => {
    return points.toLocaleString() + ' points';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary-500 via-purple-600 to-secondary-600 rounded-3xl p-8 mb-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar with Upload */}
            <div className="relative">
              <div 
                className="relative w-32 h-32 rounded-full border-4 border-white/30 cursor-pointer overflow-hidden bg-white/20 hover:opacity-90 transition-opacity group shadow-xl"
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={profileForm.username}
                    className="w-full h-full object-cover"
                    onError={() => {
                      setAvatarUrl(null);
                      localStorage.removeItem('userAvatar');
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-white/30 to-white/10 text-4xl font-bold">
                    {profileForm.username.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {uploadProgress !== null && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{uploadProgress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {!isUploading && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              
              {avatarUrl && !isUploading && (
                <button
                  onClick={removeAvatar}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transition-all hover:scale-110"
                  title="Remove profile picture"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{profileForm.username}</h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-white/90">
                    <div className="flex items-center">
                      <Trophy className="w-4 h-4 mr-1" />
                      <span>Rank #{user?.rank || position?.position || 999}</span>
                    </div>
                    <div className="flex items-center">
                      <Flame className="w-4 h-4 mr-1 text-orange-300" />
                      <span>{user?.loginStreak || 0} day streak</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Joined {formatDate(user?.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-3">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={() => isEditing ? handleProfileSave() : setIsEditing(true)}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                  >
                    {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    <span>{isEditing ? 'Save' : 'Edit Bio'}</span>
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                    className="w-full p-3 rounded-lg text-gray-800 bg-white/90"
                    rows={3}
                    maxLength={200}
                    placeholder="Tell us about yourself..."
                  />
                  <div className="text-right text-sm text-white/80 mt-1">
                    {profileForm.bio.length}/200
                  </div>
                </div>
              ) : (
                <p className="text-lg opacity-90">{profileForm.bio || 'No bio yet. Click edit to add one!'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-500">Current</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{formatPoints(balance)}</h3>
            <p className="text-gray-600 text-sm mt-1">Wallet Balance</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{formatPoints(totalEarned)}</h3>
            <p className="text-gray-600 text-sm mt-1">Points Earned</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-500">Position</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">#{position?.position || user?.rank || 999}</h3>
            <p className="text-gray-600 text-sm mt-1">of {position?.totalUsers || 0} users</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white rounded-xl shadow p-1 border border-gray-100">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Stats</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'account'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Banknote className="w-4 h-4" />
              <span>Bank</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Security</span>
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">About Me</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Email Address</p>
                      <p className="font-medium text-gray-800">{profileForm.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Member Since</p>
                      <p className="font-medium text-gray-800">{formatDate(user?.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Zap className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Activity</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-gray-800">{user?.pokesSent || 0}</p>
                          <p className="text-sm text-gray-500">Pokes Sent</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user?.pokesReceived || 0}</p>
                          <p className="text-sm text-gray-500">Pokes Received</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Performance Stats</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Global Rank</span>
                      <span className="font-bold text-primary-600">#{position?.position || user?.rank || 999}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                        style={{ width: `${position?.percentage || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Top {position?.percentage || 0}% of all users
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 mb-1">Login Streak</p>
                      <div className="flex items-center">
                        <Flame className="w-5 h-5 text-orange-500 mr-2" />
                        <span className="text-2xl font-bold text-gray-800">{user?.loginStreak || 0}</span>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600 mb-1">Poke Streak</p>
                      <div className="flex items-center">
                        <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                        <span className="text-2xl font-bold text-gray-800">{user?.streak || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-gray-600 text-sm">Pokes Sent</p>
                      <p className="text-2xl font-bold text-gray-800">{user?.pokesSent || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Pokes Received</p>
                      <p className="text-2xl font-bold text-gray-800">{user?.pokesReceived || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Bank Account Details</h3>
                  {!isEditingAccount && (
                    <button
                      onClick={() => setIsEditingAccount(true)}
                      className="text-primary-600 hover:text-primary-500 font-medium"
                    >
                      {hasAccountDetails ? 'Edit' : 'Add Details'}
                    </button>
                  )}
                </div>

                {hasAccountDetails && !isEditingAccount ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Bank Name</p>
                        <p className="font-medium text-gray-800">{accountForm.bankName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Account Number</p>
                        <p className="font-medium text-gray-800">{accountForm.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Account Holder</p>
                        <p className="font-medium text-gray-800">{accountForm.accountName}</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800">Important</p>
                          <p className="text-sm text-yellow-700">
                            Withdrawals are processed within 3-5 business days. Minimum withdrawal: 2,000 points.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Bank Name</label>
                      <input
                        type="text"
                        value={accountForm.bankName}
                        onChange={(e) => setAccountForm({...accountForm, bankName: e.target.value})}
                        className="input-field"
                        placeholder="e.g., GTBank"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Account Number</label>
                      <input
                        type="text"
                        value={accountForm.accountNumber}
                        onChange={(e) => setAccountForm({...accountForm, accountNumber: e.target.value})}
                        className="input-field"
                        placeholder="0123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Account Holder Name</label>
                      <input
                        type="text"
                        value={accountForm.accountName}
                        onChange={(e) => setAccountForm({...accountForm, accountName: e.target.value})}
                        className="input-field"
                        placeholder="John Doe"
                      />
                    </div>

                    {isEditingAccount && (
                      <div className="flex space-x-3 pt-4">
                        <button
                          onClick={handleAccountCancel}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAccountSave}
                          className="flex-1 btn-primary"
                        >
                          Save Details
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Change Password</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                      className="input-field"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                      className="input-field"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                      className="input-field"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (securityForm.newPassword !== securityForm.confirmPassword) {
                        toast.error('Passwords do not match');
                        return;
                      }
                      toast.success('Password updated successfully (demo)');
                      setSecurityForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    className="btn-primary w-full"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Referral Card */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <LinkIcon className="w-6 h-6" />
                <h3 className="text-xl font-bold">Refer & Earn ₦300</h3>
              </div>
              <p className="opacity-90 mb-6">
                Earn ₦300 for every friend who joins using your code!
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-sm opacity-80">Your Referral Code</p>
                  <div className="bg-white/20 px-4 py-3 rounded-lg font-mono text-lg font-bold mt-1 flex items-center justify-between">
                    <span>{user?.referralCode || `POKE-${profileForm.username.toUpperCase().substring(0, 6)}`}</span>
                    <button 
                      onClick={handleCopyReferral}
                      className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button 
                  onClick={handleCopyReferral}
                  className="w-full bg-white text-green-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Copy Referral Link</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Referral Bonus Earned</span>
                  <span className="font-bold text-green-600">{user?.referralBonusEarned || 0} pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Withdrawn</span>
                  <span className="font-bold text-blue-600">{totalWithdrawn} pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Daily Pokes Left</span>
                  <span className="font-bold text-purple-600">2 sends, 2 receives</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
