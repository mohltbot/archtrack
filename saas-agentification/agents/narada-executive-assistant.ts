import { createSaaSAgent } from '../framework';
import { WorkflowEngine } from '../core/workflow';
import { ApprovalQueue } from '../core/approval';

/**
 * Narada Executive Assistant Agent
 * 
 * Automates complex, multi-step approval workflows that require
 * context awareness, policy checks, and human oversight.
 * 
 * Use Cases:
 * - Travel booking with policy compliance
 * - Expense approval with receipt validation
 * - Vendor onboarding with security checks
 * - Budget allocation with approval chains
 */

export const naradaAgent = createSaaSAgent({
  name: 'Executive Assistant Agent',
  version: '1.0.0',
  description: 'Automates multi-step approvals with context and policy awareness',
  
  // Configuration for different workflow types
  workflows: {
    
    /**
     * Travel Booking Workflow
     * 
     * Automatically handles travel requests end-to-end:
     * 1. Parses email request for details
     * 2. Checks company travel policy
     * 3. Searches for flights/hotels within policy
     * 4. Presents 2-3 options to traveler
     * 5. Books upon approval
     * 6. Adds to calendar
     * 7. Handles changes/cancellations
     */
    travelBooking: {
      name: 'Travel Booking',
      trigger: {
        type: 'email',
        pattern: '/travel|book.*flight|hotel.*reservation/i'
      },
      
      context: {
        userProfile: ['department', 'level', 'home_airport', 'preferences'],
        companyPolicy: ['max_flight_cost', 'hotel_tier', 'advance_booking_required'],
        history: ['past_bookings', 'favorite_airlines', 'frequent_routes']
      },
      
      steps: [
        {
          id: 'parse_request',
          name: 'Parse Travel Request',
          type: 'auto',
          action: async (input, context) => {
            // Extract: destination, dates, purpose, preferences
            const parsed = await extractTravelDetails(input.email);
            return {
              destination: parsed.destination,
              dates: { start: parsed.startDate, end: parsed.endDate },
              purpose: parsed.purpose,
              preferences: parsed.preferences || {}
            };
          }
        },
        
        {
          id: 'check_policy',
          name: 'Check Travel Policy',
          type: 'auto',
          action: async (input, context) => {
            const policy = context.companyPolicy;
            const violations = [];
            
            // Check advance booking requirement
            const daysUntil = getBusinessDaysUntil(input.dates.start);
            if (daysUntil < policy.advance_booking_days) {
              violations.push({
                type: 'late_booking',
                severity: 'warning',
                message: `Booking ${daysUntil} days in advance. Policy requires ${policy.advance_booking_days}.`
              });
            }
            
            return { violations, policy };
          }
        },
        
        {
          id: 'search_options',
          name: 'Search Flight & Hotel Options',
          type: 'auto',
          action: async (input, context) => {
            const options = await Promise.all([
              searchFlights({
                from: context.userProfile.home_airport,
                to: input.destination,
                dates: input.dates,
                preferences: input.preferences,
                budget: context.companyPolicy.max_flight_cost
              }),
              searchHotels({
                location: input.destination,
                dates: input.dates,
                tier: context.companyPolicy.hotel_tier,
                preferences: input.preferences
              })
            ]);
            
            return {
              flights: options[0].slice(0, 3), // Top 3 flight options
              hotels: options[1].slice(0, 3),   // Top 3 hotel options
              totalCost: calculateTotalCost(options[0][0], options[1][0])
            };
          }
        },
        
        {
          id: 'present_options',
          name: 'Present Options for Approval',
          type: 'approval',
          requiresHuman: true,
          timeout: '4 hours',
          action: async (input, context) => {
            return {
              message: `Travel options for ${input.destination}:`,
              options: {
                flights: input.searchResults.flights,
                hotels: input.searchResults.hotels
              },
              policyViolations: input.policyCheck.violations,
              totalEstimatedCost: input.searchResults.totalCost,
              approvalButtons: ['approve_option_1', 'approve_option_2', 'approve_option_3', 'request_changes']
            };
          }
        },
        
        {
          id: 'book_travel',
          name: 'Book Approved Travel',
          type: 'auto',
          condition: (input) => input.approval?.decision === 'approved',
          action: async (input, context) => {
            const booking = await Promise.all([
              bookFlight(input.approval.selectedFlight),
              bookHotel(input.approval.selectedHotel)
            ]);
            
            return {
              flightConfirmation: booking[0].confirmation,
              hotelConfirmation: booking[1].confirmation,
              totalCost: booking[0].cost + booking[1].cost,
              itinerary: generateItinerary(booking)
            };
          }
        },
        
        {
          id: 'calendar_block',
          name: 'Add to Calendar',
          type: 'auto',
          action: async (input, context) => {
            await calendar.createEvent({
              title: `Travel: ${input.destination}`,
              start: input.dates.start,
              end: input.dates.end,
              description: `Flight: ${input.booking.flightConfirmation}\nHotel: ${input.booking.hotelConfirmation}`,
              location: input.destination,
              attendees: [context.userProfile.email]
            });
            
            return { calendarEventCreated: true };
          }
        },
        
        {
          id: 'notify_complete',
          name: 'Send Confirmation',
          type: 'auto',
          action: async (input, context) => {
            await sendEmail({
              to: context.userProfile.email,
              subject: `Travel Booked: ${input.destination}`,
              body: `Your travel has been booked!\n\n${input.booking.itinerary}\n\nTotal: $${input.booking.totalCost}`
            });
          }
        }
      ]
    },
    
    /**
     * Expense Approval Workflow
     * 
     * Automates expense report processing:
     * 1. Validates receipts (authenticity, completeness)
     * 2. Checks against policy limits
     * 3. Flags anomalies (duplicate, excessive, unusual)
     * 4. Routes to appropriate approver
     * 5. Processes reimbursement upon approval
     */
    expenseApproval: {
      name: 'Expense Approval',
      trigger: {
        type: 'form_submission',
        source: 'expense_report'
      },
      
      steps: [
        {
          id: 'validate_receipts',
          name: 'Validate Receipts',
          type: 'auto',
          action: async (input) => {
            const validations = await Promise.all(
              input.receipts.map(async (receipt) => ({
                ...receipt,
                valid: await validateReceipt(receipt),
                extracted: await extractReceiptData(receipt)
              }))
            );
            
            const invalid = validations.filter(r => !r.valid);
            
            return {
              validated: validations,
              invalidCount: invalid.length,
              issues: invalid.map(r => ({ file: r.file, reason: r.invalidReason }))
            };
          }
        },
        
        {
          id: 'check_limits',
          name: 'Check Policy Limits',
          type: 'auto',
          action: async (input, context) => {
            const policy = context.companyPolicy.expenseLimits;
            const violations = [];
            
            input.validated.forEach(expense => {
              const category = expense.extracted.category;
              const amount = expense.extracted.amount;
              const limit = policy[category];
              
              if (limit && amount > limit) {
                violations.push({
                  expense: expense.file,
                  category,
                  amount,
                  limit,
                  overage: amount - limit
                });
              }
            });
            
            return { violations, totalAmount: sum(input.validated, 'extracted.amount') };
          }
        },
        
        {
          id: 'detect_anomalies',
          name: 'Detect Anomalies',
          type: 'auto',
          action: async (input, context) => {
            const anomalies = [];
            
            // Check for duplicates
            const duplicates = findDuplicates(input.validated, 'extracted.merchant', 'extracted.amount', 'extracted.date');
            if (duplicates.length > 0) {
              anomalies.push({ type: 'duplicate', items: duplicates });
            }
            
            // Check for unusual vendors
            const unusual = input.validated.filter(e => !isKnownVendor(e.extracted.merchant, context.userProfile));
            if (unusual.length > 0) {
              anomalies.push({ type: 'unusual_vendor', items: unusual });
            }
            
            // Check for excessive frequency
            const recentExpenses = await getRecentExpenses(context.userProfile.id, 30);
            if (recentExpenses.length > 20) {
              anomalies.push({ type: 'high_frequency', count: recentExpenses.length });
            }
            
            return { anomalies, riskScore: calculateRiskScore(anomalies) };
          }
        },
        
        {
          id: 'route_approval',
          name: 'Route to Approver',
          type: 'approval',
          requiresHuman: true,
          condition: (input) => input.anomalies.anomalies.length > 0 || input.policyCheck.violations.length > 0,
          routing: (input, context) => {
            // Route based on amount and risk
            const amount = input.policyCheck.totalAmount;
            const risk = input.anomalies.riskScore;
            
            if (amount > 5000 || risk > 0.8) {
              return context.approvers.cfo;
            } else if (amount > 1000 || risk > 0.5) {
              return context.approvers.manager;
            } else {
              return context.approvers.finance_team;
            }
          },
          action: async (input, context) => {
            return {
              report: generateExpenseReport(input),
              flags: [...input.anomalies.anomalies, ...input.policyCheck.violations],
              recommendation: input.anomalies.riskScore < 0.3 ? 'Auto-approve if no flags' : 'Review required'
            };
          }
        },
        
        {
          id: 'process_reimbursement',
          name: 'Process Reimbursement',
          type: 'auto',
          condition: (input) => input.approval?.decision === 'approved',
          action: async (input, context) => {
            await processReimbursement({
              employee: context.userProfile,
              amount: input.policyCheck.totalAmount,
              reportId: input.reportId,
              approvedBy: input.approval.approver
            });
            
            return { reimbursementInitiated: true };
          }
        }
      ]
    }
  },
  
  // Integration settings
  integrations: {
    email: { enabled: true, read: true, send: true },
    calendar: { enabled: true, read: true, write: true },
    slack: { enabled: true, notify: true },
    erp: { enabled: true, api: 'workday/sap' },
    travel: { enabled: true, providers: ['concur', 'tripactions'] },
    expenses: { enabled: true, providers: ['expensify', 'concur'] }
  },
  
  // Learning settings
  learning: {
    enabled: true,
    fromFeedback: true,
    fromPatterns: true,
    improveRecommendations: true
  }
});

// Helper functions (would be imported from core)
function extractTravelDetails(email: string) { /* ... */ }
function searchFlights(params: any) { /* ... */ }
function searchHotels(params: any) { /* ... */ }
function bookFlight(option: any) { /* ... */ }
function bookHotel(option: any) { /* ... */ }
function validateReceipt(receipt: any) { /* ... */ }
function extractReceiptData(receipt: any) { /* ... */ }
function findDuplicates(items: any[], ...fields: string[]) { /* ... */ }
function isKnownVendor(merchant: string, profile: any) { /* ... */ }
function getRecentExpenses(userId: string, days: number) { /* ... */ }
function calculateRiskScore(anomalies: any[]) { /* ... */ }
function generateItinerary(booking: any) { /* ... */ }
function generateExpenseReport(data: any) { /* ... */ }
function processReimbursement(details: any) { /* ... */ }

export default naradaAgent;
