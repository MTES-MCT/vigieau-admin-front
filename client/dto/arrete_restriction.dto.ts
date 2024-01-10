export class ArreteRestriction {
  id: number | null;
  numero: string;
  dateDebut: string | null;
  dateFin: string | null;
  dateSignature: string | null;
  statut: 'a_valider' | 'a_venir' | 'publie' | 'abroge';

  constructor() {
    this.id = null;
    this.numero = '';
    this.dateDebut = null;
    this.dateFin = null;
    this.dateSignature = null;
    this.statut = 'a_valider';
  }
}

export enum ArreteRestrictionStatutFr {
  a_valider = 'Brouillon',
  a_venir = 'Publication à venir',
  publie = 'Publié',
  abroge = 'Abrogé',
}
