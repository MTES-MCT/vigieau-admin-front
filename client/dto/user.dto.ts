export interface User {
  email: string;
  firstName: string;
  LastName: string;
  role: string;
  roleDepartement: string;
}

export enum UserRole {
  mte = 'MTE',
  departement = 'Département',
}
