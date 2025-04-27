import type { Service, Task, PricingVariable } from '@/types';

// Define Tasks first (simplified for now, pricing logic needs detail)
export const ALL_TASKS: Record<string, Task> = {
  // AT Tasks
  deplacement_architecte_at: { id: 'deplacement_architecte_at', name: "Déplacement Architecte (AT)" },
  releve_geometrique_at: { id: 'releve_geometrique_at', name: "Relevé géométrique (AT)" },
  realisation_plans_existant_at: { id: 'realisation_plans_existant_at', name: "Réalisation des plans de l'existant (AT)" },
  realisation_plans_projet_at: { id: 'realisation_plans_projet_at', name: "Réalisation des plans à l'état projeté (AT)" },
  redaction_notice_securite_at: { id: 'redaction_notice_securite_at', name: "Rédaction notice de sécurité (AT)" },
  redaction_notice_accessibilite_at: { id: 'redaction_notice_accessibilite_at', name: "Rédaction notice d'accessibilité (AT)" },
  redaction_demande_derogation_at: { id: 'redaction_demande_derogation_at', name: "Rédaction demande de dérogation (AT)" },
  renseignement_formulaire_cerfa_at: { id: 'renseignement_formulaire_cerfa_at', name: "Renseignement du formulaire cerfa (AT)" },
  impression_dossier_at: { id: 'impression_dossier_at', name: "Impression dossier (AT)" },
  expedition_courrier_recommande_at: { id: 'expedition_courrier_recommande_at', name: "Expédition par courrier recommandé (AT)" },
  deplacement_preventionniste_at: { id: 'deplacement_preventionniste_at', name: "Déplacement préventionniste (AT)" },
  relecture_annotation_plans_architecte_at: { id: 'relecture_annotation_plans_architecte_at', name: "Relecture et annotation des plans d'architecte (AT)" },

  // AMO Tasks
  redaction_notice_securite_amo: { id: 'redaction_notice_securite_amo', name: "Rédaction notice de sécurité (AMO)" },
  redaction_notice_accessibilite_amo: { id: 'redaction_notice_accessibilite_amo', name: "Rédaction notice d'accessibilité (AMO)" },
  redaction_demande_derogation_amo: { id: 'redaction_demande_derogation_amo', name: "Rédaction demande de dérogation (AMO)" },
  relecture_annotation_plans_architecte_amo: { id: 'relecture_annotation_plans_architecte_amo', name: "Relecture et annotation des plans d'architecte (AMO)" },

  // DP Tasks
  deplacement_architecte_dp: { id: 'deplacement_architecte_dp', name: "Déplacement Architecte (DP)" },
  releve_geometrique_dp: { id: 'releve_geometrique_dp', name: "Relevé géométrique (DP)" },
  realisation_plans_existant_dp: { id: 'realisation_plans_existant_dp', name: "Réalisation des plans de l'existant (DP)" },
  realisation_plans_projet_dp: { id: 'realisation_plans_projet_dp', name: "Réalisation des plans à l'état projeté (DP)" },
  renseignement_formulaire_cerfa_dp: { id: 'renseignement_formulaire_cerfa_dp', name: "Renseignement du formulaire cerfa (DP)" },
  impression_dossier_dp: { id: 'impression_dossier_dp', name: "Impression dossier (DP)" },
  expedition_courrier_recommande_dp: { id: 'expedition_courrier_recommande_dp', name: "Expédition par courrier recommandé (DP)" },
  realisation_reportage_photographique_dp: { id: 'realisation_reportage_photographique_dp', name: "Réalisation d'un reportage photographique (DP)" },
  realisation_photomontage_dp: { id: 'realisation_photomontage_dp', name: "Réalisation de photomontage (DP)" },

  // Demande d'enseigne Tasks
  deplacement_architecte_enseigne: { id: 'deplacement_architecte_enseigne', name: "Déplacement Architecte (Enseigne)" },
  releve_geometrique_enseigne: { id: 'releve_geometrique_enseigne', name: "Relevé géométrique (Enseigne)" },
  realisation_plans_existant_enseigne: { id: 'realisation_plans_existant_enseigne', name: "Réalisation des plans de l'existant (Enseigne)" },
  renseignement_formulaire_cerfa_enseigne: { id: 'renseignement_formulaire_cerfa_enseigne', name: "Renseignement du formulaire cerfa (Enseigne)" },
  impression_dossier_enseigne: { id: 'impression_dossier_enseigne', name: "Impression dossier (Enseigne)" },
  expedition_courrier_recommande_enseigne: { id: 'expedition_courrier_recommande_enseigne', name: "Expédition par courrier recommandé (Enseigne)" },
  realisation_photomontage_enseigne: { id: 'realisation_photomontage_enseigne', name: "Réalisation de photomontage (Enseigne)" },

  // Audit sécurité Tasks
  deplacement_preventionniste_audit_sec: { id: 'deplacement_preventionniste_audit_sec', name: "Déplacement préventionniste (Audit Sec.)" },
  redaction_rapport_audit_sec: { id: 'redaction_rapport_audit_sec', name: "Rédaction d'un rapport d'audit (Sécurité)" },
  visite_audit_sec: { id: 'visite_audit_sec', name: "Visite d'audit (Sécurité)" },
  assistance_commission_securite_audit_sec: { id: 'assistance_commission_securite_audit_sec', name: "Assistance à commission de sécurité (Audit Sec.)" },

  // Audit accessibilité Tasks
  deplacement_preventionniste_audit_acc: { id: 'deplacement_preventionniste_audit_acc', name: "Déplacement préventionniste (Audit Acc.)" },
  redaction_rapport_audit_acc: { id: 'redaction_rapport_audit_acc', name: "Rédaction d'un rapport d'audit (Accessibilité)" },
  visite_audit_acc: { id: 'visite_audit_acc', name: "Visite d'audit (Accessibilité)" },

  // RUS Tasks
  deplacement_preventionniste_rus: { id: 'deplacement_preventionniste_rus', name: "Déplacement préventionniste (RUS)" },
  suivi_administratif_annuel_rus: { id: 'suivi_administratif_annuel_rus', name: "Suivi administratif annuel (RUS)" },
  visite_audit_rus: { id: 'visite_audit_rus', name: "Visite d'audit (RUS)" },
  responsabilite_juridique_rus: { id: 'responsabilite_juridique_rus', name: "Responsabilité juridique (RUS)" },
  visa_rus: { id: 'visa_rus', name: "Visa du RUS" },

  // Suivi d'établissement Tasks
  deplacement_preventionniste_suivi: { id: 'deplacement_preventionniste_suivi', name: "Déplacement préventionniste (Suivi)" },
  suivi_administratif_annuel_suivi: { id: 'suivi_administratif_annuel_suivi', name: "Suivi administratif annuel (Suivi)" },
  visite_audit_suivi: { id: 'visite_audit_suivi', name: "Visite d'audit (Suivi)" },
  assistance_commission_securite_suivi: { id: 'assistance_commission_securite_suivi', name: "Assistance à commission de sécurité (Suivi)" },

  // Plans de secours Tasks
  deplacement_architecte_plans: { id: 'deplacement_architecte_plans', name: "Déplacement Architecte (Plans)" },
  releve_geometrique_plans: { id: 'releve_geometrique_plans', name: "Relevé géométrique (Plans)" },
  realisation_plans_existant_plans: { id: 'realisation_plans_existant_plans', name: "Réalisation des plans de l'existant (Plans)" },
  realisation_plan_intervention: { id: 'realisation_plan_intervention', name: "Réalisation plan d'intervention" },
  realisation_plan_evacuation: { id: 'realisation_plan_evacuation', name: "Réalisation plan d'évacuation" },
  realisation_plan_chambre: { id: 'realisation_plan_chambre', name: "Réalisation plan de chambre" },
  fourniture_cadres_clic_clac: { id: 'fourniture_cadres_clic_clac', name: "Fourniture cadres clic-clac" },
  impression_plans: { id: 'impression_plans', name: "Impression (suivant format et supports)" },
  expedition_chronopost_plans: { id: 'expedition_chronopost_plans', name: "Expédition chronopost (Plans)" },

  // Avis sur dossier ERP 5 Tasks
  instruction_dossier_erp5: { id: 'instruction_dossier_erp5', name: "Instruction de dossier de 5ème catégorie" },
  relecture_annotation_plans_architecte_erp5: { id: 'relecture_annotation_plans_architecte_erp5', name: "Relecture et annotation des plans d'architecte (ERP5)" },

  // CSSI Coordination SSI Tasks
  cssi_phase_conception: { id: 'cssi_phase_conception', name: "CSSI Phase Conception" },
  cssi_phase_realisation: { id: 'cssi_phase_realisation', name: "CSSI Phase Réalisation" },
  cssi_phase_reception: { id: 'cssi_phase_reception', name: "CSSI Phase Réception" },

  // Maintenance Moyen de secours Tasks
  deplacement_technicien_maint: { id: 'deplacement_technicien_maint', name: "Déplacement technicien (Maintenance)" },
  maintenance_annuelle_alarme: { id: 'maintenance_annuelle_alarme', name: "Maintenance annuelle équipement d'alarme" },
  maintenance_annuelle_ria: { id: 'maintenance_annuelle_ria', name: "Maintenance annuelle RIA" },
  maintenance_annuelle_extincteur: { id: 'maintenance_annuelle_extincteur', name: "Maintenance annuelle Extincteur" },
  maintenance_annuelle_eclairage: { id: 'maintenance_annuelle_eclairage', name: "Maintenance annuelle éclairage de sécurité" },
  maintenance_annuelle_poteaux: { id: 'maintenance_annuelle_poteaux', name: "Maintenance annuelle poteaux et bouche" },

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
export const PRICING_VARIABLES: PricingVariable[] = [
    { id: 'surface', label: 'Surface', type: 'number', unit: 'm²', defaultValue: 100 },
    { id: 'erpCategory', label: 'Catégorie ERP', type: 'select', options: ['1', '2', '3', '4', '5'], defaultValue: '5' },
    { id: 'levels', label: 'Nombre de niveaux', type: 'number', defaultValue: 1 },
    { id: 'cells', label: 'Nombre de cellules', type: 'number', defaultValue: 1 },
    { id: 'needsPlans', label: 'Besoin de réalisation de plans', type: 'boolean', defaultValue: true }, // Default to true
    { id: 'complexity', label: 'Complexité', type: 'select', options: ['Simple', 'Moyenne', 'Complexe'], defaultValue: 'Simple' },
    // Add more variables as needed
];

// Function to safely get number from localStorage
const getNumberFromLocalStorage = (key: string, defaultValue: number): number => {
    if (typeof window === 'undefined') {
      return defaultValue; // Return default if on server-side
    }
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue !== null) {
        const parsedValue = parseFloat(storedValue);
        if (!isNaN(parsedValue)) {
          return parsedValue;
        }
      }
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
    }
    return defaultValue;
  };


// Define default VAT Rate - Load from localStorage if available (client-side)
export const DEFAULT_VAT_RATE = getNumberFromLocalStorage('defaultVatRate', 20); // Default to 20%


// Define default minimum margin target - Load from localStorage if available (client-side)
export const DEFAULT_MIN_MARGIN_PERCENTAGE = getNumberFromLocalStorage('minMarginPercentage', 30); // Default to 30%
