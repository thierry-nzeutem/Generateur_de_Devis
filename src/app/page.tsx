'use client';

import * as React from 'react';
import { useState } from 'react';
import type { Service, Quote, QuoteInput, PricingVariable } from '@/types';
import { SERVICES, PRICING_VARIABLES } from '@/config/services';
import { generateQuote, getApplicableVariables } from '@/lib/pricingEngine';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from "@/hooks/use-toast";

import { FileText, Settings, Calculator, AlertTriangle, Euro, Percent, CheckCircle } from 'lucide-react';

export default function QuoteGeneratorPage() {
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({});
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

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => {
        const newState = { ...prev, [serviceId]: !prev[serviceId] };
        // Update applicable variables when services change
        const currentSelectedServices = SERVICES.filter(s => newState[s.id]);
        setApplicableVariables(getApplicableVariables(currentSelectedServices));
        // Reset quote when selections change
        setGeneratedQuote(null);
        return newState;
    });

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
    const currentSelectedServices = SERVICES.filter(s => selectedServices[s.id]);
    if (currentSelectedServices.length === 0) {
        toast({
            variant: "destructive",
            title: "Aucun service sélectionné",
            description: "Veuillez sélectionner au moins un service pour générer un devis.",
        });
      return;
    }

    try {
        const quote = generateQuote(currentSelectedServices, pricingInputs, discount);
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
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-primary">
             <FileText className="w-6 h-6" /> Prévéris - Générateur de Devis
          </CardTitle>
          <CardDescription>
            Sélectionnez les prestations, ajustez les variables et générez un devis détaillé.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Services & Variables */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary"/> Prestations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {SERVICES.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={!!selectedServices[service.id]}
                        onCheckedChange={() => handleServiceToggle(service.id)}
                      />
                      <Label htmlFor={`service-${service.id}`} className="text-sm font-medium cursor-pointer">
                        {service.name}
                      </Label>
                    </div>
                  ))}
                </div>
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
              {applicableVariables.map((variable) => (
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
                       className="text-sm"
                    />
                  )}
                  {variable.type === 'select' && (
                    <Select
                      value={pricingInputs[variable.id] as string ?? variable.defaultValue}
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
                       <Label htmlFor={variable.id} className="text-sm font-normal">
                         Activer
                       </Label>
                    </div>
                  )}
                </div>
              ))}
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
                   <ScrollArea className="h-[350px] border rounded-md">
                     <Table>
                       <TableHeader className="sticky top-0 bg-secondary">
                         <TableRow>
                           <TableHead className="w-[60%]">Prestation / Tâche</TableHead>
                           {/* <TableHead>Qté</TableHead> */}
                           <TableHead className="text-right">Prix Unitaire HT</TableHead>
                           <TableHead className="text-right">Total HT</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {generatedQuote.items.length > 0 ? (
                           generatedQuote.items.map((item) => (
                             <TableRow key={item.id}>
                               <TableCell className="font-medium text-sm py-2">{item.name}</TableCell>
                               {/* <TableCell>{item.quantity}</TableCell> */}
                               <TableCell className="text-right text-sm py-2">{formatCurrency(item.unitPrice)}</TableCell>
                               <TableCell className="text-right text-sm py-2">{formatCurrency(item.totalPrice)}</TableCell>
                             </TableRow>
                           ))
                         ) : (
                           <TableRow>
                             <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                               Aucune prestation chiffrée.
                             </TableCell>
                           </TableRow>
                         )}
                       </TableBody>
                     </Table>
                   </ScrollArea>

                   <Separator />

                   <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                     <div className="font-medium">Sous-total HT</div>
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
                  <p>Veuillez sélectionner des services et cliquer sur "Calculer le Devis".</p>
                </div>
              )}
            </CardContent>
             {generatedQuote && (
                <CardFooter className="flex justify-end">
                    {/* Add Export/Save functionality here */}
                    <Button variant="outline">Exporter le Devis (PDF)</Button>
                </CardFooter>
             )}
          </Card>
        </div>
      </div>
    </div>
  );
}
