'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { Service, Quote, QuoteInput, PricingVariable, Task, QuoteItemGroup } from '@/types';
import { SERVICES, PRICING_VARIABLES, ALL_TASKS } from '@/config/services';
import { generateQuote, getApplicableVariables } from '@/lib/pricingEngine';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table'; // Added TableFooter
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link'; // Import Link

import { FileText, Settings, Calculator, AlertTriangle, Euro, Percent, CheckCircle, ListChecks, Cog } from 'lucide-react'; // Added ListChecks, Cog

export default function QuoteGeneratorPage() {
  // State for selected tasks (fine-grained control)
  const [selectedTasks, setSelectedTasks] = useState<Record<string, boolean>>({});
  // State to track which service accordions are open (optional, for UI)
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  const [pricingInputs, setPricingInputs] = useState<QuoteInput>(() => {
    const defaults: QuoteInput = {};
    PRICING_VARIABLES.forEach(v => {
        if (v.defaultValue !== undefined) {
            defaults[v.id] = v.defaultValue;
        }
    });
    return defaults;
  });
  const [discount, setDiscount] = useState<number>(0);
  const [generatedQuote, setGeneratedQuote] = useState<Quote | null>(null);
  const [applicableVariables, setApplicableVariables] = useState<PricingVariable[]>(PRICING_VARIABLES); // Initially all variables

  const { toast } = useToast();

  // Derive selected services based on selected tasks for variable calculation
  const derivedSelectedServices = useCallback(() => {
      const serviceIds = new Set<string>();
      SERVICES.forEach(service => {
          const hasSelectedTask = Object.keys(service.tasks).some(taskId => selectedTasks[taskId]);
          if (hasSelectedTask) {
              serviceIds.add(service.id);
          }
      });
      return SERVICES.filter(s => serviceIds.has(s.id));
  }, [selectedTasks]);

  useEffect(() => {
    // Update applicable variables whenever selected tasks change
    setApplicableVariables(getApplicableVariables(derivedSelectedServices()));
    // Reset quote when selections change
    setGeneratedQuote(null);
  }, [selectedTasks, derivedSelectedServices]);

   // Effect to load settings from localStorage on mount for initial state
   useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
        const storedDiscount = localStorage.getItem('defaultDiscount'); // Example storage key
        if (storedDiscount) {
            setDiscount(parseFloat(storedDiscount) || 0);
        }

        // Load other settings affecting inputs if needed
         PRICING_VARIABLES.forEach(variable => {
             const storedValue = localStorage.getItem(variable.id); // Assuming settings use variable ID as key
             if (storedValue !== null) {
                 let value: string | number | boolean = storedValue;
                 if (variable.type === 'number') {
                     value = parseFloat(storedValue) || variable.defaultValue || 0;
                 } else if (variable.type === 'boolean') {
                     value = storedValue === 'true';
                 }
                 // Update if different from default
                 if (pricingInputs[variable.id] !== value) {
                    handleInputChange(variable.id, value);
                 }

             }
         });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handleServiceToggle = (serviceId: string, isChecked: boolean) => {
    const service = SERVICES.find(s => s.id === serviceId);
    if (!service) return;

    setSelectedTasks(prev => {
        const newState = { ...prev };
        Object.keys(service.tasks).forEach(taskId => {
            newState[taskId] = isChecked; // Select/deselect all tasks of this service
        });
        return newState;
    });

     // Manage accordion state (open when checked, close when unchecked)
     setOpenAccordions(prev =>
         isChecked ? [...prev, serviceId] : prev.filter(id => id !== serviceId)
     );
  };

  const handleTaskToggle = (taskId: string, isChecked: boolean) => {
    setSelectedTasks(prev => ({
      ...prev,
      [taskId]: isChecked,
    }));
  };

  // Determine if a service checkbox should be checked (all tasks checked) or indeterminate (some tasks checked)
  const getServiceCheckboxState = (serviceId: string): 'checked' | 'unchecked' | 'indeterminate' => {
    const service = SERVICES.find(s => s.id === serviceId);
    if (!service) return 'unchecked';
    const taskIds = Object.keys(service.tasks);
    const selectedCount = taskIds.filter(taskId => selectedTasks[taskId]).length;

    if (selectedCount === 0) return 'unchecked';
    if (selectedCount === taskIds.length) return 'checked';
    return 'indeterminate';
  };


  const handleInputChange = (id: string, value: string | number | boolean) => {
    setPricingInputs(prev => ({
      ...prev,
      [id]: value,
    }));
    // Reset quote when inputs change
    setGeneratedQuote(null);
  };

    const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setDiscount(isNaN(value) || value < 0 ? 0 : value > 100 ? 100 : value);
        // Reset quote when discount changes
        setGeneratedQuote(null);
    };

  const handleGenerateQuote = () => {
    const currentSelectedTaskIds = Object.entries(selectedTasks)
        .filter(([_, isSelected]) => isSelected)
        .map(([taskId]) => taskId);

    if (currentSelectedTaskIds.length === 0) {
        toast({
            variant: "destructive",
            title: "Aucune tâche sélectionnée",
            description: "Veuillez sélectionner au moins une tâche pour générer un devis.",
        });
      return;
    }

    try {
        // Pass selected task IDs to the generation function
        const quote = generateQuote(currentSelectedTaskIds, pricingInputs, discount);
        setGeneratedQuote(quote);
        toast({
            title: "Devis généré",
            description: `Le devis ${quote.id.substring(0,8)}... a été calculé.`,
            action: (
                 <Button variant="outline" size="sm" onClick={() => console.log("Devis:", quote)}>
                    Voir détails (console)
                 </Button>
            ),
        });
    } catch (error) {
        console.error("Error generating quote:", error);
        toast({
            variant: "destructive",
            title: "Erreur de calcul",
            description: "Une erreur est survenue lors de la génération du devis.",
        });
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '-';
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 bg-secondary min-h-screen">
        <div className="flex justify-between items-center mb-6">
            <Card className="flex-grow shadow-lg mr-4">
                 <CardHeader>
                     <CardTitle className="text-2xl font-bold flex items-center gap-2 text-primary">
                        <FileText className="w-6 h-6" /> Prévéris - Générateur de Devis
                     </CardTitle>
                     <CardDescription>
                        Sélectionnez les prestations et tâches, ajustez les variables et générez un devis détaillé.
                     </CardDescription>
                 </CardHeader>
            </Card>
            <Link href="/settings" passHref>
                 <Button variant="outline" size="icon" className="shadow-md">
                     <Cog className="h-5 w-5" />
                     <span className="sr-only">Paramètres</span>
                 </Button>
             </Link>
        </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Services/Tasks & Variables */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-md">
             <CardHeader>
               <CardTitle className="text-lg font-semibold flex items-center gap-2">
                 <ListChecks className="w-5 h-5 text-primary"/> Prestations & Tâches
               </CardTitle>
             </CardHeader>
             <CardContent>
               <ScrollArea className="h-[400px] pr-4">
                  <Accordion
                     type="multiple"
                     value={openAccordions}
                     onValueChange={setOpenAccordions}
                     className="w-full"
                    >
                     {SERVICES.map((service) => {
                       const serviceState = getServiceCheckboxState(service.id);
                       return (
                         <AccordionItem key={service.id} value={service.id}>
                           <AccordionTrigger className="py-2 text-sm hover:no-underline">
                             <div className="flex items-center space-x-2 flex-grow">
                               <Checkbox
                                 id={`service-${service.id}`}
                                 checked={serviceState === 'checked'}
                                 aria-label={`Select all tasks for ${service.name}`} // Accessibility
                                 data-state={serviceState === 'indeterminate' ? 'indeterminate' : serviceState} // Set indeterminate state
                                 onCheckedChange={(checked) => handleServiceToggle(service.id, !!checked)}
                                 onClick={(e) => e.stopPropagation()} // Prevent accordion toggle on checkbox click
                                 className={`mt-1 ${serviceState === 'indeterminate' ? 'data-[state=indeterminate]:bg-primary/50' : ''}`} // Basic indeterminate style
                               />
                               <Label htmlFor={`service-${service.id}`} className="font-medium cursor-pointer">
                                 {service.name}
                               </Label>
                             </div>
                           </AccordionTrigger>
                           <AccordionContent className="pl-8 pr-2 pb-2 pt-1 space-y-2">
                             {Object.keys(service.tasks).map((taskId) => {
                               const task = ALL_TASKS[taskId];
                               if (!task) return null;
                               return (
                                 <div key={task.id} className="flex items-center space-x-2">
                                   <Checkbox
                                     id={`task-${task.id}`}
                                     checked={!!selectedTasks[task.id]}
                                     onCheckedChange={(checked) => handleTaskToggle(task.id, !!checked)}
                                   />
                                   <Label htmlFor={`task-${task.id}`} className="text-xs font-normal cursor-pointer text-muted-foreground">
                                     {task.name}
                                   </Label>
                                 </div>
                               );
                             })}
                           </AccordionContent>
                         </AccordionItem>
                       );
                     })}
                   </Accordion>
               </ScrollArea>
             </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary"/> Variables de Tarification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {applicableVariables.length > 0 ? (
                applicableVariables.map((variable) => (
                  <div key={variable.id} className="space-y-1">
                    <Label htmlFor={variable.id} className="text-sm font-medium">
                      {variable.label} {variable.type === 'number' && variable.unit ? `(${variable.unit})` : ''}
                    </Label>
                    {variable.type === 'number' && (
                      <Input
                        id={variable.id}
                        type="number"
                        value={pricingInputs[variable.id] as number ?? ''}
                        onChange={(e) => handleInputChange(variable.id, parseFloat(e.target.value) || 0)}
                        placeholder={`Entrez ${variable.label.toLowerCase()}`}
                        min="0"
                        step={variable.id === 'surface' ? '0.1' : '1'} // Example step control
                        className="text-sm"
                      />
                    )}
                    {variable.type === 'select' && variable.options && ( // Ensure options exist
                      <Select
                         value={(pricingInputs[variable.id] as string | undefined) ?? variable.defaultValue ?? variable.options[0]} // Ensure a valid value is selected
                         onValueChange={(value) => handleInputChange(variable.id, value)}
                      >
                        <SelectTrigger id={variable.id} className="w-full text-sm">
                          <SelectValue placeholder={`Sélectionnez ${variable.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {variable.options.map(option => (
                            <SelectItem key={option} value={option} className="text-sm">{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                     {variable.type === 'boolean' && (
                       <div className="flex items-center space-x-2 pt-1">
                         <Checkbox
                           id={variable.id}
                           checked={pricingInputs[variable.id] as boolean ?? false}
                           onCheckedChange={(checked) => handleInputChange(variable.id, !!checked)}
                         />
                         <Label htmlFor={variable.id} className="text-sm font-normal cursor-pointer">
                           Activer
                         </Label>
                       </div>
                     )}
                  </div>
                ))
               ) : (
                   <p className="text-sm text-muted-foreground text-center py-4">Aucune variable applicable aux tâches sélectionnées.</p>
               )}
                 <div className="space-y-1 pt-2">
                    <Label htmlFor="discount" className="text-sm font-medium flex items-center gap-1">
                        <Percent className="w-4 h-4" /> Remise (%)
                    </Label>
                    <Input
                        id="discount"
                        type="number"
                        value={discount}
                        onChange={handleDiscountChange}
                        placeholder="0"
                        min="0"
                        max="100"
                        step="0.1"
                        className="text-sm"
                    />
                 </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleGenerateQuote} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Calculator className="mr-2 h-4 w-4" /> Calculer le Devis
                </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Quote Display */}
        <div className="md:col-span-2">
          <Card className="shadow-lg sticky top-8">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary"/> Devis Calculé
                {generatedQuote && <span className="text-sm font-normal text-muted-foreground">({generatedQuote.id.substring(0,8)})</span>}
              </CardTitle>
              <CardDescription>
                Aperçu du devis basé sur les sélections et variables actuelles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedQuote ? (
                <div className="space-y-6">
                   {generatedQuote.warnings && generatedQuote.warnings.length > 0 && (
                     <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                       <AlertTriangle className="h-4 w-4 text-destructive" />
                       <AlertTitle className="font-semibold text-destructive">Alertes</AlertTitle>
                       <AlertDescription className="text-destructive/90">
                         {generatedQuote.warnings.map((warning, index) => (
                           <p key={index}>{warning}</p>
                         ))}
                       </AlertDescription>
                     </Alert>
                   )}
                   <ScrollArea className="h-[400px] border rounded-md">
                     <Table>
                       <TableHeader className="sticky top-0 bg-card z-10">
                         <TableRow>
                           <TableHead className="w-[60%]">Tâche / Prestation</TableHead>
                           <TableHead className="text-right">Prix Unitaire HT</TableHead>
                           <TableHead className="text-right">Total HT</TableHead>
                         </TableRow>
                       </TableHeader>
                        {Object.values(generatedQuote.groupedItems).map((group: QuoteItemGroup) => (
                           <TableBody key={group.serviceId}>
                              {/* Service Header Row */}
                              <TableRow className="bg-secondary hover:bg-secondary/90">
                                  <TableCell colSpan={3} className="font-semibold text-primary py-2">
                                      {group.serviceName}
                                  </TableCell>
                              </TableRow>
                              {/* Task Rows */}
                              {group.items.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-medium text-sm py-2 pl-6">{item.name}</TableCell>
                                  <TableCell className="text-right text-sm py-2">{formatCurrency(item.unitPrice)}</TableCell>
                                  <TableCell className="text-right text-sm py-2">{formatCurrency(item.totalPrice)}</TableCell>
                                </TableRow>
                              ))}
                              {/* Service Subtotal Row */}
                              <TableRow className="bg-secondary/50 hover:bg-secondary/70 border-t">
                                  <TableCell colSpan={2} className="text-right font-semibold text-sm py-1 pr-2">
                                      Sous-total {group.serviceName}
                                  </TableCell>
                                  <TableCell className="text-right font-semibold text-sm py-1">
                                      {formatCurrency(group.subtotal)}
                                  </TableCell>
                              </TableRow>
                           </TableBody>
                       ))}
                       {/* Display message if no items */}
                       {Object.keys(generatedQuote.groupedItems).length === 0 && (
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                                    Aucune tâche chiffrée.
                                    </TableCell>
                                </TableRow>
                           </TableBody>
                       )}
                     </Table>
                   </ScrollArea>

                   <Separator />

                   <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                     <div className="font-medium">Sous-total Général HT</div>
                     <div className="text-right">{formatCurrency(generatedQuote.subtotal)}</div>

                     {generatedQuote.discountPercentage > 0 && (
                        <>
                           <div className="text-muted-foreground">Remise ({generatedQuote.discountPercentage}%)</div>
                           <div className="text-right text-destructive">-{formatCurrency(generatedQuote.discountAmount)}</div>

                           <div className="font-medium">Total HT après remise</div>
                           <div className="text-right">{formatCurrency(generatedQuote.totalBeforeTax)}</div>
                       </>
                     )}

                     <div className="text-muted-foreground">TVA ({generatedQuote.vatRate}%)</div>
                     <div className="text-right">{formatCurrency(generatedQuote.vatAmount)}</div>

                     <div className="font-bold text-base text-primary mt-2">Total TTC</div>
                     <div className="text-right font-bold text-base text-primary mt-2">{formatCurrency(generatedQuote.totalAfterTax)}</div>

                     <Separator className="col-span-2 my-2"/>

                     <div className="text-muted-foreground flex items-center gap-1">
                        <Euro className="w-4 h-4"/> Coût sous-traitant (estimé)
                    </div>
                     <div className="text-right text-muted-foreground">{formatCurrency(generatedQuote.subcontractorCost)}</div>

                     <div className={`font-medium flex items-center gap-1 ${generatedQuote.warnings && generatedQuote.warnings.length > 0 ? 'text-destructive' : ''}`}>
                        <Percent className="w-4 h-4"/> Marge HT (estimée)
                    </div>
                     <div className={`text-right font-medium ${generatedQuote.warnings && generatedQuote.warnings.length > 0 ? 'text-destructive' : ''}`}>
                        {formatCurrency(generatedQuote.marginAmount)} ({generatedQuote.marginPercentage?.toFixed(1)}%)
                    </div>
                   </div>


                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <Calculator className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                  <p>Veuillez sélectionner des tâches et cliquer sur "Calculer le Devis".</p>
                </div>
              )}
            </CardContent>
             {generatedQuote && (
                <CardFooter className="flex justify-end">
                    {/* TODO: Add Export/Save functionality here */}
                    <Button variant="outline">Exporter le Devis (PDF)</Button>
                </CardFooter>
             )}
          </Card>
        </div>
      </div>
    </div>
  );
}
