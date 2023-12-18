export interface Usage {
  id: number;
  nom: string;
  thematique: {
    id: string;
    nom: string
  },
  isTemplate: boolean;
  concerneParticulier: boolean;
  concerneEntreprise: boolean;
  concerneCollectivite: boolean;
  concerneExploitation: boolean;
  descriptionVigilance: string;
  descriptionAlerte: string;
  descriptionAlerteRenforcee: string;
  descriptionCrise: string;
  
  // Frontend only
  isAlreadyUsed: boolean;
  display: any;
}