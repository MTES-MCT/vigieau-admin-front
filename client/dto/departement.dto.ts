import type { ZoneAlerte } from "~/dto/zone_alerte.dto";

export interface Departement {
  id: number;
  code: string;
  nom: string;
  zonesAlerte: ZoneAlerte[];
}