export type DemoFormPriority = 'low' | 'medium' | 'high';

export interface IDemoFormRequestDto {
  name: string;
  email: string;
  message: string;
  category: 'general' | 'support' | 'feedback';
  subscribe: boolean;
  age: number;
  priority: DemoFormPriority;
  website?: string;
}

export interface IDemoFormResponseDto {
  id: string;
  submittedAt: string;
}
