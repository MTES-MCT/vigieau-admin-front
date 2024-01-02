import type { ArreteRestriction } from "~/dto/arrete_restriction.dto";

export class ArreteCadre {
  id: number | null;
  numero: string;
  dateDebut: string | null;
  dateFin: string | null;
  departements: any[];
  zonesAlerte: any[];
  usagesArreteCadre: any[];
  statut: 'a_valider' | 'publie' | 'abroge';
  arretesRestriction: ArreteRestriction[];

  communeNiveauGraviteMax: 'all' | 'eap' | 'none' | null;
  niveauGraviteSpecifiqueEap: boolean | null;
  ressourcePrioritaire: 'esu' | 'eso' | 'max' | 'eap' | null;

  constructor() {
    this.id = null;
    this.numero = '';
    this.dateDebut = null;
    this.dateFin = null;
    this.statut = 'a_valider';
    this.departements = [];
    this.zonesAlerte = [];
    this.usagesArreteCadre = [];
    this.communeNiveauGraviteMax = null;
    this.niveauGraviteSpecifiqueEap = null;
    this.ressourcePrioritaire = null;
    this.arretesRestriction = [];
  }
}

export enum ArreteCadreStatutFr {
  a_valider = 'Brouillon',
  publie = 'Publié',
  abroge = 'Abrogé',
}
