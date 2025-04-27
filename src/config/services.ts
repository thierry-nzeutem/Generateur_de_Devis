import type { Service, Task, PricingVariable, ComplexityFactorSettings } from '@/types';

// Define Tasks first (simplified for now, pricing logic needs detail)
// Add default unitPrice/pricePerSqm where sensible as fallback/initial values
export const ALL_TASKS: Record<string, Task> = {
  // AT Tasks
  deplacement_architecte_at: { id: 'deplacement_architecte_at', name: "Déplacement Architecte (AT)", unitPrice: 150 },
  releve_geometrique_at: { id: 'releve_geometrique_at', name: "Relevé géométrique (AT)", unitPrice: 300, pricePerSqm: 1.5 },
  realisation_plans_existant_at: { id: 'realisation_plans_existant_at', name: "Réalisation des plans de l'existant (AT)", unitPrice: 250, pricePerSqm: 1.0 },
  realisation_plans_projet_at: { id: 'realisation_plans_projet_at', name: "Réalisation des plans à l'état projeté (AT)", unitPrice: 350, pricePerSqm: 1.2 },
  redaction_notice_securite_at: { id: 'redaction_notice_securite_at', name: "Rédaction notice de sécurité (AT)", unitPrice: 400 },
  redaction_notice_accessibilite_at: { id: 'redaction_notice_accessibilite_at', name: "Rédaction notice d'accessibilité (AT)", unitPrice: 350 },
  redaction_demande_derogation_at: { id: 'redaction_demande_derogation_at', name: "Rédaction demande de dérogation (AT)", unitPrice: 200 },
  renseignement_formulaire_cerfa_at: { id: 'renseignement_formulaire_cerfa_at', name: "Renseignement du formulaire cerfa (AT)", unitPrice: 100 },
  impression_dossier_at: { id: 'impression_dossier_at', name: "Impression dossier (AT)", unitPrice: 50 }, // Example: Price might depend on pages
  expedition_courrier_recommande_at: { id: 'expedition_courrier_recommande_at', name: "Expédition par courrier recommandé (AT)", unitPrice: 25 },
  deplacement_preventionniste_at: { id: 'deplacement_preventionniste_at', name: "Déplacement préventionniste (AT)", unitPrice: 180 },
  relecture_annotation_plans_architecte_at: { id: 'relecture_annotation_plans_architecte_at', name: "Relecture et annotation des plans d'architecte (AT)", unitPrice: 200 },

  // AMO Tasks
  redaction_notice_securite_amo: { id: 'redaction_notice_securite_amo', name: "Rédaction notice de sécurité (AMO)", unitPrice: 380 },
  redaction_notice_accessibilite_amo: { id: 'redaction_notice_accessibilite_amo', name: "Rédaction notice d'accessibilité (AMO)", unitPrice: 330 },
  redaction_demande_derogation_amo: { id: 'redaction_demande_derogation_amo', name: "Rédaction demande de dérogation (AMO)", unitPrice: 190 },
  relecture_annotation_plans_architecte_amo: { id: 'relecture_annotation_plans_architecte_amo', name: "Relecture et annotation des plans d'architecte (AMO)", unitPrice: 180 },

  // DP Tasks
  deplacement_architecte_dp: { id: 'deplacement_architecte_dp', name: "Déplacement Architecte (DP)", unitPrice: 140 },
  releve_geometrique_dp: { id: 'releve_geometrique_dp', name: "Relevé géométrique (DP)", unitPrice: 280, pricePerSqm: 1.3 },
  realisation_plans_existant_dp: { id: 'realisation_plans_existant_dp', name: "Réalisation des plans de l'existant (DP)", unitPrice: 230, pricePerSqm: 0.9 },
  realisation_plans_projet_dp: { id: 'realisation_plans_projet_dp', name: "Réalisation des plans à l'état projeté (DP)", unitPrice: 320, pricePerSqm: 1.1 },
  renseignement_formulaire_cerfa_dp: { id: 'renseignement_formulaire_cerfa_dp', name: "Renseignement du formulaire cerfa (DP)", unitPrice: 90 },
  impression_dossier_dp: { id: 'impression_dossier_dp', name: "Impression dossier (DP)", unitPrice: 45 },
  expedition_courrier_recommande_dp: { id: 'expedition_courrier_recommande_dp', name: "Expédition par courrier recommandé (DP)", unitPrice: 25 },
  realisation_reportage_photographique_dp: { id: 'realisation_reportage_photographique_dp', name: "Réalisation d'un reportage photographique (DP)", unitPrice: 150 },
  realisation_photomontage_dp: { id: 'realisation_photomontage_dp', name: "Réalisation de photomontage (DP)", unitPrice: 200 }, // Example: Price might depend on complexity

  // Demande d'enseigne Tasks
  deplacement_architecte_enseigne: { id: 'deplacement_architecte_enseigne', name: "Déplacement Architecte (Enseigne)", unitPrice: 130 },
  releve_geometrique_enseigne: { id: 'releve_geometrique_enseigne', name: "Relevé géométrique (Enseigne)", unitPrice: 250 }, // Example: Maybe not per sqm
  realisation_plans_existant_enseigne: { id: 'realisation_plans_existant_enseigne', name: "Réalisation des plans de l'existant (Enseigne)", unitPrice: 200 },
  renseignement_formulaire_cerfa_enseigne: { id: 'renseignement_formulaire_cerfa_enseigne', name: "Renseignement du formulaire cerfa (Enseigne)", unitPrice: 80 },
  impression_dossier_enseigne: { id: 'impression_dossier_enseigne', name: "Impression dossier (Enseigne)", unitPrice: 40 },
  expedition_courrier_recommande_enseigne: { id: 'expedition_courrier_recommande_enseigne', name: "Expédition par courrier recommandé (Enseigne)", unitPrice: 25 },
  realisation_photomontage_enseigne: { id: 'realisation_photomontage_enseigne', name: "Réalisation de photomontage (Enseigne)", unitPrice: 180 },

  // Audit sécurité Tasks
  deplacement_preventionniste_audit_sec: { id: 'deplacement_preventionniste_audit_sec', name: "Déplacement préventionniste (Audit Sec.)", unitPrice: 170 },
  redaction_rapport_audit_sec: { id: 'redaction_rapport_audit_sec', name: "Rédaction d'un rapport d'audit (Sécurité)", unitPrice: 500 },
  visite_audit_sec: { id: 'visite_audit_sec', name: "Visite d'audit (Sécurité)", unitPrice: 300 },
  assistance_commission_securite_audit_sec: { id: 'assistance_commission_securite_audit_sec', name: "Assistance à commission de sécurité (Audit Sec.)", unitPrice: 250 },

  // Audit accessibilité Tasks
  deplacement_preventionniste_audit_acc: { id: 'deplacement_preventionniste_audit_acc', name: "Déplacement préventionniste (Audit Acc.)", unitPrice: 170 },
  redaction_rapport_audit_acc: { id: 'redaction_rapport_audit_acc', name: "Rédaction d'un rapport d'audit (Accessibilité)", unitPrice: 450 },
  visite_audit_acc: { id: 'visite_audit_acc', name: "Visite d'audit (Accessibilité)", unitPrice: 280 },

  // RUS Tasks
  deplacement_preventionniste_rus: { id: 'deplacement_preventionniste_rus', name: "Déplacement préventionniste (RUS)", unitPrice: 160 },
  suivi_administratif_annuel_rus: { id: 'suivi_administratif_annuel_rus', name: "Suivi administratif annuel (RUS)", unitPrice: 400 }, // Example: Annual fee
  visite_audit_rus: { id: 'visite_audit_rus', name: "Visite d'audit (RUS)", unitPrice: 250 },
  responsabilite_juridique_rus: { id: 'responsabilite_juridique_rus', name: "Responsabilité juridique (RUS)", unitPrice: 1000 }, // Example: Higher stake
  visa_rus: { id: 'visa_rus', name: "Visa du RUS", unitPrice: 50 },

  // Suivi d'établissement Tasks
  deplacement_preventionniste_suivi: { id: 'deplacement_preventionniste_suivi', name: "Déplacement préventionniste (Suivi)", unitPrice: 160 },
  suivi_administratif_annuel_suivi: { id: 'suivi_administratif_annuel_suivi', name: "Suivi administratif annuel (Suivi)", unitPrice: 350 },
  visite_audit_suivi: { id: 'visite_audit_suivi', name: "Visite d'audit (Suivi)", unitPrice: 240 },
  assistance_commission_securite_suivi: { id: 'assistance_commission_securite_suivi', name: "Assistance à commission de sécurité (Suivi)", unitPrice: 230 },

  // Plans de secours Tasks
  deplacement_architecte_plans: { id: 'deplacement_architecte_plans', name: "Déplacement Architecte (Plans)", unitPrice: 140 },
  releve_geometrique_plans: { id: 'releve_geometrique_plans', name: "Relevé géométrique (Plans)", unitPrice: 270, pricePerSqm: 1.2 },
  realisation_plans_existant_plans: { id: 'realisation_plans_existant_plans', name: "Réalisation des plans de l'existant (Plans)", unitPrice: 220, pricePerSqm: 0.8 },
  realisation_plan_intervention: { id: 'realisation_plan_intervention', name: "Réalisation plan d'intervention", unitPrice: 150 }, // Per plan?
  realisation_plan_evacuation: { id: 'realisation_plan_evacuation', name: "Réalisation plan d'évacuation", unitPrice: 150 }, // Per plan?
  realisation_plan_chambre: { id: 'realisation_plan_chambre', name: "Réalisation plan de chambre", unitPrice: 80 }, // Per plan/room?
  fourniture_cadres_clic_clac: { id: 'fourniture_cadres_clic_clac', name: "Fourniture cadres clic-clac", unitPrice: 30 }, // Per frame
  impression_plans: { id: 'impression_plans', name: "Impression (suivant format et supports)", unitPrice: 20 }, // Per plan/page? Variable?
  expedition_chronopost_plans: { id: 'expedition_chronopost_plans', name: "Expédition chronopost (Plans)", unitPrice: 40 },

  // Avis sur dossier ERP 5 Tasks
  instruction_dossier_erp5: { id: 'instruction_dossier_erp5', name: "Instruction de dossier de 5ème catégorie", unitPrice: 300 },
  relecture_annotation_plans_architecte_erp5: { id: 'relecture_annotation_plans_architecte_erp5', name: "Relecture et annotation des plans d'architecte (ERP5)", unitPrice: 150 },

  // CSSI Coordination SSI Tasks
  cssi_phase_conception: { id: 'cssi_phase_conception', name: "CSSI Phase Conception", unitPrice: 600 },
  cssi_phase_realisation: { id: 'cssi_phase_realisation', name: "CSSI Phase Réalisation", unitPrice: 800 }, // Example: Might be % of works
  cssi_phase_reception: { id: 'cssi_phase_reception', name: "CSSI Phase Réception", unitPrice: 400 },

  // Maintenance Moyen de secours Tasks
  deplacement_technicien_maint: { id: 'deplacement_technicien_maint', name: "Déplacement technicien (Maintenance)", unitPrice: 120 },
  maintenance_annuelle_alarme: { id: 'maintenance_annuelle_alarme', name: "Maintenance annuelle équipement d'alarme", unitPrice: 200 }, // Per system?
  maintenance_annuelle_ria: { id: 'maintenance_annuelle_ria', name: "Maintenance annuelle RIA", unitPrice: 50 }, // Per RIA?
  maintenance_annuelle_extincteur: { id: 'maintenance_annuelle_extincteur', name: "Maintenance annuelle Extincteur", unitPrice: 15 }, // Per extinguisher?
  maintenance_annuelle_eclairage: { id: 'maintenance_annuelle_eclairage', name: "Maintenance annuelle éclairage de sécurité", unitPrice: 5 }, // Per unit?
  maintenance_annuelle_poteaux: { id: 'maintenance_annuelle_poteaux', name: "Maintenance annuelle poteaux et bouche", unitPrice: 80 }, // Per hydrant?

};


