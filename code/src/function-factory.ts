import summarize from './functions/summarize/index';
import ask from './functions/ask/index';

export const functionFactory = {
  // Add your functions here
  ask,
  summarize
} as const;

export type FunctionFactoryType = keyof typeof functionFactory;
