import type { ArreteRestriction } from "~/dto/arrete_restriction.dto";

export class ArreteCadre {
  id: number | null;
  numero: string;
  dateDebut: string | null;
  dateFin: string | null;
  url: string | null;
  departements: any[];
  zonesAlerte: any[];
  usagesArreteCadre: any[];
  statut: 'a_valider' | 'publie' | 'abroge';
  arretesRestriction: ArreteRestriction[];

  communeNiveauGraviteMax: 'all' | 'aep' | 'none' | null;
  niveauGraviteSpecifiqueEap: boolean | null;
  ressourceEapCommunique: 'esu' | 'eso' | 'max' | null;

  constructor() {
    this.id = null;
    this.numero = '';
    this.dateDebut = null;
    this.dateFin = null;
    this.url = null;
    this.statut = 'a_valider';
    this.departements = [];
    this.zonesAlerte = [];
    this.usagesArreteCadre = [];
    this.communeNiveauGraviteMax = null;
    this.niveauGraviteSpecifiqueEap = null;
    this.ressourceEapCommunique = null;
    this.arretesRestriction = [];
  }
}

export enum ArreteCadreStatutFr {
  a_valider = 'Brouillon',
  a_venir = 'Publication à venir',
  publie = 'En vigueur',
  abroge = 'Abrogé',
}
