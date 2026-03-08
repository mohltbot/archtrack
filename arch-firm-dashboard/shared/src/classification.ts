// Activity Classification System for ArchTrack
// Defines categories, productivity scores, and classification rules

export type ActivityCategory = 
  | 'software_dev'
  | 'devops'
  | 'research_docs'
  | 'communication_active'
  | 'internal_tools'
  | 'design_work'
  | 'social_media'
  | 'entertainment'
  | 'gaming'
  | 'shopping'
  | 'news_blogs'
  | 'other';

export type ProductivityLevel = 'productive' | 'neutral' | 'unproductive';

export interface ActivityClassification {
  category: ActivityCategory;
  categoryName: string;
  productivityScore: number; // 0-100
  productivityLevel: ProductivityLevel;
  isSuspicious: boolean;
  suspiciousReason?: string;
}

export interface SuspiciousPattern {
  type: 'youtube_idle' | 'slack_ghost' | 'social_work_hours' | 'rapid_switching' | 'fake_active';
  description: string;
  threshold: number; // in minutes or count
}

// Productivity scores by category (0-100)
export const PRODUCTIVITY_SCORES: Record<ActivityCategory, number> = {
  software_dev: 95,
  devops: 90,
  research_docs: 85,
  communication_active: 75,
  internal_tools: 80,
  design_work: 90,
  social_media: 10,
  entertainment: 5,
  gaming: 0,
  shopping: 5,
  news_blogs: 20,
  other: 50
};

export const CATEGORY_NAMES: Record<ActivityCategory, string> = {
  software_dev: 'Software Development',
  devops: 'DevOps/Infrastructure',
  research_docs: 'Research & Documentation',
  communication_active: 'Communication (Active)',
  internal_tools: 'Internal Tools',
  design_work: 'Design Work',
  social_media: 'Social Media',
  entertainment: 'Entertainment',
  gaming: 'Gaming',
  shopping: 'Shopping',
  news_blogs: 'News/Blogs',
  other: 'Other/Uncategorized'
};

export const PRODUCTIVITY_LEVELS: Record<ActivityCategory, ProductivityLevel> = {
  software_dev: 'productive',
  devops: 'productive',
  research_docs: 'productive',
  communication_active: 'productive',
  internal_tools: 'productive',
  design_work: 'productive',
  social_media: 'unproductive',
  entertainment: 'unproductive',
  gaming: 'unproductive',
  shopping: 'unproductive',
  news_blogs: 'unproductive',
  other: 'neutral'
};

// App classification rules - maps app names/window titles to categories
interface AppRule {
  patterns: string[];
  category: ActivityCategory;
  exceptions?: string[]; // Window title exceptions (e.g., "tutorial" for YouTube)
}

