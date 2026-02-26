# Model Routing Configuration
# Mixed approach: Quality where needed, cheap where possible

TIER_CONFIG = {
    # Simple tasks → Cheapest models
    'simple': {
        'models': ['deepseek-chat', 'gemini-flash'],
        'cost_per_1k': 0.0002,
        'use_for': ['chat', 'simple_qa', 'basic_writing', 'data_extraction']
    },
    
    # Standard tasks → Balanced models  
    'standard': {
        'models': ['kimi-k2.5', 'glm-5'],
        'cost_per_1k': 0.0005,
        'use_for': ['coding', 'analysis', 'reporting', 'workflows']
    },
    
    # Complex tasks → Premium models
    'complex': {
        'models': ['claude-3.5-sonnet', 'gpt-4o-mini'],
        'cost_per_1k': 0.003,
        'use_for': ['complex_coding', 'architecture', 'debugging', 'creative']
    },
    
    # Critical tasks → Best models
    'critical': {
        'models': ['claude-3-opus', 'gpt-4o'],
        'cost_per_1k': 0.015,
        'use_for': ['system_design', 'security_review', 'complex_math', 'only_if_explicit']
    }
}

# Current session should use:
# - Simple: 60% of tasks → $0.0002/1K
# - Standard: 35% of tasks → $0.0005/1K  
# - Complex: 5% of tasks → $0.003/1K
# - Critical: 0% unless you ask → $0.015/1K

# This mix gives you ~$0.001 average cost per 1K tokens
# vs current kimi-only at $0.0015 = 33% savings
