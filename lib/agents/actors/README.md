# Actors.dev Integration

**Source:** Ben's Bites Newsletter (March 3, 2026)  
**Website:** https://actors.dev

## Overview

Actors.dev gives your AI agents their own email addresses and phone numbers, enabling them to communicate with the outside world autonomously.

## Why This Fits Your Stack

- **1-Person Unicorn**: Agents can handle inbound inquiries without you
- **Mission Control**: Agents can send status updates and alerts via email/SMS
- **Ghost Shift**: Agents can communicate progress and blockers during autonomous work
- **Business Automation**: Handle customer support, scheduling, and outreach

## Features

- **Email Addresses**: Each agent gets `agent-name@yourdomain.actors.dev`
- **Phone Numbers**: SMS and voice call capabilities
- **Webhooks**: Real-time delivery to your agent system
- **Reply Handling**: Agents can receive and respond to replies

## Installation

```bash
# Sign up at https://actors.dev
# Get your API key from the dashboard

# Add to .env
ACTORS_DEV_API_KEY=your_api_key
ACTORS_DEV_WEBHOOK_URL=https://your-mission-control.com/webhooks/actors
```

## Usage

```typescript
import { ActorsClient, Agent } from './lib/agents/actors/client';

// Initialize client
const actors = new ActorsClient({
  apiKey: process.env.ACTORS_DEV_API_KEY!,
  webhookUrl: process.env.ACTORS_DEV_WEBHOOK_URL!
});

// Create an agent with email and phone
const supportAgent = await actors.createAgent({
  name: 'support-agent',
  displayName: 'Ghost Shift Support',
  email: 'support@ghostshift.actors.dev',
  phone: true, // Auto-assign phone number
  webhookEvents: ['email.received', 'sms.received', 'call.incoming']
});

// Send an email
await supportAgent.sendEmail({
  to: 'customer@example.com',
  subject: 'Your request has been processed',
  text: 'Hi there! I\'ve completed the task you requested...',
  replyTo: supportAgent.email // Replies come back to the agent
});

// Send SMS
await supportAgent.sendSMS({
  to: '+1234567890',
  body: 'Your Ghost Shift task is complete! Check the dashboard.'
});
```

## Integration with Mission Control

### Use Cases

1. **Status Alerts**
   ```typescript
   // Ghost Shift completion notification
   await agent.sendEmail({
     to: 'mohammed@example.com',
     subject: '[Ghost Shift] Nightly tasks complete',
     text: generateShiftReport()
   });
   ```

2. **Customer Support**
   ```typescript
   // Auto-respond to inbound emails
   actors.on('email.received', async (event) => {
     const response = await ai.generateResponse(event.body);
     await agent.sendEmail({
       to: event.from,
       subject: `Re: ${event.subject}`,
       text: response
     });
   });
   ```

3. **Appointment Scheduling**
   ```typescript
   // Handle scheduling via SMS
   actors.on('sms.received', async (event) => {
     if (event.body.includes('schedule')) {
       const slot = await calendar.findSlot();
       await agent.sendSMS({
         to: event.from,
         body: `How about ${slot}? Reply YES to confirm.`
       });
     }
   });
   ```

## Webhook Events

| Event | Description |
|-------|-------------|
| `email.received` | Agent received an email |
| `email.sent` | Agent sent an email |
| `sms.received` | Agent received an SMS |
| `sms.sent` | Agent sent an SMS |
| `call.incoming` | Incoming call to agent |
| `call.completed` | Call finished |

## Pricing

| Feature | Price |
|---------|-------|
| Email address | $5/month |
| Phone number | $10/month |
| Outbound email | $0.001/email |
| Outbound SMS | $0.01/SMS |
| Voice calls | $0.05/minute |

## Security Considerations

- All webhooks are signed - verify signatures
- Rate limiting applies (1000 requests/minute)
- PII is handled according to SOC 2 standards
- Opt-out required for marketing communications

---
*Auto-implemented from Ben's Bites scan on 2026-03-06*