export const APP_CLASSIFICATION_RULES: AppRule[] = [
  // Software Development
  {
    patterns: ['cursor', 'vscode', 'visual studio code', 'code -', 'intellij', 'idea', 'pycharm', 'webstorm', 'xcode', 'android studio', 'sublime text', 'atom', 'vim', 'neovim', 'nvim', 'emacs'],
    category: 'software_dev'
  },
  {
    patterns: ['github', 'gitlab', 'bitbucket', 'source tree', 'sourcetree', 'gitkraken', 'fork - git'],
    category: 'software_dev'
  },
  
  // DevOps/Infrastructure
  {
    patterns: ['terminal', 'iterm', 'hyper', 'alacritty', 'wezterm', 'kitty', 'command prompt', 'powershell', 'windows terminal'],
    category: 'devops'
  },
  {
    patterns: ['docker', 'kubernetes', 'kubectl', 'helm', 'terraform', 'ansible', 'jenkins', 'circleci', 'travis', 'github actions', 'aws console', 'gcp console', 'azure portal'],
    category: 'devops'
  },
  
  // Research & Documentation
  {
    patterns: ['notion', 'confluence', 'obsidian', 'evernote', 'onenote', 'bear', 'roam research'],
    category: 'research_docs'
  },
  {
    patterns: ['google docs', 'google sheets', 'google slides', 'microsoft word', 'microsoft excel', 'powerpoint'],
    category: 'research_docs'
  },
  {
    patterns: ['stackoverflow', 'stack overflow', 'github docs', 'docs.github', 'developer.mozilla', 'mdn'],
    category: 'research_docs'
  },
  
  // Communication (Active)
  {
    patterns: ['slack', 'microsoft teams', 'teams -', 'zoom', 'google meet', 'webex', 'skype', 'discord', 'telegram'],
    category: 'communication_active'
  },
  
  // Internal Tools
  {
    patterns: ['mission control', 'archtrack', 'admin panel', 'dashboard - internal', 'intranet'],
    category: 'internal_tools'
  },
  
  // Design Work
  {
    patterns: ['figma', 'sketch', 'adobe photoshop', 'adobe illustrator', 'adobe xd', 'invision', 'canva', 'gimp', 'inkscape', 'blender', 'autocad', 'revit', 'sketchup'],
    category: 'design_work'
  },
  
  // Social Media
  {
    patterns: ['facebook', 'instagram', 'twitter', 'x.com', 'tiktok', 'reddit', 'linkedin', 'pinterest', 'snapchat', 'whatsapp web'],
    category: 'social_media'
  },
  
  // Entertainment
  {
    patterns: ['youtube', 'netflix', 'hulu', 'disney+', 'amazon prime video', 'spotify', 'apple music', 'tidal', 'pandora'],
    category: 'entertainment',
    exceptions: ['tutorial', 'course', 'lecture', 'how to', 'documentation', 'docs']
  },
  
  // Gaming
  {
    patterns: ['steam', 'epic games', 'origin', 'battle.net', 'gog galaxy', 'xbox', 'playstation', 'twitch', 'discord - playing'],
    category: 'gaming'
  },
  
  // Shopping
  {
    patterns: ['amazon', 'ebay', 'etsy', 'shopify', 'walmart', 'target', 'best buy', 'aliexpress', 'taobao'],
    category: 'shopping'
  },
  
  // News/Blogs
  {
    patterns: ['cnn', 'bbc', 'buzzfeed', 'medium', 'huffpost', 'fox news', 'msnbc', 'reuters', 'associated press', 'news.ycombinator', 'hackernews'],
    category: 'news_blogs'
  }
];

// Suspicious pattern thresholds (in minutes)
export const SUSPICIOUS_THRESHOLDS = {
  youtubeIdle: 30, // YouTube active with no other window changes for 30 min
  slackGhost: 10,  // Slack "active" but no input for 10 min
  rapidSwitching: 5, // Switching windows every <5 seconds
  workHoursStart: 9, // 9 AM
  workHoursEnd: 17   // 5 PM
};

