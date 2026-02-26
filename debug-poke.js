const axios = require('axios');

async function debugPokeIssue() {
  console.log('Ì¥ç Debugging Poke Issue\n');
  
  try {
    // 1. First, test if backend is running
    console.log('1. Testing backend health...');
    const health = await axios.get('http://localhost:3000/api/health');
    console.log('   ‚úÖ Backend is running:', health.data.status);
    
    // 2. Create a test user
    console.log('\n2. Creating test user...');
    const register = await axios.post('http://localhost:3000/api/auth/register', {
      username: 'debuguser',
      email: 'debug@test.com',
      password: 'Test123!'
    });
    
    const token = register.data.token;
    const userId = register.data.user._id;
    console.log('   ‚úÖ User created:', register.data.user.username);
    console.log('   User ID:', userId);
    console.log('   Token:', token.substring(0, 20) + '...');
    
    // 3. Try to get available users
    console.log('\n3. Getting available users...');
    const available = await axios.get('http://localhost:3000/api/users/available', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('   Available users:', available.data.users.length);
    
    if (available.data.users.length > 0) {
      const targetUser = available.data.users[0];
      console.log('   Target user:', targetUser.username);
      console.log('   Target user ID:', targetUser._id);
      
      // 4. Try to poke
      console.log('\n4. Attempting to poke...');
      try {
        const poke = await axios.post(
          `http://localhost:3000/api/poke/users/${targetUser._id}/poke`,
          { adTaskId: 'debug-ad-123' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('   ‚úÖ Poke successful!');
        console.log('   Response:', poke.data);
      } catch (pokeError) {
        console.log('   ‚ùå Poke failed');
        console.log('   Status:', pokeError.response?.status);
        console.log('   Error:', pokeError.response?.data);
        
        if (pokeError.response?.status === 500) {
          console.log('\n   Ì¥ß Checking backend logs for 500 error...');
          console.log('   Likely causes:');
          console.log('   1. User ID format mismatch');
          console.log('   2. Database query error');
          console.log('   3. Missing user in database');
        }
      }
    } else {
      console.log('   No users available to poke');
      console.log('   Creating another user to test with...');
      
      const user2 = await axios.post('http://localhost:3000/api/auth/register', {
        username: 'debuguser2',
        email: 'debug2@test.com',
        password: 'Test123!'
      });
      
      console.log('   Second user created:', user2.data.user.username);
      console.log('   Try poking between these two users');
    }
    
  } catch (error) {
    console.error('Debug failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

debugPokeIssue();
