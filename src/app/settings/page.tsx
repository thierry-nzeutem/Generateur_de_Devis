'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Save, Settings as SettingsIcon, Cog, ListChecks, Euro, Percent } from 'lucide-react'; // Added more icons
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Added Accordion
import { ScrollArea } from '@/components/ui/scroll-area'; // Added ScrollArea
import type { AppSettings, TaskPriceSettings, ComplexityFactorSettings, PricingVariable, PricingVariableSelect } from '@/types'; // Added necessary types
import { ALL_TASKS, SERVICES, PRICING_VARIABLES, DEFAULT_VAT_RATE, DEFAULT_MIN_MARGIN_PERCENTAGE, DEFAULT_COMPLEXITY_FACTORS } from '@/config/services'; // Import defaults and config

// Initial default state structure
const getDefaultSettings = (): AppSettings => ({
  defaultVatRate: DEFAULT_VAT_RATE,
  minMarginPercentage: DEFAULT_MIN_MARGIN_PERCENTAGE,
  taskPrices: {}, // Initialize empty, will be populated with defaults/stored values
  complexityFactors: { ...DEFAULT_COMPLEXITY_FACTORS },
  // Initialize other variable settings here if needed
});

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<AppSettings>(() => getDefaultSettings());
  const [isLoading, setIsLoading] = React.useState(true); // Simulate loading
  const [openAccordions, setOpenAccordions] = React.useState<string[]>(['general', 'tasks']); // Default open accordions
  const { toast } = useToast();

  // --- Load Settings ---
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedVat = localStorage.getItem('defaultVatRate');
        const storedMargin = localStorage.getItem('minMarginPercentage');
        const storedTaskPrices = localStorage.getItem('taskPrices');
        const storedComplexity = localStorage.getItem('complexityFactors');

        const loadedSettings: AppSettings = {
          defaultVatRate: storedVat ? parseFloat(storedVat) : DEFAULT_VAT_RATE,
          minMarginPercentage: storedMargin ? parseFloat(storedMargin) : DEFAULT_MIN_MARGIN_PERCENTAGE,
          taskPrices: storedTaskPrices ? JSON.parse(storedTaskPrices) : {},
          complexityFactors: storedComplexity ? JSON.parse(storedComplexity) : { ...DEFAULT_COMPLEXITY_FACTORS },
          // Load other settings here
        };

        // Populate taskPrices with defaults if not present in storage
        const initialTaskPrices: TaskPriceSettings = {};
        Object.values(ALL_TASKS).forEach(task => {
          initialTaskPrices[task.id] = {
            unitPrice: loadedSettings.taskPrices[task.id]?.unitPrice ?? task.unitPrice, // Use stored or default
            pricePerSqm: loadedSettings.taskPrices[task.id]?.pricePerSqm ?? task.pricePerSqm, // Use stored or default
          };
        });
        loadedSettings.taskPrices = initialTaskPrices;


        setSettings(loadedSettings);
      } catch (error) {
        console.error("Error loading settings from localStorage:", error);
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger les paramètres sauvegardés.",
        });
        // Fallback to defaults if loading fails
        setSettings(getDefaultSettings());
      } finally {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // --- Handle Input Changes ---

  const handleGeneralSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0, // Ensure value is a number
    }));
  };

  const handleTaskPriceChange = (taskId: string, field: 'unitPrice' | 'pricePerSqm', value: string) => {
     const numValue = value === '' ? undefined : parseFloat(value); // Allow empty input to clear value (will use default later)
     if (value !== '' && isNaN(numValue as number)) return; // Ignore invalid non-empty input

    setSettings(prev => ({
      ...prev,
      taskPrices: {
        ...prev.taskPrices,
        [taskId]: {
          ...prev.taskPrices[taskId],
          [field]: numValue,
        },
      },
    }));
  };

    const handleComplexityFactorChange = (level: keyof ComplexityFactorSettings, value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return; // Ignore invalid input

        setSettings(prev => ({
            ...prev,
            complexityFactors: {
                ...prev.complexityFactors,
                [level]: numValue,
            },
        }));
    };

  // --- Save Settings ---
  const handleSaveSettings = () => {
    setIsLoading(true); // Show loading indicator
    try {
      // Save general settings
      localStorage.setItem('defaultVatRate', settings.defaultVatRate.toString());
      localStorage.setItem('minMarginPercentage', settings.minMarginPercentage.toString());

       // Save task prices (only store overrides, compare with defaults?)
       // For simplicity, saving the whole structure including defaults if unchanged
       localStorage.setItem('taskPrices', JSON.stringify(settings.taskPrices));

       // Save complexity factors
       localStorage.setItem('complexityFactors', JSON.stringify(settings.complexityFactors));

      // Save other settings here

      toast({
        title: 'Paramètres sauvegardés',
        description: 'Vos modifications ont été enregistrées localement.',
      });
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
      toast({
        variant: "destructive",
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder les paramètres.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Helper to find Task Name ---
  const getTaskName = (taskId: string): string => {
      return ALL_TASKS[taskId]?.name ?? taskId; // Fallback to ID if name not found
  }

   // Helper to find Variable Label
   const getVariableLabel = (variableId: string): string => {
        return PRICING_VARIABLES.find(v => v.id === variableId)?.label ?? variableId;
    }


  return (
    <div className="container mx-auto p-4 md:p-8 bg-secondary min-h-screen">
        <div className="flex items-center mb-6 gap-4">
             <Link href="/" passHref>
                 <Button variant="outline" size="icon" className="shadow-md flex-shrink-0">
                     <ArrowLeft className="h-5 w-5" />
                     <span className="sr-only">Retour</span>
                 </Button>
             </Link>
            <Card className="flex-grow shadow-lg">
                 <CardHeader>
                     <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                        <SettingsIcon className="w-6 h-6" /> Paramètres de l'application
                     </CardTitle>
                     <CardDescription>
                        Configurez les prix des tâches, les taux des variables et les valeurs par défaut.
                     </CardDescription>
                 </CardHeader>
            </Card>
        </div>


      <Card className="shadow-md">
        <CardContent className="p-6 space-y-6">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-10">Chargement des paramètres...</p> // Add Skeleton loaders for better UX
          ) : (
            <Accordion
                type="multiple"
                value={openAccordions}
                onValueChange={setOpenAccordions}
                className="w-full space-y-4"
            >
                {/* --- General Settings --- */}
                <AccordionItem value="general" className="border rounded-md bg-card">
                    <AccordionTrigger className="px-4 py-3 text-lg font-semibold hover:no-underline">
                        <div className="flex items-center gap-2 text-primary">
                             <Cog className="w-5 h-5"/> Paramètres Généraux
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                         <div className="space-y-2">
                           <Label htmlFor="defaultVatRate" className="text-base font-medium">
                             Taux de TVA par défaut (%)
                           </Label>
                           <Input
                             id="defaultVatRate"
                             name="defaultVatRate"
                             type="number"
                             value={settings.defaultVatRate}
                             onChange={handleGeneralSettingChange}
                             placeholder="ex: 20"
                             min="0"
                             step="0.1"
                             className="max-w-xs"
                           />
                           <p className="text-sm text-muted-foreground">
                             Utilisé pour calculer la TVA sur les devis.
                           </p>
                         </div>

                         <Separator />

                         <div className="space-y-2">
                           <Label htmlFor="minMarginPercentage" className="text-base font-medium">
                             Objectif de Marge Minimum (%)
                           </Label>
                           <Input
                             id="minMarginPercentage"
                             name="minMarginPercentage"
                             type="number"
                             value={settings.minMarginPercentage}
                             onChange={handleGeneralSettingChange}
                             placeholder="ex: 30"
                             min="0"
                             step="0.1"
                             className="max-w-xs"
                           />
                           <p className="text-sm text-muted-foreground">
                             Une alerte s'affichera si la marge estimée est inférieure.
                           </p>
                         </div>
                    </AccordionContent>
                </AccordionItem>

                 {/* --- Pricing Variable Settings --- */}
                 <AccordionItem value="variables" className="border rounded-md bg-card">
                     <AccordionTrigger className="px-4 py-3 text-lg font-semibold hover:no-underline">
                          <div className="flex items-center gap-2 text-primary">
                             <Percent className="w-5 h-5"/> Variables de Tarification
                         </div>
                     </AccordionTrigger>
                     <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
                          <p className="text-sm text-muted-foreground mb-4">
                            Ajustez les modificateurs pour les variables de tarification sélectionnées.
                          </p>
                         {/* Complexity Factors Example */}
                         <Card className="border-dashed">
                             <CardHeader className="pb-2">
                                 <CardTitle className="text-base font-medium">{getVariableLabel('complexity')}</CardTitle>
                                 <CardDescription className="text-xs">Facteurs multiplicateurs appliqués aux prix des tâches.</CardDescription>
                             </CardHeader>
                             <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                 {(Object.keys(settings.complexityFactors) as Array<keyof ComplexityFactorSettings>).map(level => (
                                      <div key={level} className="space-y-1">
                                          <Label htmlFor={`complexity-${level}`} className="text-sm">{level}</Label>
                                          <Input
                                              id={`complexity-${level}`}
                                              type="number"
                                              value={settings.complexityFactors[level]}
                                              onChange={(e) => handleComplexityFactorChange(level, e.target.value)}
                                              placeholder="ex: 1.2"
                                              min="0"
                                              step="0.01"
                                              className="text-sm h-9"
                                          />
                                      </div>
                                 ))}
                             </CardContent>
                         </Card>

                          {/* Add sections for other configurable variables here */}
                          {/* e.g., ERP Category factors, Needs Plans cost adjustment, etc. */}
                          {/* Example Placeholder:
                           <Card className="border-dashed">
                              <CardHeader className="pb-2">
                                  <CardTitle className="text-base font-medium">{getVariableLabel('erpCategory')}</CardTitle>
                                  <CardDescription className="text-xs">Modificateurs (facteur ou montant fixe).</CardDescription>
                               </CardHeader>
                              <CardContent> ... inputs ... </CardContent>
                           </Card>
                          */}
                     </AccordionContent>
                 </AccordionItem>

                 {/* --- Task Price Settings --- */}
                 <AccordionItem value="tasks" className="border rounded-md bg-card">
                     <AccordionTrigger className="px-4 py-3 text-lg font-semibold hover:no-underline">
                          <div className="flex items-center gap-2 text-primary">
                             <ListChecks className="w-5 h-5"/> Prix des Tâches
                         </div>
                     </AccordionTrigger>
                     <AccordionContent className="px-2 sm:px-6 pb-6 pt-2 space-y-4">
                         <p className="text-sm text-muted-foreground px-4 sm:px-0 mb-4">
                             Définissez les prix unitaires de base (HT) et les coûts par m² pour chaque tâche. Laissez vide pour utiliser les valeurs par défaut de l'application (si définies).
                         </p>
                        <ScrollArea className="h-[500px] pr-3">
                             <div className="space-y-3">
                             {Object.entries(settings.taskPrices)
                                 .sort(([taskIdA], [taskIdB]) => getTaskName(taskIdA).localeCompare(getTaskName(taskIdB))) // Sort alphabetically by task name
                                 .map(([taskId, prices]) => {
                                     const task = ALL_TASKS[taskId]; // Get task details for placeholders
                                     if (!task) return null; // Skip if task doesn't exist in config (safety check)

                                     return (
                                         <div key={taskId} className="p-3 border rounded-md bg-background/50 space-y-2">
                                             <Label className="font-medium text-sm">{getTaskName(taskId)}</Label>
                                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                 <div className="space-y-1">
                                                     <Label htmlFor={`task-${taskId}-unit`} className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Euro className="w-3 h-3"/> Prix Unitaire (€ HT)
                                                     </Label>
                                                     <Input
                                                         id={`task-${taskId}-unit`}
                                                         type="number"
                                                         value={prices.unitPrice ?? ''} // Use empty string if undefined/null
                                                         onChange={(e) => handleTaskPriceChange(taskId, 'unitPrice', e.target.value)}
                                                         placeholder={`Défaut: ${task.unitPrice ?? 'N/A'}`}
                                                         min="0"
                                                         step="0.1"
                                                         className="text-sm h-9"
                                                     />
                                                 </div>
                                                 <div className="space-y-1">
                                                     <Label htmlFor={`task-${taskId}-sqm`} className="text-xs text-muted-foreground flex items-center gap-1">
                                                         <Euro className="w-3 h-3"/> Prix / m² (€ HT)
                                                     </Label>
                                                     <Input
                                                         id={`task-${taskId}-sqm`}
                                                         type="number"
                                                         value={prices.pricePerSqm ?? ''} // Use empty string if undefined/null
                                                         onChange={(e) => handleTaskPriceChange(taskId, 'pricePerSqm', e.target.value)}
                                                         placeholder={`Défaut: ${task.pricePerSqm ?? 'N/A'}`}
                                                         min="0"
                                                         step="0.01"
                                                         className="text-sm h-9"
                                                     />
                                                 </div>
                                             </div>
                                         </div>
                                     );
                             })}
                             </div>
                         </ScrollArea>
                     </AccordionContent>
                 </AccordionItem>

            </Accordion>
          )}

           {/* --- Save Button --- */}
           {!isLoading && (
                <div className="flex justify-end pt-6">
                    <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90">
                        <Save className="mr-2 h-4 w-4" /> Sauvegarder les modifications
                    </Button>
                </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
