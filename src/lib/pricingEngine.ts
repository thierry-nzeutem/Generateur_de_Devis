import type { Quote, QuoteInput, QuoteItem, Service, Task, PricingVariable, QuoteItemGroup, AppSettings, ComplexityFactorSettings, TaskPriceSettings, ThresholdSettings, ErpFactorSettings } from '@/types';
import {
    ALL_TASKS,
    SERVICES,
    PRICING_VARIABLES,
    getCurrentVatRate,
    getCurrentMinMarginPercentage,
    getCurrentTaskPrices,
    getCurrentComplexityFactors,
    getCurrentDistanceThresholds,
    getCurrentGroundAreaThresholds,
    getCurrentFloorsNumberThresholds,
    getCurrentMainRoomsNumberThresholds,
    getCurrentErpFactors,
    getCurrentPricePerPage,
} from '@/config/services';
import { v4 as uuidv4 } from 'uuid'; // Use UUID for unique quote IDs

// Helper function to get threshold coefficient
const getThresholdCoefficient = (value: number, thresholds: ThresholdSettings): number => {
    if (value < thresholds.x) return thresholds.coeffX;
    if (value >= thresholds.x && value <= thresholds.y) return thresholds.coeffXY;
    return thresholds.coeffY; // value > y
};

// --- Pricing Logic using Settings ---

const calculateTaskPrice = (
    taskId: string,
    inputs: QuoteInput,
    taskPrices: TaskPriceSettings,
    complexityFactors: ComplexityFactorSettings,
    distanceThresholds: ThresholdSettings,
    groundAreaThresholds: ThresholdSettings,
    floorsNumberThresholds: ThresholdSettings,
    mainRoomsNumberThresholds: ThresholdSettings,
    erpFactors: ErpFactorSettings,
    pricePerPage: number
): { price: number; details?: string } => {
    const task = ALL_TASKS[taskId];
    if (!task) return { price: 0 };

    // Get base prices from current settings (which fall back to defaults if not set)
    const currentTaskSettings = taskPrices[taskId] || {};
    let baseUnitPrice = currentTaskSettings.unitPrice ?? task.unitPrice ?? 0;
    const basePricePerSqm = currentTaskSettings.pricePerSqm ?? task.pricePerSqm ?? 0; // Keep this for specific tasks if needed

    let calculatedPrice = baseUnitPrice;
    let details: string | undefined = undefined;

    // --- Apply Specific Variable Logic ---

    // 1. Distance Coefficient (Affects 'deplacement_' tasks)
    if (taskId.includes('deplacement_') && typeof inputs.distance === 'number') {
        const distanceCoeff = getThresholdCoefficient(inputs.distance, distanceThresholds);
        calculatedPrice *= distanceCoeff;
    }

    // 2. Ground Area Coefficient (Affects releve_geometrique, realisation_plans_existant, realisation_plans_projet)
    if (
        (taskId.includes('releve_geometrique') || taskId.includes('realisation_plans_existant') || taskId.includes('realisation_plans_projet')) &&
        typeof inputs.groundArea === 'number'
    ) {
        const areaCoeff = getThresholdCoefficient(inputs.groundArea, groundAreaThresholds);
        calculatedPrice *= areaCoeff;
    }

    // 3. Floors Number Coefficient (Affects releve_geometrique, realisation_plans_existant, realisation_plans_projet)
     if (
        (taskId.includes('releve_geometrique') || taskId.includes('realisation_plans_existant') || taskId.includes('realisation_plans_projet')) &&
        typeof inputs.floorsNumber === 'number'
    ) {
        const floorsCoeff = getThresholdCoefficient(inputs.floorsNumber, floorsNumberThresholds);
        calculatedPrice *= floorsCoeff;
    }

     // 4. Main Rooms Number Coefficient (Affects releve_geometrique, realisation_plans_existant, realisation_plans_projet)
     if (
        (taskId.includes('releve_geometrique') || taskId.includes('realisation_plans_existant') || taskId.includes('realisation_plans_projet')) &&
        typeof inputs.mainRoomsNumber === 'number'
    ) {
        const roomsCoeff = getThresholdCoefficient(inputs.mainRoomsNumber, mainRoomsNumberThresholds);
        calculatedPrice *= roomsCoeff;
    }

    // 5. ERP Ranking Factor (Affects redaction_notice_securite, redaction_notice_accessibilite)
    if (
        (taskId.includes('redaction_notice_securite') || taskId.includes('redaction_notice_accessibilite')) &&
        typeof inputs.erpRanking === 'string'
    ) {
        const erpFactor = erpFactors[inputs.erpRanking] ?? 1.0; // Default to 1 if category not found
        calculatedPrice *= erpFactor;
    }

    // 6. Derogations Number (Affects redaction_demande_derogation)
    if (taskId.includes('redaction_demande_derogation') && typeof inputs.derogationsNumber === 'number' && inputs.derogationsNumber > 0) {
        calculatedPrice *= inputs.derogationsNumber; // Base price * number of derogations
    }

    // 7. Cerfa (Fixed price - no variable impact other than base price)
    if (taskId.includes('renseignement_formulaire_cerfa')) {
        // Price is already set by baseUnitPrice
    }

    // 8. Impression & Expedition
    if (taskId.includes('impression_dossier') || taskId.includes('impression_plans')) {
        const floors = typeof inputs.floorsNumber === 'number' ? inputs.floorsNumber : 1;
        const pages = 3 + (2 * Math.max(0, floors)); // Calculate pages
        const copies = typeof inputs.copiesNumber === 'number' ? inputs.copiesNumber : 3; // Default 3 copies
        calculatedPrice = pages * pricePerPage * copies;
        details = `${pages} pages x ${copies} ex.`;
    }
    if (taskId.includes('expedition_courrier_recommande') || taskId.includes('expedition_chronopost')) {
        // Price is fixed by baseUnitPrice
    }

    // Apply General Complexity Factor (if not handled by specific rules above)
    // Note: Decide if complexity should stack with other factors or be applied selectively.
    // For now, let's apply it multiplicatively to the result of other calculations.
    const complexity = inputs.complexity as keyof ComplexityFactorSettings | undefined;
    const complexityFactor = complexity ? complexityFactors[complexity] ?? 1.0 : 1.0;
    calculatedPrice *= complexityFactor;

    // Apply Price Per Sqm (Only if explicitly defined for the task and not overridden by threshold logic)
    // Example: maybe specific audit tasks still use a base price + per sqm?
    if (basePricePerSqm > 0 && typeof inputs.surface === 'number') {
        // Decide if this adds ON TOP of threshold calculations or REPLACES them.
        // For now, let's assume it adds if the task has a specific pricePerSqm defined.
        // This needs clarification. Let's comment it out for now to avoid double counting with groundArea.
        // calculatedPrice += inputs.surface * basePricePerSqm;
    }


    // Handle boolean toggles like 'needsPlans'
    if (taskId.includes('_plans_') && taskId.includes('realisation_') && inputs.needsPlans === false) {
        return { price: 0 }; // Set price to 0 if plans are not needed for realization tasks
    }


    return { price: Math.max(0, calculatedPrice), details }; // Ensure price is not negative
};

