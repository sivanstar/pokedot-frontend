import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Users, TrendingUp, DollarSign, Shield, Clock, 
  CheckCircle, Star, Award, Globe, Smartphone, Heart,
  ArrowRight, Play, Mail, Phone, MessageSquare, Store,
  Users as UsersIcon, Coins, Target, BarChart
} from 'lucide-react';
import { VendorInfo } from '../../components/home/VendorInfo';

export const HomePage: React.FC = () => {
  // Stats for homepage
  const stats = [
    { label: 'Active Users', value: '10,000+', icon: <Users className="w-6 h-6" /> },
    { label: 'Points Earned', value: '₦5M+', icon: <Coins className="w-6 h-6" /> },
    { label: 'Total Pokes', value: '500K+', icon: <Zap className="w-6 h-6" /> },
    { label: 'Withdrawals', value: '₦2M+', icon: <DollarSign className="w-6 h-6" /> },
  ];

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Poke & Earn',
      description: 'Earn ₦50 for every poke you send and receive. Simple, fun, and rewarding!',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Refer & Earn ₦300',
      description: 'Get ₦300 for each friend who signs up using your referral code.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Daily Rewards',
      description: 'Login daily to maintain your streak and earn bonus points.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Withdrawals',
      description: 'Withdraw your earnings directly to your bank account. Min ₦2,000 withdrawal.',
      color: 'from-orange-500 to-red-500'
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Get a Coupon Code',
      description: 'Purchase a coupon code from our authorized vendors below.',
      icon: <Store className="w-6 h-6" />
    },
    {
      step: 2,
      title: 'Create Account',
      description: 'Sign up with your coupon code and get ₦600 welcome bonus.',
      icon: <UsersIcon className="w-6 h-6" />
    },
    {
      step: 3,
      title: 'Start Poking',
      description: 'Poke other users to earn ₦50 per poke. Watch a short ad to complete each poke.',
      icon: <Zap className="w-6 h-6" />
    },
    {
      step: 4,
      title: 'Withdraw Earnings',
      description: 'Withdraw your points as cash every Mon/Wed/Fri (4pm-5pm). Min ₦2,000.',
      icon: <DollarSign className="w-6 h-6" />
    },
  ];

  const testimonials = [
    {
      name: 'Chidi N.',
      role: 'Student',
      content: 'I earn ₦5,000 weekly just by poking! This platform changed my financial life.',
      points: '25,000+ points',
      avatar: 'CN'
    },
    {
      name: 'Amina S.',
      role: 'Freelancer',
      content: 'The referral system is amazing. I made ₦9,000 in my first month from referrals!',
      points: '45,000+ points',
      avatar: 'AS'
    },
    {
      name: 'Emeka O.',
      role: 'Content Creator',
      content: 'Withdrawals are smooth and timely. I trust this platform with my earnings.',
      points: '68,000+ points',
      avatar: 'EO'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-grid-16" />
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Zap className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Poke-to-Earn Revolution</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Earn Real Money By<br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Poking Friends
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              POKEDOT turns social interactions into earnings. Poke, earn points, withdraw cash. 
              It's that simple! Start with ₦500 welcome bonus.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-all hover:scale-105 text-lg shadow-xl"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-all border border-white/30"
              >
                <Play className="mr-2 w-5 h-5" />
                See How It Works
              </a>
            </div>
            
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-center mb-2">
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-current text-white">
            <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z"></path>
          </svg>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              How POKEDOT Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Start earning in just 4 simple steps. No experience needed!
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {howItWorks.map((step) => (
              <div key={step.step} className="relative">
                <div className="bg-white rounded-2xl shadow-lg p-6 h-full border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white mb-6">
                    {step.icon}
                  </div>
                  
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {step.step}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                
                {step.step < 4 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-xl">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Withdrawal Schedule: Monday, Wednesday, Friday • 4pm-5pm only</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose POKEDOT?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The most rewarding social earning platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 h-full border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                  
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>100% Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor Section - MOST IMPORTANT */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm mb-4">
              <Store className="w-5 h-5 text-primary-600" />
              <span className="font-semibold text-primary-600">Get Started Here</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Purchase Coupon Codes
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Coupon code is required for signup. Purchase from our authorized vendors below.
            </p>
            
            <div className="bg-white rounded-xl p-6 max-w-2xl mx-auto shadow-lg">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white">
                  <Target className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-800 mb-2">Important Notice</h4>
                  <ul className="text-gray-600 space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Each code can only be used once for signup</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Vendors are authorized resellers of coupon codes</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Get ₦500 welcome bonus after successful signup</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Vendor Listing Component */}
          <div className="max-w-6xl mx-auto">
            <VendorInfo />
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-xl hover:opacity-90 transition-all hover:scale-105 text-lg shadow-xl"
            >
              Ready to Sign Up?
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Success Stories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See what our users are saying about their POKEDOT experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="text-sm font-semibold text-primary-600">
                    {testimonial.points}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Got questions? We've got answers
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: 'How do I get a coupon code?',
                a: 'Purchase a coupon code from our authorized vendors listed above. Each vendor has contact details for easy purchase.'
              },
              {
                q: 'How much can I earn per poke?',
                a: 'You earn ₦50 for each poke sent and received. However, you must watch a short ad before poking to earn.'
              },
              {
                q: 'What are the withdrawal rules?',
                a: 'Minimum withdrawal is ₦2,000. Withdrawals are only processed on Mondays, Wednesdays, and Fridays between 4pm-5pm.'
              },
              {
                q: 'How does the referral system work?',
                a: 'When someone uses your referral code to sign up, YOU earn ₦300 (not the new user). Share your code to earn more!'
              },
              {
                q: 'Is there a daily limit for poking?',
                a: 'Yes, you can only poke 2 different users per day, and receive pokes from 2 different users per day.'
              },
              {
                q: 'How do I contact support?',
                a: 'Use the support email: support@pokedot.com or reach out to any vendor who can assist you.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-3">{faq.q}</h4>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Earning?
          </h2>
          
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of people who are already earning extra income with POKEDOT.
            Get your coupon code today and start your journey!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-all hover:scale-105 text-lg shadow-xl"
            >
              Get Your Coupon Code
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-xl hover:bg-white/10 transition-all border-2 border-white"
            >
              Already Have Account?
            </Link>
          </div>
          
          <div className="mt-12 pt-12 border-t border-white/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">24/7</div>
                <div className="text-sm text-white/80">Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">100%</div>
                <div className="text-sm text-white/80">Secure</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">Instant</div>
                <div className="text-sm text-white/80">Payouts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">500+</div>
                <div className="text-sm text-white/80">Daily Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">POKEDOT</span>
              </div>
              <p className="text-gray-400">
                Top #1 Poke-to-Earn platform. Turn social interactions into real earnings.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/register" className="hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
                <li><a href="#faq" className="hover:text-white">FAQs</a></li>
                <li><a href="#vendors" className="hover:text-white">Vendor List</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>support@pokedot.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+234 800 000 0000</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} POKEDOT. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
