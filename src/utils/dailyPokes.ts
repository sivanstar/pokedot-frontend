export interface DailyPokeRecord {
  date: string; // YYYY-MM-DD
  pokesSent: number;
  pokesReceived: number;
  pokedUsers: string[]; // User IDs poked today
  receivedFrom: string[]; // User IDs who poked you today
}

export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

export const getDailyPokes = (): DailyPokeRecord => {
  const today = getTodayDate();
  const stored = localStorage.getItem('dailyPokes');
  
  if (stored) {
    const record: DailyPokeRecord = JSON.parse(stored);
    // Reset if it's a new day
    if (record.date !== today) {
      const newRecord: DailyPokeRecord = {
        date: today,
        pokesSent: 0,
        pokesReceived: 0,
        pokedUsers: [],
        receivedFrom: []
      };
      localStorage.setItem('dailyPokes', JSON.stringify(newRecord));
      return newRecord;
    }
    return record;
  }
  
  // Initialize new record
  const newRecord: DailyPokeRecord = {
    date: today,
    pokesSent: 0,
    pokesReceived: 0,
    pokedUsers: [],
    receivedFrom: []
  };
  localStorage.setItem('dailyPokes', JSON.stringify(newRecord));
  return newRecord;
};

export const incrementPokesSent = (userId: string): boolean => {
  const record = getDailyPokes();
  
  // Check if user has already been poked today
  if (record.pokedUsers.includes(userId)) {
    return false; // Already poked this user today
  }
  
  // Check daily limit (2 pokes per day)
  if (record.pokesSent >= 2) {
    return false; // Daily limit reached
  }
  
  // Update record
  record.pokesSent++;
  record.pokedUsers.push(userId);
  localStorage.setItem('dailyPokes', JSON.stringify(record));
  return true;
};

export const incrementPokesReceived = (userId: string): boolean => {
  const record = getDailyPokes();
  
  // Check if already received from this user today
  if (record.receivedFrom.includes(userId)) {
    return false;
  }
  
  // Check daily receive limit (2 pokes per day)
  if (record.pokesReceived >= 2) {
    return false;
  }
  
  // Update record
  record.pokesReceived++;
  record.receivedFrom.push(userId);
  localStorage.setItem('dailyPokes', JSON.stringify(record));
  return true;
};

export const getRemainingPokes = () => {
  const record = getDailyPokes();
  return {
    remainingSends: Math.max(0, 2 - record.pokesSent),
    remainingReceives: Math.max(0, 2 - record.pokesReceived),
    today: record.date
  };
};
