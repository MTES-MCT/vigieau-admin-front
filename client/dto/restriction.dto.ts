export interface Restriction {
  id: number;
  zoneAlerte: any;
  niveauGravite: 'vigilance' | 'alerte' | 'alerte_renforcee' | 'crise';
  usagesArreteRestriction: any[];
}

export enum RestrictionNiveauGraviteFr {
  vigilance = 'Vigilance',
  alerte = 'Alerte',
  alerte_renforcee = 'Alerte renforcée',
  crise = 'Crise',
}