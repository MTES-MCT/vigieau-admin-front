import type { Usage } from "~/dto/usage.dto";

export class UsageArreteCadre {
  id: number | null;
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
    this.id = null;
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