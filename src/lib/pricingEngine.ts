import type { Quote, QuoteInput, QuoteItem, Service, Task, PricingVariable } from '@/types';
import { ALL_TASKS, DEFAULT_VAT_RATE, DEFAULT_MIN_MARGIN_PERCENTAGE, SERVICES, PRICING_VARIABLES } from '@/config/services'; // Import SERVICES and PRICING_VARIABLES
import { v4 as uuidv4 } from 'uuid'; // Use UUID for unique quote IDs


// --- Placeholder Pricing Logic ---
// This needs to be replaced with actual, detailed pricing rules based on Prévéris' specific formulas.
// These might involve database lookups, complex conditional logic, etc.
// For now, we'll use simple placeholder calculations.

const calculateTaskPrice = (taskId: string, inputs: QuoteInput): number => {
    const task = ALL_TASKS[taskId];
    if (!task) return 0;

    let price = task.unitPrice || 0; // Base price if defined directly on task

    // Example: Simple price modification based on surface area
    if (inputs.surface && typeof inputs.surface === 'number' && task.pricePerSqm) {
        price += inputs.surface * task.pricePerSqm;
    }

    // Example: Add cost based on complexity
    if (inputs.complexity === 'Moyenne') {
        price *= 1.2;
    } else if (inputs.complexity === 'Complexe') {
        price *= 1.5;
    }

    // Example: Boolean variable influence (Needs specific task ID)
    if (taskId === 'realisation_plans_existant_at' && inputs.needsPlans === false) {
         // Example: Don't charge if task is 'realisation_plans_existant_at' and needsPlans is false
        return 0;
    }
    if (taskId === 'realisation_plans_projet_at' && inputs.needsPlans === false) {
         // Example: Don't charge if task is 'realisation_plans_projet_at' and needsPlans is false
        return 0;
    }
     // Add similar logic for other plan-related tasks if 'needsPlans' applies
     if (taskId.includes('_plans_') && taskId.includes('realisation_') && inputs.needsPlans === false) {
        return 0; // General rule for plan realization tasks if needsPlans is false
    }


    // --- !!! IMPORTANT !!! ---
    // Add many more rules here based on ALL_TASKS properties and PRICING_VARIABLES
    // This is where the core business logic resides.
    // Consider factors like levels, ERP category, specific task combinations, etc.
    // --- / IMPORTANT ---

    // Placeholder base price for tasks without specific logic yet
    if (price === 0 && !task.pricePerSqm) {
        // Assign a default placeholder price - REPLACE THIS
        if (taskId.includes('deplacement')) price = 150;
        else if (taskId.includes('redaction') || taskId.includes('realisation_plans')) price = 250;
        else if (taskId.includes('maintenance')) price = 100;
        else price = 50; // Generic fallback
    }


    return Math.max(0, price); // Ensure price is not negative
};

const calculateSubcontractorCost = (items: QuoteItem[]): number => {
    // Placeholder: Assume 60% of the subtotal goes to subcontractors
    // Replace with actual subcontractor cost calculation logic based on specific tasks
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    let cost = 0;
    items.forEach(item => {
        // Example: Different cost factor for different task types
        if (item.id.includes('architecte') || item.id.includes('plans')) {
            cost += item.totalPrice * 0.7; // Higher subcontractor cost for architect/plan tasks
        } else if (item.id.includes('maintenance')) {
            cost += item.totalPrice * 0.5; // Lower cost for maintenance
        } else {
            cost += item.totalPrice * 0.6; // Default cost
        }
    });
    return cost;
    // return subtotal * 0.6; // Original simple calculation
};

// --- Main Quote Generation Function ---

