import { EntityType, RelationType, RelationshipLink } from '../types/research';

export interface AllowedRelationRule {
  sourceType: EntityType;
  targetType: EntityType;
  allowedRelations: RelationType[];
  description: string;
}

export const ALLOWED_RELATION_RULES: AllowedRelationRule[] = [
  // Paper relationships
  {
    sourceType: 'paper',
    targetType: 'question',
    allowedRelations: ['informs', 'motivates'],
    description: 'Literature informs or motivates a research question',
  },
  {
    sourceType: 'paper',
    targetType: 'gap',
    allowedRelations: ['informs', 'motivates'],
    description: 'Literature reveals or motivates a research gap',
  },
  {
    sourceType: 'paper',
    targetType: 'hypothesis',
    allowedRelations: ['informs'],
    description: 'Literature informs a hypothesis',
  },
  {
    sourceType: 'paper',
    targetType: 'paper',
    allowedRelations: ['cites'],
    description: 'A paper cites prior literature',
  },
  {
    sourceType: 'paper',
    targetType: 'claim',
    allowedRelations: ['cites', 'supports', 'refutes'],
    description: 'Literature substantiates or refutes a scientific claim',
  },

  // Question relationships
  {
    sourceType: 'question',
    targetType: 'gap',
    allowedRelations: ['motivates'],
    description: 'A research question motivates exploration of a gap',
  },
  {
    sourceType: 'question',
    targetType: 'hypothesis',
    allowedRelations: ['motivates', 'informs'],
    description: 'A research question motivates a hypothesis',
  },

  // Gap relationships
  {
    sourceType: 'gap',
    targetType: 'hypothesis',
    allowedRelations: ['motivates', 'addresses'],
    description: 'A gap motivates a testable hypothesis',
  },

  // Hypothesis relationships
  {
    sourceType: 'hypothesis',
    targetType: 'experiment',
    allowedRelations: ['tests'],
    description: 'A hypothesis is tested by an experiment',
  },
  {
    sourceType: 'hypothesis',
    targetType: 'gap',
    allowedRelations: ['addresses'],
    description: 'A hypothesis addresses a research gap',
  },

  // Experiment relationships
  {
    sourceType: 'experiment',
    targetType: 'result',
    allowedRelations: ['produces', 'supports'],
    description: 'An experiment execution produces empirical results',
  },

  // Result relationships
  {
    sourceType: 'result',
    targetType: 'hypothesis',
    allowedRelations: ['supports', 'refutes', 'validates'],
    description: 'Results support, validate, or refute a hypothesis',
  },
  {
    sourceType: 'result',
    targetType: 'decision',
    allowedRelations: ['supports', 'informs', 'refutes'],
    description: 'Results provide empirical backing or inform a decision',
  },
  {
    sourceType: 'result',
    targetType: 'claim',
    allowedRelations: ['supports', 'refutes', 'validates'],
    description: 'Results validate or refute a scientific claim',
  },

  // Decision relationships
  {
    sourceType: 'decision',
    targetType: 'claim',
    allowedRelations: ['supports', 'derived_from'],
    description: 'A decision supports or establishes a scientific claim',
  },
  {
    sourceType: 'decision',
    targetType: 'hypothesis',
    allowedRelations: ['addresses', 'validates'],
    description: 'A decision resolves or validates a hypothesis',
  },
  {
    sourceType: 'decision',
    targetType: 'decision',
    allowedRelations: ['supersedes'],
    description: 'A decision supersedes a previous decision',
  },

  // Claim relationships
  {
    sourceType: 'claim',
    targetType: 'decision',
    allowedRelations: ['derived_from'],
    description: 'A claim is derived from an empirical decision',
  },
];

/**
 * Returns allowed relationship types between two entity types.
 */
export function getAllowedRelations(
  sourceType: EntityType,
  targetType: EntityType
): RelationType[] {
  const rule = ALLOWED_RELATION_RULES.find(
    (r) => r.sourceType === sourceType && r.targetType === targetType
  );
  return rule ? rule.allowedRelations : [];
}

/**
 * Verifies if a relationship type is semantically valid.
 */
export function isRelationSemanticallyAllowed(
  sourceType: EntityType,
  targetType: EntityType,
  relationType: RelationType
): boolean {
  const allowed = getAllowedRelations(sourceType, targetType);
  return allowed.includes(relationType);
}

/**
 * Checks whether adding a directed relationship from sourceId to targetId
 * creates a cycle in the directed graph.
 */
export function wouldCreateCycle(
  relationships: RelationshipLink[],
  sourceId: string,
  targetId: string
): boolean {
  if (sourceId === targetId) return true;

  // Build adjacency list
  const adj = new Map<string, string[]>();
  for (const rel of relationships) {
    if (!adj.has(rel.sourceId)) adj.set(rel.sourceId, []);
    adj.get(rel.sourceId)!.push(rel.targetId);
  }

  // If we add sourceId -> targetId, a cycle exists if there is already a path from targetId to sourceId
  const visited = new Set<string>();
  const queue = [targetId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === sourceId) return true;
    if (!visited.has(current)) {
      visited.add(current);
      const neighbors = adj.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
  }

  return false;
}
