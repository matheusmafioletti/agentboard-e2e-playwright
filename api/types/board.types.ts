export type WorkItemType = 'FEATURE' | 'USER_STORY' | 'TASK';

export interface ProjectResult {
  id: string;
  name: string;
}

export interface WorkItemResult {
  id: string;
}
