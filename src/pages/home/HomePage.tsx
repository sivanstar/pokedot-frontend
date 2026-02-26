import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Users, Trophy, Shield, ArrowRight, Sparkles, Star, 
  TrendingUp, Clock, Award, MessageCircle, CheckCircle, 
  Wallet, Gift, Flame, Crown, ChevronRight
} from 'lucide-react';

export const HomePage: React.FC = () => {
  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Chioma Okafor",
      role: "Student, Lagos",
      content: "I've earned over ₦50,000 from POKEDOT in just 3 months. The withdrawals are always on time!",
      rating: 5,
      image: "https://media.istockphoto.com/id/1311107708/photo/focused-cute-stylish-african-american-female-student-with-afro-dreadlocks-studying-remotely.jpg?s=612x612&w=0&k=20&c=OwxBza5YzLWkE_2abTKqLLW4hwhmM2PW9BotzOMMS5w="
    },
    {
      id: 2,
      name: "Emeka Nwachukwu",
      role: "Freelancer, Abuja",
      content: "Best decision ever! I use my daily earnings to buy data and airtime. Life changer!",
      rating: 5,
      image: "https://media.istockphoto.com/id/1290528178/photo/be-so-good-you-become-your-own-source-of-inspiration.jpg?s=612x612&w=0&k=20&c=kTmOEh9wv9vUC3cN_Ps8H2XCnXaly7yzZg7ybLsLi7Q="
    },
    {
      id: 3,
      name: "Aisha Bello",
      role: "Entrepreneur, Kano",
      content: "The referral program is amazing. I've referred 20 friends and made extra ₦6,000!",
      rating: 5,
      image: "https://media.istockphoto.com/id/2195671362/photo/portrait-of-young-african-muslim-woman-with-laptop-sitting-at-desk-in-her-room.jpg?s=612x612&w=0&k=20&c=sb-29GCTclDWx1OpO265O3pT9NpltOpV5ONA9i52XQE="
    }
  ];

  // Features
  const features = [
    {
      icon: <Gift className="w-6 h-6" />,
      title: "500 Free Points",
      description: "Get 500 points instantly after signup"
    },
    {
      icon: <Flame className="w-6 h-6" />,
      title: "Daily Streaks",
      description: "Earn bonuses for logging in daily"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Refer & Earn",
      description: "₦300 for every friend you refer"
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      title: "Instant Withdrawals",
      description: "Cash out to your bank account"
    },
    {
      icon: <Crown className="w-6 h-6" />,
      title: "Leaderboard",
      description: "Compete for top prizes"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Achievements",
      description: "Unlock special rewards"
    }
  ];

  // Stats
  const stats = [
    { value: "50K+", label: "Active Users" },
    { value: "₦2.5M+", label: "Paid Out" },
    { value: "4.8★", label: "App Rating" },
    { value: "500K+", label: "Daily Pokes" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Clean and Modern */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Poke, Earn,{' '}
                <span className="text-yellow-300">Withdraw</span>
              </h1>
              
              <p className="text-xl opacity-90 mb-8 max-w-lg">
                The first social platform that pays you for connecting with friends. Start earning today!
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-2xl"
                >
                  <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Get 500 Free Points
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/20 text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/30 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
                >
                  Sign In
                </Link>
              </div>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-300" />
                  <span className="text-sm">Bank Transfers</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-300" />
                  <span className="text-sm">24/7 Support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-300" />
                  <span className="text-sm">Secure & Safe</span>
                </div>
              </div>
            </div>
            
            {/* Right Content - Single Hero Image */}
            <div className="relative lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Happy users using POKEDOT app"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                
                {/* Floating Stats Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Latest Withdrawal</div>
                        <div className="font-bold text-gray-800">₦50,000</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">2 mins ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar - Clean Stats Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid - Clean Cards */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why People Love POKEDOT</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Simple, fun, and rewarding - everything you need in one app
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-6 text-primary-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works - Simple 3 Steps */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
            <p className="text-gray-600 text-lg">Start earning in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Sign Up Free",
                description: "Create your account in seconds - no credit card needed"
              },
              {
                step: "02",
                title: "Poke Friends",
                description: "Send pokes and earn 50 points for every interaction"
              },
              {
                step: "03",
                title: "Withdraw Cash",
                description: "Convert your points to money and withdraw to your bank"
              }
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="text-6xl font-bold text-primary-100 mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/3 -right-6 text-primary-300">
                    <ChevronRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials - Clean Cards */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Real People, Real Earnings</h2>
            <p className="text-gray-600 text-lg">Join thousands of happy users</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-primary-100"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                    <div className="flex mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">"{testimonial.content}"</p>
                <div className="mt-4 flex items-center text-primary-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Verified Earnings</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section - Minimal */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Common Questions</h2>
            <p className="text-gray-600">Everything you need to know about POKEDOT</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How do I earn points?",
                a: "Earn 50 points every time you poke another user. Both you and the person you poke receive points. You can poke up to 2 users per day."
              },
              {
                q: "When can I withdraw?",
                a: "Once you reach 2,000 points, request withdrawal on Mon/Wed/Fri between 4-5 PM. Money hits your bank in 3-5 business days."
              },
              {
                q: "Is it really free?",
                a: "100% free! You get 500 points just for signing up. No credit card required."
              },
              {
                q: "How does referrals work?",
                a: "Share your unique code. When friends join, you earn ₦300. Unlimited referrals!"
              }
            ].map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 hover:border-primary-200 transition-colors">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA - Clean */}
      <div className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Join thousands of Nigerians earning daily on POKEDOT
            </p>
            <Link
              to="/register"
              className="group inline-flex items-center justify-center px-10 py-5 bg-white text-primary-600 rounded-xl font-bold text-xl hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
              Get 500 Free Points
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-sm text-white/70 mt-8">
              No credit card • 100% Free • Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">POKEDOT</span>
            </div>
            <div className="flex space-x-8 text-sm">
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} POKEDOT. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Add animation keyframes */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};
