export interface Service {
  id: string;
  name: string;
  description?: string;
  basePrice?: number; // Base price if applicable directly
  // Map of tasks included in this service
  tasks: Record<string, boolean>;
}

export interface Task {
    id: string;
    name: string;
    // Add pricing logic details here, e.g., unit price, per_sqm_price, etc.
    // These can be the default values, potentially overridden by settings.
    unitPrice?: number;
    pricePerSqm?: number;
    // etc.
}

export interface PricingVariableBase {
    id: string;
    label: string;
    type: 'number' | 'select' | 'boolean';
    // Optional configuration for how this variable affects pricing
    // This is a simplified example; a more robust system might be needed
    modifier?: { // Example structure for modifiers
      type: 'factor' | 'fixed_amount';
      // Store modifier values per option for select types, or a single value otherwise
      values?: Record<string, number> | number;
    }
}

export interface PricingVariableNumber extends PricingVariableBase {
    type: 'number';
    unit?: string; // e.g., m², levels
    defaultValue?: number;
    modifier?: {
        type: 'per_unit' | 'fixed_offset'; // e.g., price per m², fixed addition/subtraction
        value: number; // The rate per unit or the fixed offset amount
    };
}

export interface PricingVariableSelect extends PricingVariableBase {
    type: 'select';
    options: string[];
    defaultValue?: string;
     modifier?: {
        type: 'factor' | 'fixed_amount'; // e.g., complexity factor, fixed addition per category
        // Values associated with each option (e.g., {'Simple': 1.0, 'Moyenne': 1.2})
        values: Record<string, number>;
    };
}

export interface PricingVariableBoolean extends PricingVariableBase {
    type: 'boolean';
    defaultValue?: boolean;
     modifier?: {
        type: 'factor' | 'fixed_amount' | 'enable_disable'; // Enable/disable task or apply modifier
        value?: number; // Factor or fixed amount if applicable
    };
}

export type PricingVariable = PricingVariableNumber | PricingVariableSelect | PricingVariableBoolean;


export interface QuoteInput {
  [key: string]: string | number | boolean | undefined; // Values for pricing variables
}

export interface QuoteItem {
  id: string; // Corresponds to Task ID
  name: string;
  serviceId: string; // ID of the parent service
  serviceName: string; // Name of the parent service
  quantity: number;
  unitPrice: number; // Calculated price per unit/task for this specific quote
  totalPrice: number;
}

// Structure to hold grouped items in the quote
export interface QuoteItemGroup {
    serviceId: string;
    serviceName: string;
    items: QuoteItem[];
    subtotal: number;
}

export interface Quote {
  id: string;
  customerName?: string; // Optional for now
  projectName?: string; // Optional for now
  dateGenerated: Date;
  items: QuoteItem[]; // Keep the flat list for backward compatibility or other uses
  groupedItems: Record<string, QuoteItemGroup>; // Grouped by service ID
  subtotal: number; // Overall subtotal
  discountPercentage: number; // e.g., 10 for 10%
  discountAmount: number;
  totalBeforeTax: number;
  vatRate: number; // e.g., 20 for 20%
  vatAmount: number;
  totalAfterTax: number;
  subcontractorCost?: number; // Calculated subcontractor cost
  marginPercentage?: number; // Calculated margin
  marginAmount?: number; // Calculated margin amount
  warnings?: string[]; // e.g., "Low margin alert"
}

// --- Settings Interfaces ---

// Structure for storing overridden task prices
export interface TaskPriceSettings {
    [taskId: string]: {
        unitPrice?: number;
        pricePerSqm?: number;
    };
}

// Structure for storing pricing variable modifiers/rates (example for complexity)
export interface ComplexityFactorSettings {
    Simple: number;
    Moyenne: number;
    Complexe: number;
}

// Example for a numerical variable modifier (surface area price per sqm)
// This might be task-specific, so perhaps better linked within TaskPriceSettings
// Or a general modifier applicable across tasks could be defined.

export interface AppSettings {
  defaultVatRate: number;
  minMarginPercentage: number;
  taskPrices: TaskPriceSettings; // Store overridden task prices
  // Add specific structures for other configurable variable modifiers as needed
  // Example:
  complexityFactors: ComplexityFactorSettings;
  // needsPlansCostFactor?: number; // Example: Factor applied if needsPlans is false
  // ... other configurable modifiers
}
