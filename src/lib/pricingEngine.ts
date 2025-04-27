import type { Quote, QuoteInput, QuoteItem, Service, Task, PricingVariable, QuoteItemGroup, AppSettings, ComplexityFactorSettings, TaskPriceSettings } from '@/types';
import {
    ALL_TASKS,
    SERVICES,
    PRICING_VARIABLES,
    getCurrentVatRate, // Use function to get current rate
    getCurrentMinMarginPercentage, // Use function to get current rate
    getCurrentTaskPrices, // Use function to get current task prices
    getCurrentComplexityFactors, // Use function to get current factors
} from '@/config/services';
import { v4 as uuidv4 } from 'uuid'; // Use UUID for unique quote IDs


// --- Pricing Logic using Settings ---

const calculateTaskPrice = (taskId: string, inputs: QuoteInput, taskPrices: TaskPriceSettings, complexityFactors: ComplexityFactorSettings): number => {
    const task = ALL_TASKS[taskId];
    if (!task) return 0;

    // Get base prices from current settings (which fall back to defaults if not set)
    const currentTaskSettings = taskPrices[taskId] || {};
    const baseUnitPrice = currentTaskSettings.unitPrice ?? task.unitPrice ?? 0;
    const basePricePerSqm = currentTaskSettings.pricePerSqm ?? task.pricePerSqm ?? 0;

    let calculatedPrice = baseUnitPrice;

    // Apply price per sqm if applicable and surface is provided
    if (basePricePerSqm > 0 && inputs.surface && typeof inputs.surface === 'number') {
        calculatedPrice += inputs.surface * basePricePerSqm;
    }

    // Apply complexity factor using current settings
    const complexity = inputs.complexity as keyof ComplexityFactorSettings | undefined;
    const factor = complexity ? complexityFactors[complexity] ?? 1.0 : 1.0; // Default to 1.0 if not set or invalid
    calculatedPrice *= factor;


    // Apply other variable modifiers based on their definitions in PRICING_VARIABLES and current settings
    // Example: ERP Category (Hypothetical - assuming a modifier is defined)
    const erpVar = PRICING_VARIABLES.find(v => v.id === 'erpCategory');
    if (erpVar?.modifier?.type === 'factor' && erpVar.modifier.values && typeof inputs.erpCategory === 'string') {
        const erpFactor = erpVar.modifier.values[inputs.erpCategory] ?? 1.0;
        // Decide how to apply this - multiply? Add fixed amount? Needs specific rules per task.
        // calculatedPrice *= erpFactor; // Example multiplication
    }
    // Add logic for other variables like 'levels', 'cells' if they modify price


    // Handle boolean toggles like 'needsPlans'
    if (taskId.includes('_plans_') && taskId.includes('realisation_') && inputs.needsPlans === false) {
        return 0; // Set price to 0 if plans are not needed for realization tasks
    }


    // --- !!! IMPORTANT !!! ---
    // Refine and add more rules based on specific task requirements and
    // how each PRICING_VARIABLE (with its potential modifier settings)
    // should influence the final price of THIS specific task.
    // --- / IMPORTANT ---


    return Math.max(0, calculatedPrice); // Ensure price is not negative
};

const calculateSubcontractorCost = (items: QuoteItem[]): number => {
    // Placeholder: Still using simple percentage for now.
    // This should ideally be configurable per task in settings as well.
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    let cost = 0;
    items.forEach(item => {
        // Example: Different cost factor for different task types - could be stored in settings
        let factor = 0.6; // Default factor
        if (item.id.includes('architecte') || item.id.includes('plans')) {
            factor = 0.7;
        } else if (item.id.includes('maintenance')) {
            factor = 0.5;
        }
        cost += item.totalPrice * factor;
    });
    return cost;
};

// Function to find the service associated with a task ID
const findServiceForTask = (taskId: string): Service | undefined => {
    return SERVICES.find(service => service.tasks[taskId]);
};

// --- Main Quote Generation Function ---

