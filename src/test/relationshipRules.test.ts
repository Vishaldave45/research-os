import { describe, it, expect } from 'vitest';
import {
  isRelationSemanticallyAllowed,
  getAllowedRelations,
  wouldCreateCycle,
  ALLOWED_RELATION_RULES,
} from '../utils/relationshipRules';
import { RelationshipLink } from '../types/research';

describe('Semantic Graph Ontology & Relationship Rules', () => {
  it('allows valid directional edge connections', () => {
    expect(isRelationSemanticallyAllowed('paper', 'evidence', 'produces')).toBe(true);
    expect(isRelationSemanticallyAllowed('gap', 'hypothesis', 'motivates')).toBe(true);
    expect(isRelationSemanticallyAllowed('gap', 'hypothesis', 'addresses')).toBe(true);
    expect(isRelationSemanticallyAllowed('hypothesis', 'experiment', 'tests')).toBe(true);
    expect(isRelationSemanticallyAllowed('experiment', 'result', 'produces')).toBe(true);
    expect(isRelationSemanticallyAllowed('result', 'claim', 'supports')).toBe(true);
    expect(isRelationSemanticallyAllowed('dataset', 'experiment', 'informs')).toBe(true);
    expect(isRelationSemanticallyAllowed('model', 'experiment', 'tests')).toBe(true);
  });

  it('rejects invalid or non-causal edge combinations', () => {
    expect(isRelationSemanticallyAllowed('claim', 'question', 'produces')).toBe(false);
    expect(isRelationSemanticallyAllowed('experiment', 'paper', 'addresses' as any)).toBe(false);
    expect(isRelationSemanticallyAllowed('dataset', 'decision', 'leads_to' as any)).toBe(false);
  });

  it('contains comprehensive 10-archetype relationship ontology', () => {
    expect(ALLOWED_RELATION_RULES.length).toBeGreaterThan(15);
  });

  it('detects cycles accurately in directed graph', () => {
    const existingEdges: RelationshipLink[] = [
      {
        id: '1',
        sourceId: 'A',
        sourceType: 'experiment',
        targetId: 'B',
        targetType: 'result',
        relationType: 'produces',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        sourceId: 'B',
        sourceType: 'result',
        targetId: 'C',
        targetType: 'claim',
        relationType: 'produces',
        createdAt: new Date().toISOString(),
      },
    ];

    // Self-loop is a cycle
    expect(wouldCreateCycle(existingEdges, 'A', 'A')).toBe(true);

    // C -> A would create A -> B -> C -> A cycle
    expect(wouldCreateCycle(existingEdges, 'C', 'A')).toBe(true);

    // A -> D does not create a cycle
    expect(wouldCreateCycle(existingEdges, 'A', 'D')).toBe(false);
  });
});