// Define Services and map tasks
export const SERVICES: Service[] = [
  {
    id: 'at',
    name: "AT (Autorisation de Travaux)",
    tasks: {
      deplacement_architecte_at: true,
      releve_geometrique_at: true,
      realisation_plans_existant_at: true,
      realisation_plans_projet_at: true,
      redaction_notice_securite_at: true,
      redaction_notice_accessibilite_at: true,
      redaction_demande_derogation_at: true,
      renseignement_formulaire_cerfa_at: true,
      impression_dossier_at: true,
      expedition_courrier_recommande_at: true,
      deplacement_preventionniste_at: true,
      relecture_annotation_plans_architecte_at: true,
    },
  },
  {
    id: 'amo',
    name: "AMO (Assistance à Maîtrise d'Ouvrage)",
    tasks: {
        redaction_notice_securite_amo: true,
        redaction_notice_accessibilite_amo: true,
        redaction_demande_derogation_amo: true,
        relecture_annotation_plans_architecte_amo: true,
    },
  },
  {
    id: 'dp',
    name: "DP (Déclaration Préalable)",
    tasks: {
        deplacement_architecte_dp: true,
        releve_geometrique_dp: true,
        realisation_plans_existant_dp: true,
        realisation_plans_projet_dp: true,
        renseignement_formulaire_cerfa_dp: true,
        impression_dossier_dp: true,
        expedition_courrier_recommande_dp: true,
        realisation_reportage_photographique_dp: true,
        realisation_photomontage_dp: true,
    },
  },
  {
    id: 'enseigne',
    name: "Demande d'enseigne",
    tasks: {
        deplacement_architecte_enseigne: true,
        releve_geometrique_enseigne: true,
        realisation_plans_existant_enseigne: true,
        renseignement_formulaire_cerfa_enseigne: true,
        impression_dossier_enseigne: true,
        expedition_courrier_recommande_enseigne: true,
        realisation_photomontage_enseigne: true,
    },
  },
  {
    id: 'audit_securite',
    name: "Audit sécurité",
    tasks: {
        deplacement_preventionniste_audit_sec: true,
        redaction_rapport_audit_sec: true,
        visite_audit_sec: true,
        assistance_commission_securite_audit_sec: true,
    },
  },
  {
    id: 'audit_accessibilite',
    name: "Audit accessibilité",
    tasks: {
        deplacement_preventionniste_audit_acc: true,
        redaction_rapport_audit_acc: true,
        visite_audit_acc: true,
    },
  },
  {
    id: 'rus',
    name: "RUS (Registre Unique de Sécurité)",
    tasks: {
        deplacement_preventionniste_rus: true,
        suivi_administratif_annuel_rus: true,
        visite_audit_rus: true,
        responsabilite_juridique_rus: true,
        visa_rus: true,
    },
  },
  {
    id: 'suivi_etablissement',
    name: "Suivi d'établissement",
    tasks: {
        deplacement_preventionniste_suivi: true,
        suivi_administratif_annuel_suivi: true,
        visite_audit_suivi: true,
        assistance_commission_securite_suivi: true,
    },
  },
  {
    id: 'plans_secours',
    name: "Plans de secours",
    tasks: {
        deplacement_architecte_plans: true,
        releve_geometrique_plans: true,
        realisation_plans_existant_plans: true,
        realisation_plan_intervention: true,
        realisation_plan_evacuation: true,
        realisation_plan_chambre: true,
        fourniture_cadres_clic_clac: true,
        impression_plans: true,
        expedition_chronopost_plans: true,
    },
  },
  {
    id: 'avis_erp5',
    name: "Avis sur dossier ERP 5",
    tasks: {
        instruction_dossier_erp5: true,
        relecture_annotation_plans_architecte_erp5: true,
    },
  },
  {
    id: 'cssi',
    name: "CSSI Coordination SSI",
    tasks: {
        cssi_phase_conception: true,
        cssi_phase_realisation: true,
        cssi_phase_reception: true,
    },
  },
   {
    id: 'maintenance',
    name: "Maintenance Moyen de secours",
    tasks: {
        deplacement_technicien_maint: true,
        maintenance_annuelle_alarme: true,
        maintenance_annuelle_ria: true,
        maintenance_annuelle_extincteur: true,
        maintenance_annuelle_eclairage: true,
        maintenance_annuelle_poteaux: true,
    },
  },
];