export const generateQuote = (
    selectedTaskIds: string[],
    inputs: QuoteInput,
    discountPercentage: number = 0
): Quote => {
    const quoteId = uuidv4();
    const dateGenerated = new Date();
    const quoteItems: QuoteItem[] = [];
    const groupedItems: Record<string, QuoteItemGroup> = {}; // Initialize grouped items

    // Load current settings at the time of generation
    const currentVatRate = getCurrentVatRate();
    const currentMinMargin = getCurrentMinMarginPercentage();
    const currentTaskPrices = getCurrentTaskPrices();
    const currentComplexityFactors = getCurrentComplexityFactors();
    // Load other relevant settings...

    // 1. Calculate price for each selected task and group them
    selectedTaskIds.forEach(taskId => {
        const task = ALL_TASKS[taskId];
        const service = findServiceForTask(taskId); // Find the parent service

        if (task && service) {
            const unitPrice = calculateTaskPrice(taskId, inputs, currentTaskPrices, currentComplexityFactors);
            const quantity = 1; // Assume quantity 1 for now
            const totalPrice = unitPrice * quantity;

             // Create the quote item
             const quoteItem: QuoteItem = {
                id: taskId,
                name: task.name,
                serviceId: service.id,
                serviceName: service.name, // Add service name
                quantity: quantity,
                unitPrice: unitPrice,
                totalPrice: totalPrice,
            };

            // Add to the flat list
            quoteItems.push(quoteItem);

            // Add to the grouped structure
            if (!groupedItems[service.id]) {
                groupedItems[service.id] = {
                    serviceId: service.id,
                    serviceName: service.name,
                    items: [],
                    subtotal: 0,
                };
            }
            // Only add items with a positive price to the visual group? Or include zero-price?
            // Let's include zero-price items for now to show they were selected.
            // if (totalPrice > 0) {
                 groupedItems[service.id].items.push(quoteItem);
                 groupedItems[service.id].subtotal += totalPrice;
            // }

        }
    });

    // Filter out groups with no items or zero total subtotal if needed (optional)
    // const finalGroupedItems = Object.entries(groupedItems)
    //    .filter(([_, group]) => group.subtotal > 0)
    //    .reduce((acc, [id, group]) => { acc[id] = group; return acc; }, {} as Record<string, QuoteItemGroup>);
    const finalGroupedItems = groupedItems; // Keep all groups for now

    // 3. Calculate overall totals based on the flat list (includes all items)
    const subtotal = quoteItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = (subtotal * discountPercentage) / 100;
    const totalBeforeTax = subtotal - discountAmount;
    const vatAmount = (totalBeforeTax * currentVatRate) / 100;
    const totalAfterTax = totalBeforeTax + vatAmount;

    // 4. Calculate Margin based on flat list
    const subcontractorCost = calculateSubcontractorCost(quoteItems);
    const marginAmount = totalBeforeTax - subcontractorCost;
    const marginPercentage = totalBeforeTax > 0 ? (marginAmount / totalBeforeTax) * 100 : (subtotal > 0 ? -Infinity : 0);

    // 5. Add Warnings using current minimum margin setting
    const warnings: string[] = [];
     if (totalBeforeTax > 0 && marginPercentage < currentMinMargin) {
        warnings.push(`Alerte: Marge (${marginPercentage.toFixed(1)}%) inférieure à l'objectif (${currentMinMargin}%)`);
     } else if (totalBeforeTax <= 0 && subtotal > 0) {
         warnings.push(`Alerte: Marge négative ou nulle due à la remise.`);
     }
     // Add other warnings...


    // 6. Assemble Quote Object
    const quote: Quote = {
        id: quoteId,
        dateGenerated,
        items: quoteItems, // Flat list
        groupedItems: finalGroupedItems, // Grouped items
        subtotal,
        discountPercentage,
        discountAmount,
        totalBeforeTax,
        vatRate: currentVatRate,
        vatAmount,
        totalAfterTax,
        subcontractorCost,
        marginAmount,
        marginPercentage,
        warnings,
    };

    return quote;
};


// --- Helper Function for Determining Applicable Variables ---
// (Keep as is for now, returning all variables)
export const getApplicableVariables = (selectedServices: Service[]): PricingVariable[] => {
    // This could be enhanced to analyze the specific pricing logic
    // of the selected tasks (considering settings) to show only relevant variables.
    // For now, returning all defined variables is simpler.
    return PRICING_VARIABLES;
}
