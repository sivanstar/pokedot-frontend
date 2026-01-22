export interface Referral {
  id: string;
  referrerUserId: string;
  referrerCode: string;
  referredUserId: string;
  referredUsername: string;
  date: string;
  bonusPaid: boolean;
  bonusAmount: number; // 300
}

export interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  totalEarned: number;
  pendingEarnings: number;
  referralCode: string;
}

export const generateReferralCode = (username: string): string => {
  // Generate a referral code from username + random string
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `POKE-${username.toUpperCase().substring(0, 4)}-${random}`;
};

export const getReferralStats = (userId: string): ReferralStats => {
  const referrals: Referral[] = JSON.parse(localStorage.getItem('referrals') || '[]');
  const userReferrals = referrals.filter(ref => ref.referrerUserId === userId);
  
  const successful = userReferrals.filter(ref => ref.bonusPaid);
  const pending = userReferrals.filter(ref => !ref.bonusPaid);
  
  return {
    totalReferrals: userReferrals.length,
    successfulReferrals: successful.length,
    totalEarned: successful.reduce((sum, ref) => sum + ref.bonusAmount, 0),
    pendingEarnings: pending.reduce((sum, ref) => sum + ref.bonusAmount, 0),
    referralCode: localStorage.getItem('userReferralCode') || generateReferralCode('user' + userId.substring(0, 4))
  };
};

export const trackReferral = (referrerCode: string, referredUser: {id: string, username: string}) => {
  // In real app, this would call backend API
  // For demo, store in localStorage
  
  const referrals: Referral[] = JSON.parse(localStorage.getItem('referrals') || '[]');
  
  // Find referrer by code (in real app, this would be database lookup)
  const referrerUserId = 'demo-referrer-id'; // This would come from backend
  
  const newReferral: Referral = {
    id: `ref-${Date.now()}`,
    referrerUserId,
    referrerCode,
    referredUserId: referredUser.id,
    referredUsername: referredUser.username,
    date: new Date().toISOString(),
    bonusPaid: false, // Admin needs to approve payment
    bonusAmount: 300
  };
  
  referrals.push(newReferral);
  localStorage.setItem('referrals', JSON.stringify(referrals));
  
  return newReferral;
};
