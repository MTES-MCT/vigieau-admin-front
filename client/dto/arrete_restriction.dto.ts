import type { ArreteCadre } from "~/dto/arrete_cadre.dto";
import type { Departement } from "~/dto/departement.dto";
import type { Restriction } from "~/dto/restriction.dto";

export class ArreteRestriction {
  id: number | null;
  numero: string;
  dateDebut: string | null;
  dateFin: string | null;
  dateSignature: string | null;
  statut: 'a_valider' | 'a_venir' | 'publie' | 'abroge';
  fichier: any;
  arretesCadre: ArreteCadre[];
  restrictions: Restriction[];
  arreteRestrictionAbroge: ArreteRestriction | null;
  departement: Departement | null;
  
  niveauGraviteSpecifiqueEap: boolean | null;
  ressourceEapCommunique: 'esu' | 'eso' | 'max' | null;

  // To upload file
  file: any;

  constructor() {
    this.departement = null;
    this.id = null;
    this.numero = '';
    this.dateDebut = null;
    this.dateFin = null;
    this.dateSignature = null;
    this.statut = 'a_valider';
    this.fichier = null;
    this.arretesCadre = [];
    this.restrictions = [];
    this.niveauGraviteSpecifiqueEap = null;
    this.ressourceEapCommunique = null;
    this.arreteRestrictionAbroge = null;
  }
}

export enum ArreteRestrictionStatutFr {
  a_valider = 'Brouillon',
  a_venir = 'Publication à venir',
  publie = 'Publié',
  abroge = 'Abrogé',
}
