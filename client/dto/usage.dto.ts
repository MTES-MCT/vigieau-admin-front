import type { Thematique } from "~/dto/thematique.dto";

export class Usage {
  id: number;
  nom: string;
  thematique: Thematique;
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
  
  constructor() {
    this.id = null;
    this.nom = '';
    this.thematique = null;
    this.concerneParticulier = false;
    this.concerneEntreprise = false;
    this.concerneCollectivite = false;
    this.concerneExploitation = false;
  }
}