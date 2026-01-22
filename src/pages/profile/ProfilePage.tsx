import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Edit2, Camera, Save, X, 
  Coins, Zap, Trophy, Calendar, 
  Link as LinkIcon, Users, TrendingUp,
  Mail, Globe, Lock, Shield,
  Upload, XCircle, CheckCircle,
  Banknote, AlertCircle, Wallet
} from 'lucide-react';
import { usePoke } from '../../context/PokeContext';
import { useWallet } from '../../context/WalletContext';
import { useNotifications } from '../../context/NotificationsContext';
import toast from 'react-hot-toast';

// Interface for Account Details
interface AccountDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = usePoke();
  const { balance, totalEarned } = useWallet();
  const { addNotification } = useNotifications();
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'settings' | 'security'>('profile');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile Form - Initialize with user data from context
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    bio: 'Poke enthusiast and points collector! Ready for some friendly competition.',
    email: user?.email || '',
    location: 'San Francisco, CA',
    website: 'https://pokedot.com/user/pokemaster',
  });
  
  // Account Details Form
  const [accountForm, setAccountForm] = useState<AccountDetails>({
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [hasAccountDetails, setHasAccountDetails] = useState(false);
  
  // Security Form
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load account details from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('accountDetails');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAccountForm(parsed);
        setHasAccountDetails(true);
      } catch (error) {
        console.error('Error parsing account details:', error);
      }
    }
  }, []);

  // Load avatar from localStorage on component mount
  useEffect(() => {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
  }, []);

  // Update profile form when user data changes
  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        username: user.username,
        email: user.email
      }));
    }
  }, [user]);

  // Handle avatar container click
  const handleAvatarContainerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  };

  // Handle camera button click
  const handleCameraButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  };

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

      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);

      // Save to localStorage for persistence
      localStorage.setItem('userAvatar', objectUrl);

      // Success notification
      addNotification({
        userId: '1',
        type: 'system',
        title: 'Avatar Updated',
        message: 'Profile picture uploaded successfully'
      });

      toast.success('Profile picture updated successfully!', {
        icon: '✅',
        duration: 3000,
      });

      // Simulate a small delay for the final progress
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
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAvatar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (avatarUrl) {
      URL.revokeObjectURL(avatarUrl);
    }
    setAvatarUrl(null);
    localStorage.removeItem('userAvatar');
    
    addNotification({
      userId: '1',
      type: 'system',
      title: 'Avatar Removed',
      message: 'Profile picture has been removed'
    });

    toast.success('Profile picture removed');
  };

  const handleProfileSave = () => {
    // Update user in context
    if (updateUserProfile) {
      updateUserProfile({
        username: profileForm.username,
        email: profileForm.email
      });
    }
    
    // Update localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({
      ...currentUser,
      username: profileForm.username,
      email: profileForm.email
    }));
    
    addNotification({
      userId: '1',
      type: 'system',
      title: 'Profile Updated',
      message: 'Your profile information has been updated successfully'
    });
    setIsEditing(false);
    toast.success('Profile saved successfully!');
  };

  const handleAccountSave = () => {
    // Validate required fields
    if (!accountForm.bankName.trim() || !accountForm.accountNumber.trim() || !accountForm.accountName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Save to localStorage
    localStorage.setItem('accountDetails', JSON.stringify(accountForm));
    setHasAccountDetails(true);
    setIsEditingAccount(false);

    addNotification({
      userId: '1',
      type: 'system',
      title: 'Account Details Updated',
      message: 'Your bank account details have been saved'
    });

    toast.success('Account details saved successfully!');
  };

  const handleAccountCancel = () => {
    const saved = localStorage.getItem('accountDetails');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAccountForm(parsed);
      } catch (error) {
        console.error('Error parsing account details:', error);
      }
    }
    setIsEditingAccount(false);
  };

  const handleSecuritySave = () => {
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    
    addNotification({
      userId: '1',
      type: 'system',
      title: 'Password Updated',
      message: 'Your password has been changed successfully'
    });
    
    setSecurityForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    
    toast.success('Password updated successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar with Upload Functionality */}
            <div className="relative">
              <div 
                className="relative w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold backdrop-blur-sm cursor-pointer overflow-hidden bg-white/20 hover:opacity-90 transition-opacity group"
                onClick={handleAvatarContainerClick}
                style={{ cursor: isUploading ? 'wait' : 'pointer' }}
              >
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={profileForm.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', avatarUrl);
                      setAvatarUrl(null);
                      localStorage.removeItem('userAvatar');
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-white/30 to-white/10">
                    {profileForm.username.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Upload Progress Overlay */}
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
                
                {/* Hover overlay */}
                {!isUploading && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              
              {/* Upload Button */}
              <button
                onClick={handleCameraButtonClick}
                disabled={isUploading}
                className="absolute bottom-2 right-2 bg-white text-primary-600 p-3 rounded-full cursor-pointer hover:bg-gray-100 shadow-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                title={isUploading ? "Uploading..." : "Change profile picture"}
                style={{ pointerEvents: isUploading ? 'none' : 'auto' }}
              >
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                ) : avatarUrl ? (
                  <Camera className="w-5 h-5" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </button>
              
              {/* Remove Avatar Button */}
              {avatarUrl && !isUploading && (
                <button
                  onClick={removeAvatar}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full cursor-pointer hover:bg-red-600 shadow-lg transition-all hover:scale-110 active:scale-95"
                  title="Remove profile picture"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                      className="text-3xl font-bold bg-white/20 px-3 py-2 rounded-lg w-full md:w-auto text-white placeholder-white/70"
                      placeholder="Enter username"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold mb-2">{profileForm.username}</h1>
                  )}
                  <p className="opacity-90">Member since January 1, 2024</p>
                  
                  {/* Avatar Upload Instructions */}
                  {!avatarUrl && !isUploading && (
                    <div className="mt-3 flex items-center justify-center md:justify-start space-x-2 text-sm opacity-80">
                      <Camera className="w-4 h-4" />
                      <span>Click on avatar to upload a profile picture</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 md:mt-0">
                  <button
                    onClick={() => isEditing ? handleProfileSave() : setIsEditing(true)}
                    className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                  >
                    {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    <span>{isEditing ? 'Save Profile' : 'Edit Profile'}</span>
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-white/90">Bio</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                      className="w-full p-3 rounded-lg text-gray-800"
                      rows={3}
                      maxLength={200}
                      placeholder="Tell us about yourself..."
                    />
                    <div className="text-right text-sm text-white/80 mt-1">
                      {profileForm.bio.length}/200
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-white/90">Location</label>
                      <input
                        type="text"
                        value={profileForm.location}
                        onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                        className="w-full p-3 rounded-lg text-gray-800"
                        placeholder="Your location"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-white/90">Website</label>
                      <input
                        type="url"
                        value={profileForm.website}
                        onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                        className="w-full p-3 rounded-lg text-gray-800"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-lg opacity-90 mb-6">{profileForm.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation - REMOVED SETTINGS TAB */}
        <div className="flex space-x-1 mb-8 bg-white rounded-xl shadow p-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'account'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Banknote className="w-4 h-4" />
              <span>Account</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
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
          {/* Profile Tab Content */}
          {activeTab === 'profile' && (
            <div className="lg:col-span-2">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
                      <Coins className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600">Total Points Earned</p>
                      <h3 className="text-3xl font-bold text-gray-800">{totalEarned.toLocaleString()}</h3>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600">Current Balance</p>
                      <h3 className="text-3xl font-bold text-gray-800">{balance.toLocaleString()}</h3>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600">Pokes Sent</p>
                      <h3 className="text-3xl font-bold text-gray-800">{user?.pokesSent.toLocaleString()}</h3>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600">Pokes Received</p>
                      <h3 className="text-3xl font-bold text-gray-800">{user?.pokesReceived.toLocaleString()}</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Contact Info</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{profileForm.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span>{profileForm.location}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Global Rank</span>
                        <span className="font-semibold">#{user?.rank}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Current Streak</span>
                        <span className="font-semibold">{user?.streak} days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Account Created</span>
                        <span className="font-semibold">Jan 1, 2024</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Details Tab Content */}
          {activeTab === 'account' && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Bank Account Details</h3>
                    <p className="text-gray-600">
                      Set your bank account details for withdrawals. All withdrawals will be sent to this account.
                    </p>
                  </div>
                  <div>
                    {!isEditingAccount ? (
                      <button
                        onClick={() => setIsEditingAccount(true)}
                        className="btn-primary px-6 py-2"
                      >
                        {hasAccountDetails ? 'Edit Details' : 'Add Account Details'}
                      </button>
                    ) : (
                      <div className="flex space-x-3">
                        <button
                          onClick={handleAccountCancel}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAccountSave}
                          className="btn-primary px-6 py-2"
                        >
                          Save Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Details Status */}
                <div className={`mb-8 p-4 rounded-lg ${hasAccountDetails ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-start space-x-3">
                    {hasAccountDetails ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">
                        {hasAccountDetails ? 'Account details are set' : 'Account details required'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {hasAccountDetails 
                          ? 'You can make withdrawals to your registered bank account'
                          : 'You need to set your bank account details before making withdrawals'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Form */}
                {isEditingAccount ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Bank Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={accountForm.bankName}
                          onChange={(e) => setAccountForm({...accountForm, bankName: e.target.value})}
                          className="input-field"
                          placeholder="Bank Name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Account Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={accountForm.accountNumber}
                          onChange={(e) => setAccountForm({...accountForm, accountNumber: e.target.value})}
                          className="input-field"
                          placeholder="Account Number"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-gray-700 mb-2">
                          Account Holder Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={accountForm.accountName}
                          onChange={(e) => setAccountForm({...accountForm, accountName: e.target.value})}
                          className="input-field"
                          placeholder="Account Holder Name"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">Important Information</h4>
                      <ul className="text-sm text-blue-700 space-y-2">
                        <li className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span>Ensure your account details are accurate. Withdrawals cannot be reversed if sent to wrong account.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span>Withdrawals are processed within 3-5 business days</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span>Minimum withdrawal amount: 2,000 points</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : hasAccountDetails ? (
                  <div className="space-y-6">
                    {/* Display Account Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-600 mb-1">Bank Name</label>
                        <p className="font-semibold text-gray-800">{accountForm.bankName}</p>
                      </div>
                      
                      <div>
                        <label className="block text-gray-600 mb-1">Account Number</label>
                        <p className="font-semibold text-gray-800">{accountForm.accountNumber}</p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-gray-600 mb-1">Account Holder Name</label>
                        <p className="font-semibold text-gray-800">{accountForm.accountName}</p>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="font-medium text-gray-800 mb-4">Withdrawal Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Minimum Withdrawal</span>
                          <span className="font-semibold">10,000 points</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Processing Time</span>
                          <span className="font-semibold">3-5 business days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Last Updated</span>
                          <span className="font-semibold">
                            {new Date().toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 mx-auto mb-6">
                      <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Banknote className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">No Account Details Set</h4>
                    <p className="text-gray-600 mb-6">
                      You need to set up your bank account details to withdraw your earnings.
                    </p>
                    <button
                      onClick={() => setIsEditingAccount(true)}
                      className="btn-primary px-8 py-3"
                    >
                      Add Account Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Tab Content */}
          {activeTab === 'security' && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-6 text-gray-800">Security Settings</h3>
                <div className="space-y-6">
                  {/* Change Password */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-4 flex items-center space-x-2">
                      <Lock className="w-5 h-5" />
                      <span>Change Password</span>
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Current Password</label>
                        <input
                          type="password"
                          value={securityForm.currentPassword}
                          onChange={(e) => setSecurityForm({
                            ...securityForm,
                            currentPassword: e.target.value
                          })}
                          className="input-field"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          value={securityForm.newPassword}
                          onChange={(e) => setSecurityForm({
                            ...securityForm,
                            newPassword: e.target.value
                          })}
                          className="input-field"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={securityForm.confirmPassword}
                          onChange={(e) => setSecurityForm({
                            ...securityForm,
                            confirmPassword: e.target.value
                          })}
                          className="input-field"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Options */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-4">Security Options</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-600">Add an extra layer of security</p>
                        </div>
                        <button className="text-primary-600 hover:text-primary-500 font-medium">
                          Enable
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Login Sessions</p>
                          <p className="text-sm text-gray-600">Manage active sessions</p>
                        </div>
                        <button className="text-primary-600 hover:text-primary-500 font-medium">
                          View All
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSecuritySave}
                    className="btn-primary px-8 py-3"
                  >
                    Update Security Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Right Column - Only Referral Card */}
          <div className="space-y-8">
            {/* Referral Card */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <div className="flex items-center space-x-2 mb-4">
                <LinkIcon className="w-6 h-6" />
                <h3 className="text-xl font-bold">Earn ₦300 When Others Use Your Code</h3>
              </div>
              <p className="opacity-90 mb-6">
                You earn ₦300 when someone uses YOUR referral code to sign up!
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-sm opacity-80">Your Referral Code</p>
                  <div className="bg-white/20 px-4 py-3 rounded-lg font-mono text-lg font-bold mt-1">
                    POKE-{profileForm.username.toUpperCase().substring(0, 6)}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`https://pokedot.com/ref/POKE-${profileForm.username.toUpperCase().substring(0, 6)}`);
                    addNotification({
                      userId: '1',
                      type: 'system',
                      title: 'Link Copied!',
                      message: 'Referral link copied to clipboard'
                    });
                    toast.success('Referral link copied!');
                  }}
                  className="w-full bg-white text-green-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Copy Referral Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
