const axios = require('axios');

async function debugAPI() {
  try {
    console.log('Ì¥ç Debugging API response structure...\n');
    
    // 1. Login to get token
    const login = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'test@example.com',
      password: 'Test123!'
    }).catch(() => {
      // If login fails, register first
      return axios.post('http://localhost:3000/api/auth/register', {
        username: 'debuguser',
        email: 'debug@test.com',
        password: 'Test123!'
      });
    });
    
    const token = login.data.token;
    console.log('‚úÖ Token obtained\n');
    
    // 2. Get available users
    const available = await axios.get('http://localhost:3000/api/users/available', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Ì≥ã Available Users Response Structure:');
    console.log('=======================================');
    console.log('Success:', available.data.success);
    console.log('Users count:', available.data.users?.length || 0);
    
    if (available.data.users && available.data.users.length > 0) {
      const firstUser = available.data.users[0];
      console.log('\nÌ≥ä First user object keys:', Object.keys(firstUser));
      console.log('\nÌ¥ç First user data:');
      console.log('  _id:', firstUser._id);
      console.log('  id:', firstUser.id);
      console.log('  username:', firstUser.username);
      console.log('  points:', firstUser.points);
      console.log('  pokesSent:', firstUser.pokesSent);
      console.log('  pokesReceived:', firstUser.pokesReceived);
      console.log('  streak:', firstUser.streak);
      console.log('  rank:', firstUser.rank);
      console.log('  isOnline:', firstUser.isOnline);
      console.log('  canPoke:', firstUser.canPoke);
      console.log('  reason:', firstUser.reason);
    }
    
    // 3. Get user profile to see structure
    const profile = await axios.get('http://localhost:3000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('\nÌ±§ Current User Profile Structure:');
    console.log('==================================');
    console.log('Keys:', Object.keys(profile.data.user));
    console.log('_id:', profile.data.user._id);
    console.log('id:', profile.data.user.id);
    
  } catch (error) {
    console.error('‚ùå Debug error:', error.response?.data || error.message);
  }
}

debugAPI();
