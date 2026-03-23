export interface AnalogyMapping {
  concept: string;
  scene_element: string;
}

export interface Explanation {
  scene_source: string;
  hook: string;
  scene: string[];
  twist: string;
  deep_dive: string[];
  technical: string;
  key_points: string[];
  analogy_works: string;
  analogy_breaks: string;
  summary: string;
  storyboard: string[];
  storyboard_images?: string[];
  mapping: AnalogyMapping[];
  suggested_scene_image_prompt: string;
}

export interface ExplanationCache {
  hash: string;
  subtopicTitle: string;
  interest: string;
  mode: string;
  language: string;
  specificity: string;
  scene: string[];
  sceneSource: string;
  result: Explanation;
  createdAt: Date;
}

export interface ExplanationResponse {
  scene_source: string;
  hook: string;
  scene: string[];
  twist: string;
  deep_dive: string[];
  technical: string;
  key_points: string[];
  analogy_works: string;
  analogy_breaks: string;
  summary: string;
  storyboard: string[];
  mapping: Array<{ concept: string; scene_element: string }>;
}
