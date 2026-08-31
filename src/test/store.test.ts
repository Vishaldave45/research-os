import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useResearchStore } from '../store/useResearchStore';
import { entitiesApi } from '../services/api/entities.api';

describe('useResearchStore 10-Entity DAG State Management', () => {
  beforeEach(() => {
    useResearchStore.setState({
      questions: [],
      papers: [],
      evidence: [],
      datasets: [],
      models: [],
      gaps: [],
      hypotheses: [],
      experiments: [],
      results: [],
      decisions: [],
      claims: [],
      relationships: [],
    });
  });

  it('adds and retrieves an evidence entity in store', async () => {
    const newEvidence = {
      id: 'ev-test-1',
      code: 'EV-001',
      title: 'Benchmark Compression Evidence',
      summary: '4x compression with 0.1% loss',
      evidenceType: 'empirical' as const,
      strength: 'strong' as const,
      sourceType: 'paper' as const,
      confidenceScore: 92,
      tags: ['compression'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.spyOn(entitiesApi, 'createEvidence').mockResolvedValueOnce(newEvidence as any);

    const store = useResearchStore.getState();
    await store.addEntity({ ...newEvidence, type: 'evidence' } as any);

    const updated = useResearchStore.getState();
    expect(updated.evidence.length).toBe(1);
    expect(updated.evidence[0].code).toBe('EV-001');
  });

  it('adds and retrieves dataset and model entities', async () => {
    const newDataset = {
      id: 'ds-test-1',
      code: 'DS-001',
      name: 'Kvasir-Capsule Benchmark',
      description: 'Gastrointestinal capsule endoscopy dataset',
      domain: 'medical_ai',
      sizeBytes: 1024000,
      recordCount: 47238,
      license: 'CC-BY-4.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newModel = {
      id: 'md-test-1',
      code: 'M-001',
      name: 'CapsuleNet-Edge-INT4',
      architecture: 'Transformer-Conv Hybrid',
      framework: 'PyTorch 2.4',
      parameterCount: 14200000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.spyOn(entitiesApi, 'createDataset').mockResolvedValueOnce(newDataset as any);
    vi.spyOn(entitiesApi, 'createModel').mockResolvedValueOnce(newModel as any);

    const store = useResearchStore.getState();
    await store.addEntity({ ...newDataset, type: 'dataset' } as any);
    await store.addEntity({ ...newModel, type: 'model' } as any);

    const updated = useResearchStore.getState();
    expect(updated.datasets.length).toBe(1);
    expect(updated.datasets[0].code).toBe('DS-001');
    expect(updated.models.length).toBe(1);
    expect(updated.models[0].code).toBe('M-001');
  });
});
