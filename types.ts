
export type AnalysisItemType = 'ERROR' | 'WARNING' | 'INFO';

export interface AnalysisItem {
  type: AnalysisItemType;
  title: string;
  logLines: string[];
  description: string;
  solution: string;
}
