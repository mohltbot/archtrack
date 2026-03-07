# Agent Experience Patterns

Based on [Agent Experience](https://agent-experience.dev/) - A practical reference for AI agent patterns.

## Core Patterns

### 1. Tool Use Pattern

Agents use external tools to accomplish tasks.

```javascript
// Example: Tool use in OpenClaw skills
class Tool {
  constructor(name, description, parameters) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
  }
  
  async execute(params) {
    // Tool implementation
  }
}

class Agent {
  constructor() {
    this.tools = new Map();
  }
  
  registerTool(tool) {
    this.tools.set(tool.name, tool);
  }
  
  async useTool(toolName, params) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }
    return await tool.execute(params);
  }
}
```

### 2. Memory Pattern

Agents maintain context across interactions.

```javascript
class Memory {
  constructor() {
    this.shortTerm = []; // Recent interactions
    this.longTerm = new Map(); // Persistent knowledge
  }
  
  add(interaction, result) {
    this.shortTerm.push({ interaction, result, timestamp: Date.now() });
    
    // Keep short-term memory limited
    if (this.shortTerm.length > 100) {
      this.shortTerm.shift();
    }
  }
  
  async persist(key, value) {
    this.longTerm.set(key, value);
    // Persist to storage
    await this.save();
  }
  
  retrieve(key) {
    return this.longTerm.get(key);
  }
  
  getRecentContext(n = 10) {
    return this.shortTerm.slice(-n);
  }
}
```

### 3. Planning Pattern

Agents break down complex tasks into steps.

```javascript
class Planner {
  async createPlan(intent, context) {
    // Analyze intent and create steps
    const steps = await this.decompose(intent, context);
    
    return {
      intent,
      steps: steps.map((step, index) => ({
        id: index,
        description: step.description,
        tool: step.tool,
        params: step.params,
        dependencies: step.dependencies || [],
        status: 'pending'
      }))
    };
  }
  
  async executePlan(plan, agent) {
    const results = [];
    
    for (const step of plan.steps) {
      // Check dependencies
      const depsSatisfied = step.dependencies.every(depId => 
        results[depId]?.status === 'success'
      );
      
      if (!depsSatisfied) {
        step.status = 'skipped';
        continue;
      }
      
      try {
        step.status = 'running';
        const result = await agent.useTool(step.tool, step.params);
        step.status = 'success';
        results.push({ step: step.id, status: 'success', result });
      } catch (error) {
        step.status = 'failed';
        results.push({ step: step.id, status: 'failed', error: error.message });
        
        // Decide whether to continue or abort
        if (!await this.shouldContinue(plan, step, error)) {
          break;
        }
      }
    }
    
    return results;
  }
}
```

### 4. Reflection Pattern

Agents evaluate and improve their outputs.

```javascript
class Reflection {
  async evaluate(output, criteria) {
    const evaluation = {
      passed: [],
      failed: [],
      score: 0
    };
    
    for (const criterion of criteria) {
      const result = await this.checkCriterion(output, criterion);
      if (result.passed) {
        evaluation.passed.push(criterion);
      } else {
        evaluation.failed.push({ criterion, reason: result.reason });
      }
    }
    
    evaluation.score = evaluation.passed.length / criteria.length;
    return evaluation;
  }
  
  async improve(output, evaluation) {
    if (evaluation.score >= 0.9) {
      return output; // Good enough
    }
    
    // Generate improvements based on failed criteria
    const improvements = await this.generateImprovements(output, evaluation.failed);
    
    // Apply improvements
    return await this.applyImprovements(output, improvements);
  }
}
```

## OpenClaw-Specific Patterns

### Skill Pattern

```javascript
class Skill {
  constructor() {
    this.name = '';
    this.description = '';
    this.tools = [];
    this.memory = new Memory();
  }
  
  async canHandle(intent) {
    // Check if this skill can handle the intent
    return intent.type === this.name;
  }
  
  async execute(intent, context) {
    // Planning
    const plan = await this.plan(intent);
    
    // Execution with memory
    const results = [];
    for (const step of plan.steps) {
      const result = await this.executeStep(step, context);
      this.memory.add(step, result);
      results.push(result);
    }
    
    // Reflection
    const evaluation = await this.reflect(results);
    if (!evaluation.passed) {
      return await self.correct(results, evaluation);
    }
    
    return this.formatOutput(results);
  }
}
```

### Agent Surface Pattern

```javascript
class AgentSurface {
  constructor(agent) {
    this.agent = agent;
  }
  
  async handle(input) {
    // Parse input based on surface type
    const intent = await this.parseInput(input);
    
    // Find appropriate skill
    const skill = await this.findSkill(intent);
    
    // Execute
    const result = await skill.execute(intent, this.getContext());
    
    // Format output for surface
    return this.formatOutput(result);
  }
}

// CLI Surface
class CLISurface extends AgentSurface {
  parseInput(args) {
    return {
      type: args[0],
      params: args.slice(1)
    };
  }
  
  formatOutput(result) {
    return JSON.stringify(result, null, 2);
  }
}

// API Surface
class APISurface extends AgentSurface {
  parseInput(request) {
    return {
      type: request.path,
      params: request.body
    };
  }
  
  formatOutput(result) {
    return {
      status: 'success',
      data: result
    };
  }
}
```

## References

- [Agent Experience](https://agent-experience.dev/)
- [GitHub Repository](https://github.com/ygwyg/agent-experience)
