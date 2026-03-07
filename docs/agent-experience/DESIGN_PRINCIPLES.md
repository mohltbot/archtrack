# Agent Experience Design Principles

Based on [Agent Experience](https://agent-experience.dev/) - Design principles for AI agents.

## Core Principles

### 1. Transparency

Users should understand what the agent is doing.

**Guidelines:**
- Show the agent's current step/status
- Explain why the agent is taking an action
- Make the agent's reasoning visible

**Implementation:**
```javascript
class TransparentAgent {
  async execute(task) {
    this.emit('status', { step: 'planning', message: 'Breaking down task...' });
    const plan = await this.plan(task);
    
    for (const step of plan.steps) {
      this.emit('status', { 
        step: step.id, 
        message: `Executing: ${step.description}`,
        tool: step.tool 
      });
      
      const result = await this.executeStep(step);
      this.emit('progress', { step: step.id, result });
    }
    
    this.emit('complete', { results });
  }
}
```

### 2. Control

Users should be able to intervene and guide the agent.

**Guidelines:**
- Allow users to pause/resume execution
- Support mid-task corrections
- Provide escape hatches for long-running tasks

**Implementation:**
```javascript
class ControllableAgent {
  constructor() {
    this.paused = false;
    this.cancelled = false;
  }
  
  pause() {
    this.paused = true;
  }
  
  resume() {
    this.paused = false;
  }
  
  cancel() {
    this.cancelled = true;
  }
  
  async execute(task) {
    for (const step of task.steps) {
      while (this.paused) {
        await sleep(100);
      }
      
      if (this.cancelled) {
        throw new Error('Execution cancelled by user');
      }
      
      await this.executeStep(step);
    }
  }
}
```

### 3. Feedback

Agents should provide clear feedback on their actions.

**Guidelines:**
- Confirm successful actions
- Explain failures clearly
- Provide actionable error messages

**Implementation:**
```javascript
class FeedbackAgent {
  async execute(tool, params) {
    try {
      const result = await tool.execute(params);
      
      this.notify('success', {
        tool: tool.name,
        message: `Successfully completed ${tool.name}`,
        result: this.summarize(result)
      });
      
      return result;
    } catch (error) {
      this.notify('error', {
        tool: tool.name,
        message: error.message,
        suggestion: this.suggestFix(error)
      });
      
      throw error;
    }
  }
}
```

### 4. Recovery

Agents should handle failures gracefully.

**Guidelines:**
- Retry failed operations with backoff
- Provide fallback options
- Maintain state for resumption

**Implementation:**
```javascript
class ResilientAgent {
  async executeWithRetry(operation, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          this.emit('retry', { attempt, delay, error: error.message });
          await sleep(delay);
        }
      }
    }
    
    throw lastError;
  }
  
  async executeWithFallback(primary, fallback) {
    try {
      return await primary();
    } catch (error) {
      this.emit('fallback', { error: error.message });
      return await fallback();
    }
  }
}
```

## OpenClaw Application

### Skill Design

```javascript
class WellDesignedSkill {
  constructor() {
    // Transparency
    this.events = new EventEmitter();
  }
  
  async execute(intent) {
    // Control: Check for cancellation
    if (this.isCancelled) {
      throw new Error('Execution cancelled');
    }
    
    // Transparency: Emit status
    this.events.emit('status', 'Starting execution...');
    
    try {
      // Recovery: Execute with retry
      const result = await this.executeWithRetry(() => 
        this.performAction(intent)
      );
      
      // Feedback: Success notification
      this.events.emit('success', result);
      
      return result;
    } catch (error) {
      // Recovery: Try fallback
      if (this.fallback) {
        this.events.emit('fallback', error.message);
        return await this.fallback.execute(intent);
      }
      
      // Feedback: Clear error message
      this.events.emit('error', {
        message: error.message,
        suggestion: 'Try again with different parameters'
      });
      
      throw error;
    }
  }
}
```

### User Interface

```javascript
class AgentUI {
  renderStatus(status) {
    return {
      type: 'status',
      icon: this.getStatusIcon(status.step),
      message: status.message,
      progress: status.progress
    };
  }
  
  renderError(error) {
    return {
      type: 'error',
      title: 'Something went wrong',
      message: error.message,
      actions: [
        { label: 'Retry', action: 'retry' },
        { label: 'Cancel', action: 'cancel' }
      ]
    };
  }
  
  renderSuccess(result) {
    return {
      type: 'success',
      message: result.summary,
      details: result.details
    };
  }
}
```

## Checklist

When designing agent interactions, check:

- [ ] Is the agent's current action visible?
- [ ] Can the user pause or cancel the operation?
- [ ] Are errors explained clearly?
- [ ] Is there a way to recover from failures?
- [ ] Does the agent provide progress updates?
- [ ] Can the user correct the agent mid-task?

## References

- [Agent Experience](https://agent-experience.dev/)
- [GitHub Repository](https://github.com/ygwyg/agent-experience)
