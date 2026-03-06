/**
 * Actors.dev Client
 * Give your AI agents email addresses and phone numbers
 * 
 * Source: Ben's Bites (March 3, 2026)
 * https://actors.dev
 */

export interface ActorsConfig {
  apiKey: string;
  webhookUrl?: string;
  baseUrl?: string;
}

export interface CreateAgentOptions {
  name: string;
  displayName?: string;
  email?: string; // e.g., "support@yourdomain.actors.dev"
  phone?: boolean;
  webhookEvents?: string[];
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  webhookUrl?: string;
  createdAt: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64
    contentType: string;
  }>;
}

export interface SendSMSOptions {
  to: string;
  body: string;
}

export interface WebhookEvent {
  type: string;
  agentId: string;
  timestamp: string;
  data: any;
}

type EventHandler = (event: WebhookEvent) => void | Promise<void>;

export class ActorsClient {
  private apiKey: string;
  private webhookUrl?: string;
  private baseUrl: string;
  private eventHandlers: Map<string, EventHandler[]> = new Map();

  constructor(config: ActorsConfig) {
    this.apiKey = config.apiKey;
    this.webhookUrl = config.webhookUrl;
    this.baseUrl = config.baseUrl || 'https://api.actors.dev/v1';
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Actors.dev API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  /**
   * Create a new agent with email/phone capabilities
   */
  async createAgent(options: CreateAgentOptions): Promise<Agent> {
    return this.request<Agent>('POST', '/agents', {
      name: options.name,
      display_name: options.displayName,
      email: options.email,
      phone: options.phone,
      webhook_url: this.webhookUrl,
      webhook_events: options.webhookEvents,
    });
  }

  /**
   * Get an existing agent
   */
  async getAgent(agentId: string): Promise<Agent> {
    return this.request<Agent>('GET', `/agents/${agentId}`);
  }

  /**
   * List all agents
   */
  async listAgents(): Promise<Agent[]> {
    return this.request<Agent[]>('GET', '/agents');
  }

  /**
   * Delete an agent
   */
  async deleteAgent(agentId: string): Promise<void> {
    await this.request('DELETE', `/agents/${agentId}`);
  }

  /**
   * Send an email from an agent
   */
  async sendEmail(agentId: string, options: SendEmailOptions): Promise<{ messageId: string }> {
    return this.request<{ messageId: string }>('POST', `/agents/${agentId}/emails`, {
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      reply_to: options.replyTo,
      attachments: options.attachments,
    });
  }

  /**
   * Send an SMS from an agent
   */
  async sendSMS(agentId: string, options: SendSMSOptions): Promise<{ messageId: string }> {
    return this.request<{ messageId: string }>('POST', `/agents/${agentId}/sms`, {
      to: options.to,
      body: options.body,
    });
  }

  /**
   * Register an event handler
   */
  on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Remove an event handler
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Handle incoming webhook
   * Call this from your webhook endpoint
   */
  async handleWebhook(payload: WebhookEvent): Promise<void> {
    const handlers = this.eventHandlers.get(payload.type) || [];
    
    for (const handler of handlers) {
      try {
        await handler(payload);
      } catch (error) {
        console.error(`Error handling webhook event ${payload.type}:`, error);
      }
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Implementation would use crypto to verify HMAC signature
    // This is a placeholder - actual implementation depends on Actors.dev's signing method
    const crypto = require('crypto');
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  }
}

/**
 * Agent wrapper with convenience methods
 */
export class AgentWrapper {
  constructor(
    private client: ActorsClient,
    public agent: Agent
  ) {}

  get id(): string {
    return this.agent.id;
  }

  get email(): string {
    return this.agent.email;
  }

  get phoneNumber(): string | undefined {
    return this.agent.phoneNumber;
  }

  async sendEmail(options: SendEmailOptions): Promise<{ messageId: string }> {
    return this.client.sendEmail(this.agent.id, options);
  }

  async sendSMS(options: SendSMSOptions): Promise<{ messageId: string }> {
    if (!this.agent.phoneNumber) {
      throw new Error('Agent does not have a phone number');
    }
    return this.client.sendSMS(this.agent.id, options);
  }

  async delete(): Promise<void> {
    return this.client.deleteAgent(this.agent.id);
  }
}

/**
 * Singleton instance
 */
let actorsClient: ActorsClient | null = null;

export function initActors(config: ActorsConfig): ActorsClient {
  actorsClient = new ActorsClient(config);
  return actorsClient;
}

export function getActors(): ActorsClient {
  if (!actorsClient) {
    throw new Error('Actors client not initialized. Call initActors first.');
  }
  return actorsClient;
}