export const generateQuote = (
    selectedTaskIds: string[], // Accept task IDs directly
    inputs: QuoteInput,
    discountPercentage: number = 0
): Quote => {
    const quoteId = uuidv4();
    const dateGenerated = new Date();
    const quoteItems: QuoteItem[] = [];

    // 1. Calculate price for each selected task
    selectedTaskIds.forEach(taskId => {
        const task = ALL_TASKS[taskId];
        if (task) {
            const unitPrice = calculateTaskPrice(taskId, inputs);
            // For simplicity, assume quantity is 1 for each task unless specified otherwise
            const quantity = 1; // TODO: Allow quantity input for certain tasks if needed
            const totalPrice = unitPrice * quantity;

            if (totalPrice >= 0) { // Add items even if price is 0 (to show they were considered)
                quoteItems.push({
                    id: taskId,
                    name: task.name,
                    quantity: quantity,
                    unitPrice: unitPrice,
                    totalPrice: totalPrice,
                });
            }
        }
    });

     // Filter out items with 0 total price AFTER initial calculation if desired (optional)
     // const finalQuoteItems = quoteItems.filter(item => item.totalPrice > 0);
     const finalQuoteItems = quoteItems; // Keep 0-price items for now

    // 3. Calculate totals based on final items
    const subtotal = finalQuoteItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = (subtotal * discountPercentage) / 100;
    const totalBeforeTax = subtotal - discountAmount;
    const vatRate = DEFAULT_VAT_RATE;
    const vatAmount = (totalBeforeTax * vatRate) / 100;
    const totalAfterTax = totalBeforeTax + vatAmount;

    // 4. Calculate Margin based on final items
    const subcontractorCost = calculateSubcontractorCost(finalQuoteItems);
    const marginAmount = totalBeforeTax - subcontractorCost;
    const marginPercentage = totalBeforeTax > 0 ? (marginAmount / totalBeforeTax) * 100 : (subtotal > 0 ? -Infinity : 0); // Handle zero totalBeforeTax

    // 5. Add Warnings
    const warnings: string[] = [];
     // Check margin only if there's a positive total before tax
     if (totalBeforeTax > 0 && marginPercentage < DEFAULT_MIN_MARGIN_PERCENTAGE) {
        warnings.push(`Alerte: Marge (${marginPercentage.toFixed(1)}%) inférieure à l'objectif (${DEFAULT_MIN_MARGIN_PERCENTAGE}%)`);
     } else if (totalBeforeTax <= 0 && subtotal > 0) {
         warnings.push(`Alerte: Marge négative ou nulle due à la remise.`);
     }
     // Add other warnings as needed


    // 6. Assemble Quote Object
    const quote: Quote = {
        id: quoteId,
        dateGenerated,
        items: finalQuoteItems,
        subtotal,
        discountPercentage,
        discountAmount,
        totalBeforeTax,
        vatRate,
        vatAmount,
        totalAfterTax,
        subcontractorCost,
        marginAmount,
        marginPercentage,
        warnings,
    };

    return quote;
};

// --- Helper Function for Admin/Display ---
// Updated to derive applicable variables from selected *services* (derived from tasks)
export const getApplicableVariables = (selectedServices: Service[]): PricingVariable[] => {
    // For now, return all variables. Refine later if needed.
    // A more sophisticated approach would analyze the pricing rules for the
    // *tasks* within the *selected services* to determine which variables are relevant.
    // This avoids showing irrelevant inputs like "Number of Cells" if no selected task uses it.

    // Simple approach: return all variables for now.
    // return PRICING_VARIABLES;

    // Placeholder for future refinement:
    const relevantVariableIds = new Set<string>();
    // TODO: Loop through tasks in selectedServices, check their pricing rules,
    // and add the required variable IDs to relevantVariableIds.
    // Example pseudo-code:
    // selectedServices.forEach(service => {
    //   Object.keys(service.tasks).forEach(taskId => {
    //      const rules = getPricingRulesForTask(taskId); // Fetch rules
    //      rules.forEach(rule => {
    //          rule.conditions.forEach(cond => relevantVariableIds.add(cond.variableId));
    //          // Parse rule.formula to find variables if needed
    //      });
    //   });
    // });
    // return PRICING_VARIABLES.filter(v => relevantVariableIds.has(v.id));

    // Returning all for now:
    return PRICING_VARIABLES;
}
