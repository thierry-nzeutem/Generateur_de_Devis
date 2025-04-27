# **App Name**: Prévéris Quoter

## Core Features:

- Variable Pricing Management: Define and manage pricing variables like surface area, ERP category, and service type. Allow admin users to adjust pricing based on these parameters.
- Automated Quote Generation: Generate professional quotes based on selected services, variables, and pre-defined formulas, including base price, options, discounts and VAT.
- Margin Calculation and Alerts: Calculate margins automatically, factoring in subcontractor fees. Display alerts if profitability thresholds are not met.

## Style Guidelines:

- Primary color: Soft blue (#D1E9FF) to convey trust and professionalism.
- Secondary color: Light grey (#F5F5F5) for backgrounds to ensure readability.
- Accent: Teal (#008080) to highlight important actions and information.
- Clean and structured layout to easily find the pricing variables, options, and final quote.
- Use clear, professional icons to represent service categories and options.

## Original User Request:
Thread [PRICING] - Moteur de tarification de l'application Prévéris

Contexte :
Nous développons une application métier pour Prévéris. L’application doit permettre :

la cotation rapide des prestations,

la génération de devis professionnels,

le calcul automatique de la rémunération sous-traitants,

la création de packs standard et de contrats.

Objectif du fil :
Définir la structure du moteur de tarification, incluant :

les grilles tarifaires selon type de prestation, surface, complexité, etc.,

les règles de marge minimale et de remise,

les formules de calcul à intégrer.

Input :
Nos prestations sont diverses (audit sécurité, demande AT, RUS annuel, assistance à maîtrise d'ouvrage…).

Les prix dépendent de variables : type de mission, surface, nombre de niveaux, nombre de cellules, besoin de plans, complexité ERP, etc.

Objectif : garantir une marge cible après rémunération sous-traitants.

Besoin d'intégrer des packs (offres combinées avec remises éventuelles).

Les tarifs doivent pouvoir être paramétrables dans l'admin de l'application.

Output attendu :
application de génération de devis

Identification des variables principales impactant les prix (surface, catégorie ERP, etc.).

Définition claire des formules (prix final = base prestation + options éventuelles – remises + TVA).

Règles de calcul automatique de la marge et alertes si seuil de rentabilité non respecté.
	AT	AMO	DP	Demande d'enseigne	Audit sécurité	Audit accessibilité	RUS	Suivi d'établissement	Plans de secours	Avis sur dossier ERP 5	CSSI Coordination SSI	Maintenance Moyen de secours
Déplacement Architecte	X		X	X					X			
Relevé géométrique	X		X	X					X			
réalisation des plans de l'existant	X		X	X					X			
réalisation des plans à l'état projeté	X		X	X								
rédaction notice de sécurité	X	X										
rédaction notice d'accessibilité	X	X										
rédaction demande de dérogation	X	X										
renseignement du formulaire cerfa	X	X	X	X								
impression dossier	X		X	X								
expédition par courrier recommandé	X		X	X								
déplacement préventionniste	X				X	X	X	X				
réalisation d'un reportage photographique			X									
réalisation de photomontage			X	X								
rédaction d'un rapport d'audit					X	X						
suivi administratif annuel							X	X				
visite d'audit					X	X	X	X				
responsabilité juridique							X					
réalisation plan d'intervention									X			
réalisation plan d'évacuation									X			
réalisation plan de chambre									X			
fourniture cadres clic-clac									X			
impression (suivant format et supports)									X			
expédition chronopost									X			
Instruction de dossier de 5ème catégorie										X		
visa du RUS							X					
Assistance à commission de sécurité							X	X				
relecture et annotation des plans d'architecte	X	X							X			
CSSI Phase Conception											X	
CSSI Phase Réalisation											X	
CSSI Phase Réception											X	
déplacement trechnicien												X
Maintenance annuelle équipement d'alarme												X
Maintenance annuelle RIA												X
Maintenance annuelle Extincteur												X
Maintenance annuelle éclairage de sécurité												X
Maintenance annuelle poteaux et bouche 												X
  