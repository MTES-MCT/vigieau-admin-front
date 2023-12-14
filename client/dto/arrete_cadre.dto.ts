export class ArreteCadre {
  id: number;
  numero: string;
  dateDebut: string;
  dateFin: string;
  departements: any[];
  zonesAlerte: any[];
  statut: 'a_valider' | 'publie' | 'abroge';
  
  constructor() {
    this.id = null;
    this.numero = '';
    this.dateDebut = '';
    this.dateFin = '';
    this.statut = 'a_valider';
    this.departements = [];
    this.zonesAlerte = [];
  }
}

export enum ArreteCadreStatutFr {
  a_valider = 'Brouillon',
  publie = 'Publié',
  abroge = 'Abrogé',
}
