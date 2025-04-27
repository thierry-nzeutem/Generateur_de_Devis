import type { Quote, QuoteInput, QuoteItem, Service, Task, PricingVariable } from '@/types';
import { ALL_TASKS, DEFAULT_VAT_RATE, DEFAULT_MIN_MARGIN_PERCENTAGE } from '@/config/services';
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

    // Example: Boolean variable influence
    if (taskId === 'realisation_plans_existant_at' && inputs.needsPlans === false) {
        return 0; // Don't charge if plans are not needed but task is selected
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
        else price = 50;
    }


    return Math.max(0, price); // Ensure price is not negative
};

const calculateSubcontractorCost = (items: QuoteItem[]): number => {
    // Placeholder: Assume 60% of the subtotal goes to subcontractors
    // Replace with actual subcontractor cost calculation logic
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    return subtotal * 0.6;
};

// --- Main Quote Generation Function ---

export const generateQuote = (
    selectedServices: Service[],
    inputs: QuoteInput,
    discountPercentage: number = 0
): Quote => {
    const quoteId = uuidv4();
    const dateGenerated = new Date();
    const quoteItems: QuoteItem[] = [];
    const includedTaskIds = new Set<string>();

    // 1. Collect all tasks from selected services
    selectedServices.forEach(service => {
        Object.keys(service.tasks).forEach(taskId => {
            if (service.tasks[taskId]) {
                includedTaskIds.add(taskId);
            }
        });
    });

    // 2. Calculate price for each included task
    includedTaskIds.forEach(taskId => {
        const task = ALL_TASKS[taskId];
        if (task) {
            const unitPrice = calculateTaskPrice(taskId, inputs);
            // For simplicity, assume quantity is 1 for each task unless specified otherwise
            const quantity = 1; // TODO: Allow quantity input for certain tasks if needed
            const totalPrice = unitPrice * quantity;

            if (totalPrice > 0) { // Only add items with a cost
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

    // 3. Calculate totals
    const subtotal = quoteItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = (subtotal * discountPercentage) / 100;
    const totalBeforeTax = subtotal - discountAmount;
    const vatRate = DEFAULT_VAT_RATE;
    const vatAmount = (totalBeforeTax * vatRate) / 100;
    const totalAfterTax = totalBeforeTax + vatAmount;

    // 4. Calculate Margin (Placeholder)
    const subcontractorCost = calculateSubcontractorCost(quoteItems);
    const marginAmount = totalBeforeTax - subcontractorCost;
    const marginPercentage = totalBeforeTax > 0 ? (marginAmount / totalBeforeTax) * 100 : 0;

    // 5. Add Warnings
    const warnings: string[] = [];
    if (marginPercentage < DEFAULT_MIN_MARGIN_PERCENTAGE) {
        warnings.push(`Alerte: Marge (${marginPercentage.toFixed(1)}%) inférieure à l'objectif (${DEFAULT_MIN_MARGIN_PERCENTAGE}%)`);
    }

    // 6. Assemble Quote Object
    const quote: Quote = {
        id: quoteId,
        dateGenerated,
        items: quoteItems,
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
export const getApplicableVariables = (selectedServices: Service[]): PricingVariable[] => {
    // In a real app, this might analyze which variables are actually used
    // in the pricing rules for the tasks within the selected services.
    // For now, we return all variables as potentially applicable.
    // This should be refined based on actual pricing logic.
    const { PRICING_VARIABLES } = require('@/config/services'); // Load dynamically if needed elsewhere
    return PRICING_VARIABLES;
}