// Classify an activity based on app name and window title
export function classifyActivity(
  appName: string, 
  windowTitle: string,
  context?: {
    durationMinutes?: number;
    hasInputActivity?: boolean;
    switchFrequencySeconds?: number;
    windowChangeCount?: number;
    currentHour?: number;
  }
): ActivityClassification {
  const text = `${appName} ${windowTitle}`.toLowerCase();
  
  // Find matching rule
  let matchedCategory: ActivityCategory = 'other';
  
  for (const rule of APP_CLASSIFICATION_RULES) {
    const matchesPattern = rule.patterns.some(pattern => 
      appName.toLowerCase().includes(pattern) || 
      windowTitle.toLowerCase().includes(pattern)
    );
    
    if (matchesPattern) {
      // Check exceptions
      if (rule.exceptions) {
        const hasException = rule.exceptions.some(ex => 
          windowTitle.toLowerCase().includes(ex)
        );
        if (hasException) {
          // If it's YouTube with tutorial, treat as research
          if (rule.category === 'entertainment') {
            matchedCategory = 'research_docs';
            break;
          }
          continue;
        }
      }
      matchedCategory = rule.category;
      break;
    }
  }
  
  // Check for suspicious patterns
  let isSuspicious = false;
  let suspiciousReason: string | undefined;
  
  if (context) {
    // YouTube trick: YouTube active for >30 min with no other window changes
    if (matchedCategory === 'entertainment' && appName.toLowerCase().includes('youtube')) {
      if (context.durationMinutes && context.durationMinutes > SUSPICIOUS_THRESHOLDS.youtubeIdle) {
        if (!context.windowChangeCount || context.windowChangeCount === 0) {
          isSuspicious = true;
          suspiciousReason = `YouTube active ${context.durationMinutes}min with no other activity - likely keeping laptop awake`;
        }
      }
    }
    
    // Slack ghost: Slack "active" but no input for >10 min
    if (matchedCategory === 'communication_active' && appName.toLowerCase().includes('slack')) {
      if (!context.hasInputActivity && context.durationMinutes && context.durationMinutes > SUSPICIOUS_THRESHOLDS.slackGhost) {
        isSuspicious = true;
        suspiciousReason = `Slack "active" but no input for ${context.durationMinutes}min - likely idle`;
      }
    }
    
    // Social during work hours
    if (PRODUCTIVITY_LEVELS[matchedCategory] === 'unproductive') {
      const hour = context.currentHour ?? new Date().getHours();
      if (hour >= SUSPICIOUS_THRESHOLDS.workHoursStart && hour < SUSPICIOUS_THRESHOLDS.workHoursEnd) {
        // Flag it but don't mark as suspicious - just unproductive
        // We could add additional scoring logic here
      }
    }
    
    // Rapid switching
    if (context.switchFrequencySeconds && context.switchFrequencySeconds < 5) {
      isSuspicious = true;
      suspiciousReason = `Rapid window switching (${context.switchFrequencySeconds.toFixed(1)}s avg) - distracted, not focused`;
    }
  }
  
  return {
    category: matchedCategory,
    categoryName: CATEGORY_NAMES[matchedCategory],
    productivityScore: PRODUCTIVITY_SCORES[matchedCategory],
    productivityLevel: PRODUCTIVITY_LEVELS[matchedCategory],
    isSuspicious,
    suspiciousReason
  };
}

// Calculate focus score based on activity patterns
export function calculateFocusScore(
  activities: Array<{
    category: ActivityCategory;
    duration: number;
    isSuspicious: boolean;
  }>
): number {
  if (activities.length === 0) return 0;
  
  let totalDuration = 0;
  let weightedScore = 0;
  
  for (const activity of activities) {
    const weight = activity.duration;
    totalDuration += weight;
    
    let score = PRODUCTIVITY_SCORES[activity.category];
    
    // Penalize suspicious activities
    if (activity.isSuspicious) {
      score = Math.max(0, score - 30);
    }
    
    weightedScore += score * weight;
  }
  
  return totalDuration > 0 ? Math.round(weightedScore / totalDuration) : 0;
}

// Calculate productive vs unproductive time breakdown
export function calculateTimeBreakdown(
  activities: Array<{
    category: ActivityCategory;
    duration: number;
  }>
): {
  productiveMinutes: number;
  neutralMinutes: number;
  unproductiveMinutes: number;
  totalMinutes: number;
} {
  let productive = 0;
  let neutral = 0;
  let unproductive = 0;
  
  for (const activity of activities) {
    const minutes = activity.duration / 60;
    const level = PRODUCTIVITY_LEVELS[activity.category];
    
    if (level === 'productive') productive += minutes;
    else if (level === 'neutral') neutral += minutes;
    else unproductive += minutes;
  }
  
  return {
    productiveMinutes: Math.round(productive),
    neutralMinutes: Math.round(neutral),
    unproductiveMinutes: Math.round(unproductive),
    totalMinutes: Math.round(productive + neutral + unproductive)
  };
}
