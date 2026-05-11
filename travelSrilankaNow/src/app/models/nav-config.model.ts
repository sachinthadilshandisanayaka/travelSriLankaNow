export interface NavConfig {
  id?: number;
  routePath: string;
  labelKey: string;
  labelOverride?: string;
  displayOrder: number;
  isVisible: boolean;
  isFixed: boolean;
}
