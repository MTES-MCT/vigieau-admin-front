import type { Departement } from "~/dto/departement.dto";

export interface ZoneAlerte {
  id: number;
  code: string;
  type: 'SUP' | 'SOU';
  nom: string;
  departement: Departement;
}