const calculateSubcontractorCost = (items: QuoteItem[]): number => {
    // Placeholder: Still using simple percentage for now.
    // This should ideally be configurable per task in settings as well.
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
    const currentDistanceThresholds = getCurrentDistanceThresholds();
    const currentGroundAreaThresholds = getCurrentGroundAreaThresholds();
    const currentFloorsNumberThresholds = getCurrentFloorsNumberThresholds();
    const currentMainRoomsNumberThresholds = getCurrentMainRoomsNumberThresholds();
    const currentErpFactors = getCurrentErpFactors();
    const currentPricePerPage = getCurrentPricePerPage();

    // 1. Calculate price for each selected task and group them
    selectedTaskIds.forEach(taskId => {
        const task = ALL_TASKS[taskId];
        const service = findServiceForTask(taskId); // Find the parent service

        if (task && service) {
             const { price: unitPrice, details } = calculateTaskPrice(
                taskId,
                inputs,
                currentTaskPrices,
                currentComplexityFactors,
                currentDistanceThresholds,
                currentGroundAreaThresholds,
                currentFloorsNumberThresholds,
                currentMainRoomsNumberThresholds,
                currentErpFactors,
                currentPricePerPage
            );
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
                details: details, // Include calculation details if any
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
            groupedItems[service.id].items.push(quoteItem);
            groupedItems[service.id].subtotal += totalPrice;

        }
    });

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
export const getApplicableVariables = (selectedTaskIds: string[]): PricingVariable[] => {
    const applicableIds = new Set<string>();

    // Always add core variables
    applicableIds.add('complexity');
    applicableIds.add('discount'); // Assuming discount is always applicable

    // Determine applicability based on selected tasks
    selectedTaskIds.forEach(taskId => {
        // Distance
        if (taskId.includes('deplacement_')) {
            applicableIds.add('distance');
        }
        // Area, Floors, Rooms
        if (taskId.includes('releve_geometrique') || taskId.includes('realisation_plans_existant') || taskId.includes('realisation_plans_projet')) {
            applicableIds.add('groundArea');
            applicableIds.add('floorsNumber');
            applicableIds.add('mainRoomsNumber');
             applicableIds.add('surface'); // Keep legacy?
        }
        // ERP Ranking
        if (taskId.includes('redaction_notice_securite') || taskId.includes('redaction_notice_accessibilite')) {
            applicableIds.add('erpRanking');
             applicableIds.add('erpCategory'); // Keep legacy?
        }
        // Derogations
        if (taskId.includes('redaction_demande_derogation')) {
            applicableIds.add('derogationsNumber');
        }
        // Printing
        if (taskId.includes('impression_dossier') || taskId.includes('impression_plans')) {
            applicableIds.add('copiesNumber');
            // Also need floorsNumber for page calculation, ensure it's added
             if (!applicableIds.has('floorsNumber')) applicableIds.add('floorsNumber');
        }
         // Needs Plans
        if (taskId.includes('_plans_') && taskId.includes('realisation_')) {
            applicableIds.add('needsPlans');
        }
        // Keep legacy variables if the corresponding new ones aren't triggered? Or based on task type?
         if (taskId.includes('level')) applicableIds.add('levels');
         if (taskId.includes('cell')) applicableIds.add('cells');

    });


    // Filter PRICING_VARIABLES based on the collected applicable IDs
    return PRICING_VARIABLES.filter(variable => applicableIds.has(variable.id));
};
