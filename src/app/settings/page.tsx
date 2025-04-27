'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

// Assume settings are stored/fetched somewhere (e.g., localStorage, backend API)
// For this example, we'll use local state.

interface AppSettings {
  defaultVatRate: number;
  minMarginPercentage: number;
  // Add other settings as needed
}

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<AppSettings>({
    defaultVatRate: 20, // Default value
    minMarginPercentage: 30, // Default value
  });
  const [isLoading, setIsLoading] = React.useState(true); // Simulate loading
  const { toast } = useToast();

  // Simulate fetching settings on mount
  React.useEffect(() => {
    // In a real app, fetch from localStorage or API
    const storedVat = localStorage.getItem('defaultVatRate');
    const storedMargin = localStorage.getItem('minMarginPercentage');

    setSettings({
      defaultVatRate: storedVat ? parseFloat(storedVat) : 20,
      minMarginPercentage: storedMargin ? parseFloat(storedMargin) : 30,
    });
    setIsLoading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0, // Ensure value is a number
    }));
  };

  const handleSaveSettings = () => {
    // In a real app, save to localStorage or API
    localStorage.setItem('defaultVatRate', settings.defaultVatRate.toString());
    localStorage.setItem('minMarginPercentage', settings.minMarginPercentage.toString());

    toast({
      title: 'Paramètres sauvegardés',
      description: 'Vos modifications ont été enregistrées.',
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 bg-secondary min-h-screen">
        <div className="flex items-center mb-6 gap-4">
             <Link href="/" passHref>
                 <Button variant="outline" size="icon" className="shadow-md">
                     <ArrowLeft className="h-5 w-5" />
                     <span className="sr-only">Retour</span>
                 </Button>
             </Link>
            <Card className="flex-grow shadow-lg">
                 <CardHeader>
                     <CardTitle className="text-2xl font-bold text-primary">
                        Paramètres de l'application
                     </CardTitle>
                     <CardDescription>
                        Configurez les valeurs par défaut pour le générateur de devis.
                     </CardDescription>
                 </CardHeader>
            </Card>
        </div>


      <Card className="shadow-md">
        <CardContent className="p-6 space-y-6">
          {isLoading ? (
            <p>Chargement des paramètres...</p> // Add Skeleton loaders for better UX
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="defaultVatRate" className="text-base font-medium">
                  Taux de TVA par défaut (%)
                </Label>
                <Input
                  id="defaultVatRate"
                  name="defaultVatRate"
                  type="number"
                  value={settings.defaultVatRate}
                  onChange={handleInputChange}
                  placeholder="ex: 20"
                  min="0"
                  step="0.1"
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground">
                  Ce taux sera utilisé pour calculer la TVA sur les devis.
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
                  onChange={handleInputChange}
                  placeholder="ex: 30"
                  min="0"
                  step="0.1"
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground">
                  Une alerte sera affichée si la marge estimée est inférieure à cet objectif.
                </p>
              </div>

               {/* Add more settings sections here */}
               {/*
               <Separator />
               <div className="space-y-2">
                   <Label htmlFor="someOtherSetting">Autre Paramètre</Label>
                   <Input id="someOtherSetting" name="someOtherSetting" ... />
               </div>
               */}

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90">
                  <Save className="mr-2 h-4 w-4" /> Sauvegarder les modifications
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
