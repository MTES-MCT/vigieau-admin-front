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
  affichageRessourceParticulier: 'esu' | 'eso' | 'aep' | 'max' | null;
  affichageRessourceCollectivite: 'esu' | 'eso' | 'aep' | 'max' | null;
  affichageRessourceEntreprise: 'esu' | 'eso' | 'aep' | 'max' | null;
  affichageRessourceExploitation: 'esu' | 'eso' | 'aep' | 'max' | null;

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
    this.affichageRessourceParticulier = null;
    this.affichageRessourceCollectivite = null;
    this.affichageRessourceEntreprise = null;
    this.affichageRessourceExploitation = null;
    this.arretesRestriction = [];
  }
}

export enum ArreteCadreStatutFr {
  a_valider = 'Brouillon',
  publie = 'Publié',
  abroge = 'Abrogé',
}
