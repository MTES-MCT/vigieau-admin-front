import type { Usage } from "~/dto/usage.dto";

export class UsageArreteCadre {
  usage: Usage;
  concerneParticulier: boolean;
  concerneEntreprise: boolean;
  concerneCollectivite: boolean;
  concerneExploitation: boolean;
  descriptionVigilance: string;
  descriptionAlerte: string;
  descriptionAlerteRenforcee: string;
  descriptionCrise: string;
  
  constructor(usage: Usage) {
    this.usage = usage;
    this.concerneParticulier = false;
    this.concerneEntreprise = false;
    this.concerneCollectivite = false;
    this.concerneExploitation = false;
    this.descriptionVigilance = '';
    this.descriptionAlerte = '';
    this.descriptionAlerteRenforcee = '';
    this.descriptionCrise = '';
  }
}