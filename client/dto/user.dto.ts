export interface User {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleDepartement: string;
}

export enum UserRole {
  mte = 'MTE',
  departement = 'Département',
}
