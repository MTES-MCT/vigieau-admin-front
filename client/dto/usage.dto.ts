import type { Thematique } from '~/dto/thematique.dto';

export class Usage {
  id: number;
  nom: string;
  thematique: Thematique;
  isTemplate: boolean;
  concerneParticulier: boolean;
  concerneCollectivite: boolean;
  concerneExploitation: boolean;
  concerneEntreprise: boolean;
  concerneEso: boolean;
  concerneEsu: boolean;
  concerneAep: boolean;
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
    this.concerneEso = false;
    this.concerneEsu = false;
    this.concerneAep = false;
  }
}
