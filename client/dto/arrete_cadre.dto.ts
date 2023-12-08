export interface ArreteCadre {
  id: number;
  numero: string;
  dateDebut: string;
  dateFin: string;
  departements: any[];
  statut: 'a_valider' | 'publie' | 'abroge';
}

export enum ArreteCadreStatutFr {
  a_valider = 'Brouillon',
  publie = 'Publié',
  abroge = 'Abrogé',
}
