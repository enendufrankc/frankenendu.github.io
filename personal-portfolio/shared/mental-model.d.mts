export type MentalModelKind = 'documented' | 'conceptual' | 'mixed';
export type MentalModelNodeState = 'documented' | 'proposed' | 'unverified';
export interface MentalModelNode { title: string; detail: string; state: MentalModelNodeState }
export interface MentalModelStage { label: string; nodes: MentalModelNode[] }
export interface MentalModel { kind: MentalModelKind; caption: string; stages: MentalModelStage[]; feedback?: string }
/** Validate and canonicalize JSON data. Missing and null values return null. */
export function validateMentalModel(value: unknown): MentalModel | null;
