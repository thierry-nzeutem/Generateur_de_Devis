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
    unitPrice?: number;
    pricePerSqm?: number;
    // etc.
}

export interface PricingVariableBase {
    id: string;
    label: string;
    type: 'number' | 'select' | 'boolean';
}

export interface PricingVariableNumber extends PricingVariableBase {
    type: 'number';
    unit?: string; // e.g., m², levels
    defaultValue?: number;
}

export interface PricingVariableSelect extends PricingVariableBase {
    type: 'select';
    options: string[];
    defaultValue?: string;
}

export interface PricingVariableBoolean extends PricingVariableBase {
    type: 'boolean';
    defaultValue?: boolean;
}

export type PricingVariable = PricingVariableNumber | PricingVariableSelect | PricingVariableBoolean;


export interface QuoteInput {
  [key: string]: string | number | boolean | undefined; // Values for pricing variables
}

export interface QuoteItem {
  id: string; // Corresponds to Task ID
  name: string;
  quantity: number;
  unitPrice: number; // Calculated price per unit/task for this specific quote
  totalPrice: number;
}

export interface Quote {
  id: string;
  customerName?: string; // Optional for now
  projectName?: string; // Optional for now
  dateGenerated: Date;
  items: QuoteItem[];
  subtotal: number;
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

// Example structure for defining pricing rules/formulas (can be stored in DB/config)
export interface PricingRule {
    taskId: string;
    conditions: { variableId: string; operator: '>' | '<' | '=' | '!='; value: any }[];
    formula: string; // e.g., "basePrice * surfaceArea * complexityFactor" (needs parsing)
    // Or simpler: type: 'per_sqm', factor: 1.5
}
