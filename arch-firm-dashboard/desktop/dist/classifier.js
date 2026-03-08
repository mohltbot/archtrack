"use strict";
// Activity Classification System
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUSPICIOUS_THRESHOLDS = void 0;
exports.classifyActivity = classifyActivity;
exports.calculateFocusScore = calculateFocusScore;
exports.calculateTimeBreakdown = calculateTimeBreakdown;
// App classification rules
const APP_RULES = {
    // Productive - Software Development
    'Cursor': { category: 'software_dev', categoryName: 'Software Development', productivityScore: 95, productivityLevel: 'productive' },
    'Visual Studio Code': { category: 'software_dev', categoryName: 'Software Development', productivityScore: 95, productivityLevel: 'productive' },
    'Code': { category: 'software_dev', categoryName: 'Software Development', productivityScore: 95, productivityLevel: 'productive' },
    'Xcode': { category: 'software_dev', categoryName: 'Software Development', productivityScore: 95, productivityLevel: 'productive' },
    'IntelliJ': { category: 'software_dev', categoryName: 'Software Development', productivityScore: 95, productivityLevel: 'productive' },
    'GitHub Desktop': { category: 'software_dev', categoryName: 'Software Development', productivityScore: 90, productivityLevel: 'productive' },
    // Productive - DevOps/Infrastructure
    'Terminal': { category: 'devops', categoryName: 'DevOps/Infrastructure', productivityScore: 90, productivityLevel: 'productive' },
    'iTerm2': { category: 'devops', categoryName: 'DevOps/Infrastructure', productivityScore: 90, productivityLevel: 'productive' },
    'Docker Desktop': { category: 'devops', categoryName: 'DevOps/Infrastructure', productivityScore: 85, productivityLevel: 'productive' },
    // Productive - Research & Documentation
    'Notion': { category: 'research', categoryName: 'Research & Documentation', productivityScore: 85, productivityLevel: 'productive' },
    'Obsidian': { category: 'research', categoryName: 'Research & Documentation', productivityScore: 85, productivityLevel: 'productive' },
    'Stack Overflow': { category: 'research', categoryName: 'Research & Documentation', productivityScore: 80, productivityLevel: 'productive' },
    // Communication - Will be refined by window title
    'Slack': { category: 'communication_active', categoryName: 'Communication', productivityScore: 70, productivityLevel: 'productive' },
    'Microsoft Teams': { category: 'communication_active', categoryName: 'Communication', productivityScore: 70, productivityLevel: 'productive' },
    'Zoom': { category: 'communication_active', categoryName: 'Communication', productivityScore: 75, productivityLevel: 'productive' },
    'Discord': { category: 'communication_active', categoryName: 'Communication', productivityScore: 60, productivityLevel: 'neutral' },
    // Internal Tools
    'Electron': { category: 'internal_tools', categoryName: 'Internal Tools', productivityScore: 85, productivityLevel: 'productive' },
    // Design
    'Figma': { category: 'design', categoryName: 'Design', productivityScore: 90, productivityLevel: 'productive' },
    'Sketch': { category: 'design', categoryName: 'Design', productivityScore: 90, productivityLevel: 'productive' },
    'Adobe Photoshop': { category: 'design', categoryName: 'Design', productivityScore: 85, productivityLevel: 'productive' },
    // Unproductive - Social Media
    'Facebook': { category: 'social_media', categoryName: 'Social Media', productivityScore: 10, productivityLevel: 'unproductive' },
    'Instagram': { category: 'social_media', categoryName: 'Social Media', productivityScore: 5, productivityLevel: 'unproductive' },
    'Twitter': { category: 'social_media', categoryName: 'Social Media', productivityScore: 15, productivityLevel: 'unproductive' },
    'X': { category: 'social_media', categoryName: 'Social Media', productivityScore: 15, productivityLevel: 'unproductive' },
    'TikTok': { category: 'social_media', categoryName: 'Social Media', productivityScore: 5, productivityLevel: 'unproductive' },
    'Reddit': { category: 'social_media', categoryName: 'Social Media', productivityScore: 20, productivityLevel: 'unproductive' },
    // Unproductive - Entertainment
    'YouTube': { category: 'entertainment', categoryName: 'Entertainment', productivityScore: 10, productivityLevel: 'unproductive' },
    'Netflix': { category: 'entertainment', categoryName: 'Entertainment', productivityScore: 5, productivityLevel: 'unproductive' },
    'Spotify': { category: 'entertainment', categoryName: 'Entertainment', productivityScore: 30, productivityLevel: 'unproductive' },
    // Unproductive - Shopping
    'Amazon': { category: 'shopping', categoryName: 'Shopping', productivityScore: 10, productivityLevel: 'unproductive' },
    'eBay': { category: 'shopping', categoryName: 'Shopping', productivityScore: 10, productivityLevel: 'unproductive' },
    // Unproductive - Gaming
    'Steam': { category: 'gaming', categoryName: 'Gaming', productivityScore: 5, productivityLevel: 'unproductive' },
};
// Window title patterns for refinement
const TITLE_PATTERNS = [
    // Research patterns (override social media if researching)
    { pattern: /stackoverflow\.com|github\.com\/docs|docs\./i, classification: { category: 'research', categoryName: 'Research & Documentation', productivityScore: 80, productivityLevel: 'productive' } },
    { pattern: /tutorial|documentation|how to|guide/i, classification: { category: 'research', categoryName: 'Research & Documentation', productivityScore: 75, productivityLevel: 'productive' } },
    // YouTube exceptions
    { pattern: /youtube.*(tutorial|course|learn|programming|coding)/i, classification: { category: 'research', categoryName: 'Research & Documentation', productivityScore: 70, productivityLevel: 'productive' } },
    // Slack/Teams refinement
    { pattern: /slack.*(unread|new messages|mention)/i, classification: { category: 'communication_active', categoryName: 'Active Communication', productivityScore: 75, productivityLevel: 'productive' } },
    { pattern: /zoom.*(meeting|call|in progress)/i, classification: { category: 'communication_active', categoryName: 'Active Meeting', productivityScore: 80, productivityLevel: 'productive' } },
];
// Suspicious activity detection thresholds
exports.SUSPICIOUS_THRESHOLDS = {
    YOUTUBE_IDLE_MINUTES: 30, // YouTube active but no input for 30min
    SLACK_IDLE_MINUTES: 10, // Slack "active" but no input for 10min
    RAPID_SWITCH_SECONDS: 5, // Switching windows every <5 seconds
    DISTRACTED_SWITCH_COUNT: 10, // 10+ rapid switches = distracted
};
function classifyActivity(appName, windowTitle, idleTimeSeconds, context) {
    // Start with app-based classification
    let classification = {
        category: 'admin_other',
        categoryName: 'Admin/Other',
        productivityScore: 50,
        productivityLevel: 'neutral',
        isSuspicious: false,
    };
    // Find matching app rule
    const appRule = APP_RULES[appName] || APP_RULES[Object.keys(APP_RULES).find(k => appName.toLowerCase().includes(k.toLowerCase())) || ''];
    if (appRule) {
        Object.assign(classification, appRule);
    }
    // Refine based on window title patterns
    for (const { pattern, classification: override } of TITLE_PATTERNS) {
        if (pattern.test(windowTitle)) {
            Object.assign(classification, override);
            break;
        }
    }
    // Detect suspicious patterns
    classification.isSuspicious = false;
    classification.suspiciousReason = undefined;
    // YouTube trick detection
    if (classification.category === 'entertainment' && context?.youtubeDurationMinutes && context.youtubeDurationMinutes > exports.SUSPICIOUS_THRESHOLDS.YOUTUBE_IDLE_MINUTES) {
        classification.isSuspicious = true;
        classification.suspiciousReason = `YouTube active for ${context.youtubeDurationMinutes}min with no other activity - likely keeping laptop awake`;
    }
    // Slack ghost detection
    if (classification.category === 'communication_active' && idleTimeSeconds > exports.SUSPICIOUS_THRESHOLDS.SLACK_IDLE_MINUTES * 60) {
        classification.isSuspicious = true;
        classification.suspiciousReason = `Slack "active" but no input for ${Math.floor(idleTimeSeconds / 60)}min - likely idle`;
    }
    // Rapid switching = distracted
    if (context?.rapidSwitchCount && context.rapidSwitchCount > exports.SUSPICIOUS_THRESHOLDS.DISTRACTED_SWITCH_COUNT) {
        classification.isSuspicious = true;
        classification.suspiciousReason = `Highly distracted - ${context.rapidSwitchCount} rapid window switches`;
    }
    return classification;
}
function calculateFocusScore(activities) {
    if (activities.length === 0)
        return 0;
    const totalDuration = activities.reduce((sum, a) => sum + a.durationSeconds, 0);
    if (totalDuration === 0)
        return 0;
    const weightedScore = activities.reduce((sum, a) => sum + (a.productivityScore * a.durationSeconds), 0);
    return Math.round(weightedScore / totalDuration);
}
function calculateTimeBreakdown(activities) {
    const breakdown = {};
    for (const activity of activities) {
        breakdown[activity.category] = (breakdown[activity.category] || 0) + activity.durationSeconds;
    }
    // Convert to hours
    for (const key of Object.keys(breakdown)) {
        breakdown[key] = Math.round((breakdown[key] / 3600) * 10) / 10;
    }
    return breakdown;
}
