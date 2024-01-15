export interface AlertDto {
  title?: string;
  type: 'success' | 'info' | 'warning' | 'error';
  description: string;
}