import React from 'react';
import { Store, MessageSquare, CheckCircle } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  whatsapp: string;
  photoColor: string;
  initials: string;
}

export const VendorInfo: React.FC = () => {
  const vendors: Vendor[] = [
    {
      id: '1',
      name: 'Coupon Master NG',
      whatsapp: '+2347012345678',
      photoColor: 'from-blue-500 to-cyan-500',
      initials: 'CM'
    },
    {
      id: '2',
      name: 'Poke Vouchers Ltd',
      whatsapp: '+2348023456789',
      photoColor: 'from-green-500 to-emerald-500',
      initials: 'PV'
    },
    {
      id: '3',
      name: 'EZ Coupons Nigeria',
      whatsapp: '+2349034567890',
      photoColor: 'from-purple-500 to-pink-500',
      initials: 'EZ'
    },
    {
      id: '4',
      name: 'Naija Poke Deals',
      whatsapp: '+2347045678901',
      photoColor: 'from-orange-500 to-red-500',
      initials: 'NP'
    },
    {
      id: '5',
      name: 'Quick Voucher NG',
      whatsapp: '+2348056789012',
      photoColor: 'from-yellow-500 to-amber-500',
      initials: 'QV'
    },
    {
      id: '6',
      name: 'Poke Code Express',
      whatsapp: '+2349067890123',
      photoColor: 'from-indigo-500 to-blue-500',
      initials: 'PC'
    },
  ];

  const handleWhatsApp = (vendor: Vendor) => {
    const message = `Hello ${vendor.name}, I want to purchase a POKEDOT coupon code.`;
    const url = `https://wa.me/${vendor.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4">
          <Store className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Authorized Coupon Vendors</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Contact any vendor below via WhatsApp to purchase your POKEDOT coupon code. 
          Standard price: ₦600 per code.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow hover:border-primary-300 text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${vendor.photoColor} text-white text-2xl font-bold mb-4`}>
              {vendor.initials}
            </div>
            
            <h4 className="text-lg font-bold text-gray-800 mb-2">{vendor.name}</h4>
            
            <div className="inline-flex items-center space-x-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm mb-4">
              <CheckCircle className="w-4 h-4" />
              <span>Verified Vendor</span>
            </div>
            
            <button
              onClick={() => handleWhatsApp(vendor)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-all hover:scale-105"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Contact via WhatsApp</span>
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="text-center mb-4">
          <h4 className="text-lg font-bold text-blue-800">Important Information</h4>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center border border-blue-100">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-3">
              <span className="font-bold">₦500</span>
            </div>
            <p className="font-medium text-gray-800">Standard Price</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center border border-blue-100">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <p className="font-medium text-gray-800">Instant Delivery</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center border border-blue-100">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-3">
              <Store className="w-6 h-6" />
            </div>
            <p className="font-medium text-gray-800">Trusted Vendors</p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-blue-200 text-center">
          <p className="text-sm text-blue-700">
            All coupon codes are generated from the official admin panel.
          </p>
        </div>
      </div>
    </div>
  );
};
