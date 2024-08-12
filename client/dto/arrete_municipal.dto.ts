import type { Commune } from '~/dto/commune.dto';

export class ArreteMunicipal {
  id: number | null;
  dateDebut: string | null;
  dateFin: string | null;
  statut: 'a_valider' | 'a_venir' | 'publie' | 'abroge';
  fichier: any;
  communes: Commune[];

  // To upload file
  file: any;

  constructor() {
    this.communes = [];
    this.id = null;
    this.dateDebut = null;
    this.dateFin = null;
    this.statut = 'a_valider';
    this.fichier = null;
  }
}