// Define Pricing Variables
// Add modifier configurations where applicable
export const PRICING_VARIABLES: PricingVariable[] = [
    {
        id: 'surface',
        label: 'Surface',
        type: 'number',
        unit: 'm²',
        defaultValue: 100,
        // Example modifier: Rate per square meter (applied in calculateTaskPrice logic)
        // The actual application logic is in pricingEngine.ts
        // modifier: { type: 'per_unit', value: 1.0 } // Value might vary per task
    },
    {
        id: 'erpCategory',
        label: 'Catégorie ERP',
        type: 'select',
        options: ['1', '2', '3', '4', '5'],
        defaultValue: '5',
        // Example: Price might increase for lower category numbers (higher risk/complexity)
        // modifier: { type: 'factor', values: {'1': 1.5, '2': 1.3, '3': 1.1, '4': 1.0, '5': 0.9 } }
    },
    {
        id: 'levels',
        label: 'Nombre de niveaux',
        type: 'number',
        defaultValue: 1,
        // Example: Price might increase slightly per level
        // modifier: { type: 'per_unit', value: 50 } // Flat €50 extra per level? Or factor?
    },
    {
        id: 'cells',
        label: 'Nombre de cellules',
        type: 'number',
        defaultValue: 1,
        // Example: Relevant for specific tasks like RUS or Audits in large spaces
    },
    {
        id: 'needsPlans',
        label: 'Besoin de réalisation de plans',
        type: 'boolean',
        defaultValue: true,
        // Example: Disables certain tasks if false (handled in pricingEngine.ts)
        // modifier: { type: 'enable_disable' }
    },
    {
        id: 'complexity',
        label: 'Complexité',
        type: 'select',
        options: ['Simple', 'Moyenne', 'Complexe'],
        defaultValue: 'Simple',
        // Modifier defines the factor applied based on selection
        modifier: { type: 'factor', values: {'Simple': 1.0, 'Moyenne': 1.2, 'Complexe': 1.5 } }
    },
    // Add more variables as needed
];

