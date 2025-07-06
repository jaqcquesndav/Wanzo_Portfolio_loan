export type WidgetType = 
  | 'performance'
  | 'allocation'
  | 'risk'
  | 'trend'
  | 'custom';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  data: any;
  config: {
    timeRange?: string;
    metrics?: string[];
    filters?: Record<string, any>;
    visualization?: string;
  };
  layout?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  deleted?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  widgets: Widget[];
  layout: any;
  created_at: string;
  updated_at: string;
}

export interface WidgetTemplate {
  type: WidgetType;
  name: string;
  description: string;
  defaultConfig: Partial<Widget['config']>;
  preview: string;
}