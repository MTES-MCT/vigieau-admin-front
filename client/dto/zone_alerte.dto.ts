import type { Departement } from '~/dto/departement.dto';
import type { ArreteCadre } from "~/dto/arrete_cadre.dto";

export interface ZoneAlerte {
  id: number;
  code: string;
  type: 'SUP' | 'SOU';
  nom: string;
  departement: Departement;
  arretesCadre: ArreteCadre[];
  disabled: boolean;
  
  geom?: any;
}