// --- Default Settings ---

// Function to safely get number from localStorage or return default
const getStoredNumber = (key: string, defaultValue: number): number => {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const storedValue = localStorage.getItem(key);
        const parsedValue = storedValue ? parseFloat(storedValue) : NaN;
        return isNaN(parsedValue) ? defaultValue : parsedValue;
    } catch (e) {
        console.error(`Error reading number from localStorage key "${key}":`, e);
        return defaultValue;
    }
};

// Function to safely get JSON from localStorage or return default
const getStoredJson = <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (e) {
        console.error(`Error reading JSON from localStorage key "${key}":`, e);
        return defaultValue;
    }
};


// Define default VAT Rate
export const DEFAULT_VAT_RATE = 20; // Base default

// Define default minimum margin target
export const DEFAULT_MIN_MARGIN_PERCENTAGE = 30; // Base default

// Define default complexity factors
export const DEFAULT_COMPLEXITY_FACTORS: ComplexityFactorSettings = {
  Simple: 1.0,
  Moyenne: 1.2,
  Complexe: 1.5,
};


// Function to get the current VAT rate (checks localStorage first)
export const getCurrentVatRate = (): number => getStoredNumber('defaultVatRate', DEFAULT_VAT_RATE);

// Function to get the current min margin percentage (checks localStorage first)
export const getCurrentMinMarginPercentage = (): number => getStoredNumber('minMarginPercentage', DEFAULT_MIN_MARGIN_PERCENTAGE);

