/**
 * Actors.dev Usage Examples for Mission Control
 */

import { initActors, ActorsClient } from './client';

// Example 1: Ghost Shift Status Notifications
export async function setupGhostShiftNotifications() {
  const actors = initActors({
    apiKey: process.env.ACTORS_DEV_API_KEY!,
    webhookUrl: 'https://mission-control.example.com/webhooks/actors'
  });

  // Create a Ghost Shift agent
  const ghostAgent = await actors.createAgent({
    name: 'ghost-shift',
    displayName: 'Ghost Shift Agent',
    email: 'ghost-shift@missioncontrol.actors.dev',
    phone: true,
    webhookEvents: ['email.received']
  });

  // Send daily status email
  await actors.sendEmail(ghostAgent.id, {
    to: 'mohammed@example.com',
    subject: '[Ghost Shift] Nightly Report - March 6, 2026',
    text: `
Ghost Shift Report
==================
✅ Tasks Completed: 12
⏱️  Duration: 4h 23m
💰 API Spend: $2.34

Highlights:
- Fixed Cloudflare tunnel authentication
- Processed Ben's Bites newsletter
- Opened 3 PRs for review

View full report: https://mission-control.example.com/reports/2026-03-06
    `.trim()
  });

  return ghostAgent;
}

// Example 2: Customer Support Agent
export async function setupSupportAgent(actors: ActorsClient) {
  const supportAgent = await actors.createAgent({
    name: 'customer-support',
    displayName: 'Support Team',
    email: 'support@yourproduct.actors.dev',
    phone: true,
    webhookEvents: ['email.received', 'sms.received']
  });

  // Handle incoming emails
  actors.on('email.received', async (event) => {
    console.log(`Received email from ${event.data.from}: ${event.data.subject}`);
    
    // Auto-respond with acknowledgment
    await actors.sendEmail(supportAgent.id, {
      to: event.data.from,
      subject: `Re: ${event.data.subject}`,
      text: `Thanks for reaching out! We've received your message and will get back to you within 24 hours.

Your ticket number: #${Date.now()}

Best regards,
Support Team`,
      replyTo: supportAgent.email
    });
  });

  // Handle incoming SMS
  actors.on('sms.received', async (event) => {
    console.log(`Received SMS from ${event.data.from}: ${event.data.body}`);
    
    // Simple keyword response
    if (event.data.body.toLowerCase().includes('help')) {
      await actors.sendSMS(supportAgent.id, {
        to: event.data.from,
        body: 'Need help? Visit https://help.example.com or reply CALL for a callback.'
      });
    }
  });

  return supportAgent;
}

// Example 3: Appointment Scheduler
export async function setupSchedulerAgent(actors: ActorsClient) {
  const scheduler = await actors.createAgent({
    name: 'scheduler',
    displayName: 'Appointment Bot',
    email: 'schedule@yourbusiness.actors.dev',
    webhookEvents: ['email.received']
  });

  actors.on('email.received', async (event) => {
    const body = event.data.body.toLowerCase();
    
    if (body.includes('book') || body.includes('schedule')) {
      // Extract proposed time (simplified - use NLP in production)
      const timeMatch = body.match(/(monday|tuesday|wednesday|thursday|friday) at (\d+(?::\d+)?\s*(?:am|pm)?)/i);
      
      if (timeMatch) {
        await actors.sendEmail(scheduler.id, {
          to: event.data.from,
          subject: 'Appointment Request Received',
          text: `I'd be happy to schedule a meeting for ${timeMatch[0]}.

Please confirm by replying YES and I'll send you a calendar invite.

Available times:
- ${timeMatch[1]} 10:00 AM
- ${timeMatch[1]} 2:00 PM
- ${timeMatch[1]} 4:00 PM

Which works best for you?`
        });
      }
    }
  });

  return scheduler;
}

// Example 4: Mission Control Alert System
export async function sendAlert(
  actors: ActorsClient,
  agentId: string,
  severity: 'info' | 'warning' | 'critical',
  message: string
) {
  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    critical: '🚨'
  };

  const subject = `${icons[severity]} [${severity.toUpperCase()}] Mission Control Alert`;

  await actors.sendEmail(agentId, {
    to: 'mohammed@example.com',
    subject,
    text: `
${icons[severity]} ALERT: ${severity.toUpperCase()}

${message}

Time: ${new Date().toISOString()}
System: Mission Control

---
This is an automated alert from your Ghost Shift system.
    `.trim()
  });

  // Also send SMS for critical alerts
  if (severity === 'critical') {
    await actors.sendSMS(agentId, {
      to: '+1234567890', // Your phone number
      body: `${icons[severity]} CRITICAL: ${message.slice(0, 100)}...`
    });
  }
}

// Example Express.js webhook handler
/*
import express from 'express';
const app = express();

app.post('/webhooks/actors', express.json(), async (req, res) => {
  const actors = getActors();
  
  // Verify signature (recommended)
  const signature = req.headers['x-actors-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!actors.verifyWebhookSignature(payload, signature, process.env.ACTORS_WEBHOOK_SECRET!)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  await actors.handleWebhook(req.body);
  
  res.status(200).send('OK');
});
*/
