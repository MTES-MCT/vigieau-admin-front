export class ArreteCadre {
  id: number | null;
  numero: string;
  dateDebut: string;
  dateFin: string;
  departements: any[];
  zonesAlerte: any[];
  usagesArreteCadre: any[];
  statut: 'a_valider' | 'publie' | 'abroge';

  sameZoneCommuneRule: 'all' | 'eap' | 'none' | null;
  customEapNiveau: boolean | null;
  customEapZone: 'esu' | 'eso' | 'max' | null
  
  constructor() {
    this.id = null;
    this.numero = '';
    this.dateDebut = '';
    this.dateFin = '';
    this.statut = 'a_valider';
    this.departements = [];
    this.zonesAlerte = [];
    this.usagesArreteCadre = [];
    this.sameZoneCommuneRule = null;
    this.customEapNiveau = null;
    this.customEapZone = null
  }
}

export enum ArreteCadreStatutFr {
  a_valider = 'Brouillon',
  publie = 'Publié',
  abroge = 'Abrogé',
}