// Function to get current complexity factors (checks localStorage first)
export const getCurrentComplexityFactors = (): ComplexityFactorSettings => getStoredJson<ComplexityFactorSettings>('complexityFactors', DEFAULT_COMPLEXITY_FACTORS);

// Function to get current task prices (checks localStorage first)
// Merges stored prices with default prices from ALL_TASKS
export const getCurrentTaskPrices = (): Record<string, { unitPrice?: number; pricePerSqm?: number }> => {
    const storedPrices = getStoredJson<Record<string, { unitPrice?: number; pricePerSqm?: number }>>('taskPrices', {});
    const defaultPrices: Record<string, { unitPrice?: number; pricePerSqm?: number }> = {};

    Object.keys(ALL_TASKS).forEach(taskId => {
        defaultPrices[taskId] = {
            unitPrice: ALL_TASKS[taskId].unitPrice,
            pricePerSqm: ALL_TASKS[taskId].pricePerSqm,
        };
    });

    // Merge stored prices over defaults
    const currentPrices = { ...defaultPrices };
    Object.keys(storedPrices).forEach(taskId => {
        if (currentPrices[taskId]) {
            // Only update if the stored value is a valid number or null (to allow clearing)
            if (typeof storedPrices[taskId].unitPrice === 'number' || storedPrices[taskId].unitPrice === null) {
                 currentPrices[taskId].unitPrice = storedPrices[taskId].unitPrice ?? undefined; // Use null coalescing to set undefined if null
            }
             if (typeof storedPrices[taskId].pricePerSqm === 'number' || storedPrices[taskId].pricePerSqm === null) {
                 currentPrices[taskId].pricePerSqm = storedPrices[taskId].pricePerSqm ?? undefined; // Use null coalescing
            }
        } else {
             // If task exists in storage but not in ALL_TASKS (maybe old data), include it?
             // Or ignore it? For now, let's ignore it to avoid clutter.
             // currentPrices[taskId] = storedPrices[taskId];
        }
    });


    return currentPrices;
};
