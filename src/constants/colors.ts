export const colors = {
  primary: {
    base: '#197ca8',
    hover: '#1e90c3',
    light: '#e6f3f8',
    text: '#ffffff',
  },
  success: {
    base: '#015730',
    light: '#e6efe9',
    text: '#ffffff',
  },
  warning: {
    base: '#ee872b',
    light: '#fdf3ea',
    text: '#000000',
  },
} as const;

export type ColorKey = keyof typeof colors;
export type ColorVariant = 'base' | 'hover' | 'light' | 'text';

export function getColor(key: ColorKey, variant: ColorVariant = 'base'): string {
  return colors[key][variant];
}