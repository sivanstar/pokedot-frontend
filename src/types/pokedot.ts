export interface DailyPokeLimits {
  date: string;
  pokesSent: number;
  pokesReceived: number;
  pokedUsers: string[];
  receivedFrom: string[];
}

export interface CouponCode {
  code: string;
  valid: boolean;
  used: boolean;
  expiresAt?: string;
}

export interface ReferralStats {
  totalReferrals: number;
  earnedPoints: number;
  pendingReferrals: number;
  referralCode: string;
}

export interface WithdrawalSchedule {
  allowedDays: number[]; // 1=Monday, 3=Wednesday, 5=Friday
  startHour: number; // 16 = 4pm
  endHour: number; // 17 = 5pm
  minAmount: number; // 2000
}

export interface AdTask {
  url: string;
  required: boolean;
  pointsReward: number;
  completed: boolean;
}
