export class Restriction {
  id: number | null;
  isAep: boolean;
  zoneAlerte: any;
  communes: any[] | null;
  nomGroupementAep: string | null;
  niveauGravite: 'vigilance' | 'alerte' | 'alerte_renforcee' | 'crise' | null;
  usagesArreteRestriction: any[];
  
  communesText: string | undefined;

  constructor(isAep = false) {
    this.id = null;
    this.isAep = isAep;
    this.zoneAlerte = isAep ? null : [];
    this.communes = isAep ? [] : null;
    this.nomGroupementAep = null;
    this.niveauGravite = null;
    this.usagesArreteRestriction = [];;
  }

}

export enum RestrictionNiveauGraviteFr {
  vigilance = 'Vigilance',
  alerte = 'Alerte',
  alerte_renforcee = 'Alerte renforcée',
  crise = 'Crise',
}