// Team Types
export interface Team {
  id: string;
  name: string;
  shortName: string;
  memberCount: number;
  level: 'A' | 'B' | 'C' | 'D';
  totalGames: number;
  aiReports: number;
  activeDays: number;
  logo?: string;
}

// AI Coaching Types
export interface AICoaching {
  id: string;
  date: string;
  matchTitle: string;
  opponent: string;
  result: 'win' | 'lose' | 'draw';
  strength: string;
  improvement: string;
}

// Activity Types
export interface Activity {
  id: string;
  type: 'message' | 'match' | 'report' | 'member';
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  teamId?: string;
}
