export interface User {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleDepartements: string[];
}

export enum UserRole {
  mte = 'MTE',
  departement = 'Département',
}
