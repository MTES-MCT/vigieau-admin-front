export interface Restriction {
  id: number | null;
  isAep: boolean;
  zoneAlerte: any;
  niveauGravite: 'vigilance' | 'alerte' | 'alerte_renforcee' | 'crise' | null;
  usagesArreteRestriction: any[];
}

export enum RestrictionNiveauGraviteFr {
  vigilance = 'Vigilance',
  alerte = 'Alerte',
  alerte_renforcee = 'Alerte renforcée',
  crise = 'Crise',
}