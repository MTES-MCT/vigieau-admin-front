import type { Usage } from '~/dto/usage.dto';

export class UsageArreteCadre {
  id: number | null;
  usage: Usage;
  concerneParticulier: boolean;
  concerneEntreprise: boolean;
  concerneCollectivite: boolean;
  concerneExploitation: boolean;
  concerneEso: boolean;
  concerneEsu: boolean;
  concerneAep: boolean;
  descriptionVigilance: string;
  descriptionAlerte: string;
  descriptionAlerteRenforcee: string;
  descriptionCrise: string;

  constructor(usage: Usage) {
    this.id = null;
    this.usage = usage;
    this.concerneParticulier = usage.concerneParticulier;
    this.concerneEntreprise = usage.concerneEntreprise;
    this.concerneCollectivite = usage.concerneCollectivite;
    this.concerneExploitation = usage.concerneExploitation;
    this.concerneEso = usage.concerneEso;
    this.concerneEsu = usage.concerneEsu;
    this.concerneAep = usage.concerneAep;
    this.descriptionVigilance = usage.descriptionVigilance;
    this.descriptionAlerte = usage.descriptionAlerte;
    this.descriptionAlerteRenforcee = usage.descriptionAlerteRenforcee;
    this.descriptionCrise = usage.descriptionCrise;
  }
}
