// Quick debug script to check what data is available
console.log('í´ Debug PokePage data flow...');

// This would be added to PokePage.tsx temporarily
const debugData = {
  availableUsers: availableUsers.map(u => ({
    id: u.id,
    _id: u._id,
    username: u.username,
    hasUserId: !!(u.id || u._id),
    userIdValue: u.id || u._id
  })),
  userData: availableUsers[0] ? {
    id: availableUsers[0].id,
    _id: availableUsers[0]._id,
    username: availableUsers[0].username
  } : null
};

console.log('Debug data:', debugData);
