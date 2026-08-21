import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export interface DBWorkspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DBUser {
  id: string;
  email: string;
  hashed_password: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface DBWorkspaceMembership {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
}

export interface DBRefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  revoked: boolean;
  created_at: string;
}

export interface DBEntity {
  id: string;
  workspace_id: string;
  code: string;
  title: string;
  type: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface DBRelationship {
  id: string;
  workspace_id: string;
  source_id: string;
  source_type: string;
  target_id: string;
  target_type: string;
  relation_type: string;
  confidence?: number;
  notes?: string;
  created_at: string;
}

export interface DBSchema {
  workspaces: DBWorkspace[];
  users: DBUser[];
  memberships: DBWorkspaceMembership[];
  refresh_tokens: DBRefreshToken[];
  questions: DBEntity[];
  papers: DBEntity[];
  gaps: DBEntity[];
  hypotheses: DBEntity[];
  experiments: DBEntity[];
  results: DBEntity[];
  decisions: DBEntity[];
  claims: DBEntity[];
  relationships: DBRelationship[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'researchos.db.json');

class DatabaseEngine {
  private db: DBSchema;

  constructor() {
    this.ensureDbDir();
    this.db = this.loadDb();
  }

  private ensureDbDir() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private loadDb(): DBSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Error reading database file, initializing fresh schema:', err);
      }
    }

    const fresh = this.createInitialSchema();
    this.saveDb(fresh);
    return fresh;
  }

  private createInitialSchema(): DBSchema {
    const defaultWorkspaceId = '00000000-0000-0000-0000-000000000001';
    const defaultUserId = '00000000-0000-0000-0000-000000000002';
    const now = new Date().toISOString();

    const hashedPassword = bcrypt.hashSync('researcher123', 10);

    const defaultWorkspace: DBWorkspace = {
      id: defaultWorkspaceId,
      name: 'CapsuleVision AI: Ultra-Low-Power Transformers',
      slug: 'capsule-vision-ai',
      description: 'Design, quantization, and clinical validation of sub-2.4W Edge Vision Transformers for small-bowel endoscopy.',
      created_at: now,
      updated_at: now,
    };

    const defaultUser: DBUser = {
      id: defaultUserId,
      email: 'lead.researcher@lab.org',
      hashed_password: hashedPassword,
      full_name: 'Dr. Elena Rostova',
      role: 'Principal Investigator',
      is_active: true,
      created_at: now,
    };

    const defaultMembership: DBWorkspaceMembership = {
      id: '00000000-0000-0000-0000-000000000003',
      workspace_id: defaultWorkspaceId,
      user_id: defaultUserId,
      role: 'owner',
      created_at: now,
    };

    return {
      workspaces: [defaultWorkspace],
      users: [defaultUser],
      memberships: [defaultMembership],
      refresh_tokens: [],
      questions: [
        {
          id: 'q-1',
          workspace_id: defaultWorkspaceId,
          code: 'Q-001',
          title: 'Real-Time Edge ViT for Wireless Capsule Endoscopy',
          type: 'question',
          description: 'Can a Vision Transformer be compressed to operate under 2.4W continuous power dissipation at >= 45 FPS on an embedded SoC without compromising small-bowel bleeding detection sensitivity?',
          status: 'active',
          priority: 'high',
          created_at: now,
          updated_at: now,
        },
      ],
      papers: [
        {
          id: 'p-1',
          workspace_id: defaultWorkspaceId,
          code: 'P-001',
          title: 'Attention-based Polyp Segmentation in Video Capsule Endoscopy',
          type: 'paper',
          authors: ['Vaswani, A.', 'Chen, Y.', 'Patel, S.'],
          year: 2024,
          venue: 'IEEE TMI',
          abstract: 'Evaluates standard ViT-Base architectures for GI mucosal lesion localization. Achieves state-of-the-art 0.962 AUC but requires 18.4W GPU TDP, rendering it unsuitable for in-body ingestible devices.',
          created_at: now,
          updated_at: now,
        },
        {
          id: 'p-2',
          workspace_id: defaultWorkspaceId,
          code: 'P-002',
          title: 'Post-Training Quantization Pitfalls in Gastrointestinal Transformers',
          type: 'paper',
          authors: ['Gomez, M.', 'Zhang, L.'],
          year: 2025,
          venue: 'MICCAI',
          abstract: 'Demonstrates that naive uniform 4-bit integer quantization of self-attention weights leads to catastrophic clipping of mucosal bleeding edge gradients, reducing clinical sensitivity by 7.2%.',
          created_at: now,
          updated_at: now,
        },
        {
          id: 'p-3',
          workspace_id: defaultWorkspaceId,
          code: 'P-003',
          title: 'Spatial Patch Folding: Token Reduction for Low-Power Vision',
          type: 'paper',
          authors: ['Takahashi, K.', 'Al-Hassan, M.'],
          year: 2025,
          venue: 'CVPR',
          abstract: 'Introduces hierarchical spatial patch folding that reduces quadratic transformer token complexity by 64% while preserving fine mucosal vascular texture representations.',
          created_at: now,
          updated_at: now,
        },
        {
          id: 'p-4',
          workspace_id: defaultWorkspaceId,
          code: 'P-004',
          title: 'Thermal Dissipation Limits in Ingestible Medical Electronics',
          type: 'paper',
          authors: ['O\'Connor, B.', 'Keller, H.'],
          year: 2023,
          venue: 'Biomedical Microdevices',
          abstract: 'Defines the hard physical ceiling for in-body medical capsules: continuous dissipation above 2.4W causes capsule outer shell temperature to exceed 41.5°C, risking localized mucosal tissue necrosis.',
          created_at: now,
          updated_at: now,
        },
      ],
      gaps: [
        {
          id: 'g-1',
          workspace_id: defaultWorkspaceId,
          code: 'G-001',
          title: 'Catastrophic Accuracy Drop in Sub-8-bit ViT for Mucosal Lesions',
          type: 'gap',
          description: 'No existing literature addresses non-uniform distribution clipping in 4-bit ViT without requiring cloud-scale fine-tuning or exceeding the 2.4W thermal envelope of ingestible electronics.',
          impactLevel: 'critical',
          status: 'open',
          created_at: now,
          updated_at: now,
        },
      ],
      hypotheses: [
        {
          id: 'h-1',
          workspace_id: defaultWorkspaceId,
          code: 'H-001',
          title: 'Asymmetric 4-bit Quantization with Spatial Patch Folding',
          type: 'hypothesis',
          statement: 'Coupling asymmetric non-uniform 4-bit integer quantization with hierarchical spatial patch folding will retain AUC >= 0.950 on small-bowel bleeding datasets while lowering inference power to <= 2.2W at >= 45 FPS.',
          rationale: 'Non-uniform quantizer grids preserve outlier attention logits in bleed boundaries, while patch folding prevents quadratic self-attention memory bandwidth bottlenecks.',
          status: 'validated',
          confidence: 0.94,
          created_at: now,
          updated_at: now,
        },
      ],
      experiments: [
        {
          id: 'e-1',
          workspace_id: defaultWorkspaceId,
          code: 'E-001',
          title: 'Edge ViT-INT4 Benchmark on NVIDIA Jetson Nano / Cortex-M85',
          type: 'experiment',
          description: 'Deploy FoldedViT-INT4 on embedded Jetson Nano testbed (5W profile capped to 2.5W via clock gating). Evaluate continuous FPS, power draw via shunt resistor, and ROC-AUC over 15,400 small-bowel endoscopy frames.',
          status: 'completed',
          config: {
            batchSize: 1,
            precision: 'INT4-Asymmetric',
            patchSize: '16x16 folded to 8x8',
            testbed: 'NVIDIA Jetson Nano 4GB (Sub-2.5W Capped)',
          },
          created_at: now,
          updated_at: now,
        },
        {
          id: 'e-2',
          workspace_id: defaultWorkspaceId,
          code: 'E-002',
          title: 'Thermal Dissipation Chamber Test at 37°C Ambient',
          type: 'experiment',
          description: 'Continuous 8-hour inference inside a 37°C calibrated saline bath mimicking GI tract conditions. Monitor capsule skin temperature with thermal probes.',
          status: 'completed',
          config: {
            durationHours: 8,
            ambientTempC: 37.0,
            sensorType: 'K-type thermocouple array',
          },
          created_at: now,
          updated_at: now,
        },
      ],
      results: [
        {
          id: 'r-1',
          workspace_id: defaultWorkspaceId,
          code: 'R-001',
          title: 'Benchmark Metrics: FoldedViT-INT4',
          type: 'result',
          summary: 'FoldedViT-INT4 reached 48.6 FPS at 2.12W continuous power draw with an AUC of 0.952 (vs. FP32 baseline of 0.956). Mucosal bleed sensitivity was preserved at 94.8%.',
          metrics: {
            throughputFps: 48.6,
            powerWatts: 2.12,
            auc: 0.952,
            sensitivity: 0.948,
            specificity: 0.956,
            latencyMs: 20.57,
          },
          status: 'valid',
          created_at: now,
          updated_at: now,
        },
        {
          id: 'r-2',
          workspace_id: defaultWorkspaceId,
          code: 'R-002',
          title: 'Thermal Stability Profile: Max Shell 39.8°C',
          type: 'result',
          summary: 'Over 8 hours of continuous video streaming inference at 2.12W, maximum capsule shell temperature stabilized at 39.8°C (1.7°C below the 41.5°C necrosis safety limit).',
          metrics: {
            peakTempC: 39.8,
            safetyMarginC: 1.7,
            dissipationAvgWatts: 2.12,
          },
          status: 'valid',
          created_at: now,
          updated_at: now,
        },
      ],
      decisions: [
        {
          id: 'd-1',
          workspace_id: defaultWorkspaceId,
          code: 'D-001',
          title: 'Adopt FoldedViT-INT4 for Capsule Firmware v2.0',
          type: 'decision',
          outcome: 'accepted',
          rationale: 'Empirical results R-001 and R-002 conclusively demonstrate that FoldedViT-INT4 satisfies the sub-2.4W thermal ceiling, delivers 48.6 FPS real-time throughput, and retains 0.952 diagnostic AUC for mucosal lesions.',
          context: 'Supersedes FP16 and standard uniform INT8 prototypes. Direct deployment into firmware candidate build #104.',
          created_at: now,
          updated_at: now,
        },
      ],
      claims: [
        {
          id: 'c-1',
          workspace_id: defaultWorkspaceId,
          code: 'C-001',
          title: 'Mucosal Boundary Retention under Asymmetric INT4',
          type: 'claim',
          statement: 'Asymmetric 4-bit quantization with spatial patch folding enables clinically viable real-time Vision Transformer inference in ingestible endoscopy devices within a 2.2W power envelope.',
          confidenceScore: 0.96,
          status: 'verified',
          limitations: 'Validated on 15,400 frames across 4 patient cohorts; multicenter clinical trial scheduled for Q4 2026.',
          created_at: now,
          updated_at: now,
        },
      ],
      relationships: [
        {
          id: 'rel-1',
          workspace_id: defaultWorkspaceId,
          source_id: 'p-1',
          source_type: 'paper',
          target_id: 'q-1',
          target_type: 'question',
          relation_type: 'informs',
          created_at: now,
        },
        {
          id: 'rel-2',
          workspace_id: defaultWorkspaceId,
          source_id: 'p-2',
          source_type: 'paper',
          target_id: 'g-1',
          target_type: 'gap',
          relation_type: 'motivates',
          created_at: now,
        },
        {
          id: 'rel-3',
          workspace_id: defaultWorkspaceId,
          source_id: 'p-4',
          source_type: 'paper',
          target_id: 'q-1',
          target_type: 'question',
          relation_type: 'informs',
          created_at: now,
        },
        {
          id: 'rel-4',
          workspace_id: defaultWorkspaceId,
          source_id: 'g-1',
          source_type: 'gap',
          target_id: 'h-1',
          target_type: 'hypothesis',
          relation_type: 'motivates',
          created_at: now,
        },
        {
          id: 'rel-5',
          workspace_id: defaultWorkspaceId,
          source_id: 'p-3',
          source_type: 'paper',
          target_id: 'h-1',
          target_type: 'hypothesis',
          relation_type: 'informs',
          created_at: now,
        },
        {
          id: 'rel-6',
          workspace_id: defaultWorkspaceId,
          source_id: 'h-1',
          source_type: 'hypothesis',
          target_id: 'e-1',
          target_type: 'experiment',
          relation_type: 'tests',
          created_at: now,
        },
        {
          id: 'rel-7',
          workspace_id: defaultWorkspaceId,
          source_id: 'h-1',
          source_type: 'hypothesis',
          target_id: 'e-2',
          target_type: 'experiment',
          relation_type: 'tests',
          created_at: now,
        },
        {
          id: 'rel-8',
          workspace_id: defaultWorkspaceId,
          source_id: 'e-1',
          source_type: 'experiment',
          target_id: 'r-1',
          target_type: 'result',
          relation_type: 'supports',
          created_at: now,
        },
        {
          id: 'rel-9',
          workspace_id: defaultWorkspaceId,
          source_id: 'e-2',
          source_type: 'experiment',
          target_id: 'r-2',
          target_type: 'result',
          relation_type: 'supports',
          created_at: now,
        },
        {
          id: 'rel-10',
          workspace_id: defaultWorkspaceId,
          source_id: 'r-1',
          source_type: 'result',
          target_id: 'd-1',
          target_type: 'decision',
          relation_type: 'supports',
          created_at: now,
        },
        {
          id: 'rel-11',
          workspace_id: defaultWorkspaceId,
          source_id: 'r-2',
          source_type: 'result',
          target_id: 'd-1',
          target_type: 'decision',
          relation_type: 'supports',
          created_at: now,
        },
        {
          id: 'rel-12',
          workspace_id: defaultWorkspaceId,
          source_id: 'd-1',
          source_type: 'decision',
          target_id: 'c-1',
          target_type: 'claim',
          relation_type: 'derived_from',
          created_at: now,
        },
      ],
    };
  }

  public saveDb(data?: DBSchema) {
    if (data) this.db = data;
    this.ensureDbDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
  }

  public getDb(): DBSchema {
    return this.db;
  }

  public reseedCanonical(workspaceId: string) {
    const fresh = this.createInitialSchema();
    this.db.questions = this.db.questions.filter((q) => q.workspace_id !== workspaceId).concat(fresh.questions.map(q => ({ ...q, workspace_id: workspaceId })));
    this.db.papers = this.db.papers.filter((p) => p.workspace_id !== workspaceId).concat(fresh.papers.map(p => ({ ...p, workspace_id: workspaceId })));
    this.db.gaps = this.db.gaps.filter((g) => g.workspace_id !== workspaceId).concat(fresh.gaps.map(g => ({ ...g, workspace_id: workspaceId })));
    this.db.hypotheses = this.db.hypotheses.filter((h) => h.workspace_id !== workspaceId).concat(fresh.hypotheses.map(h => ({ ...h, workspace_id: workspaceId })));
    this.db.experiments = this.db.experiments.filter((e) => e.workspace_id !== workspaceId).concat(fresh.experiments.map(e => ({ ...e, workspace_id: workspaceId })));
    this.db.results = this.db.results.filter((r) => r.workspace_id !== workspaceId).concat(fresh.results.map(r => ({ ...r, workspace_id: workspaceId })));
    this.db.decisions = this.db.decisions.filter((d) => d.workspace_id !== workspaceId).concat(fresh.decisions.map(d => ({ ...d, workspace_id: workspaceId })));
    this.db.claims = this.db.claims.filter((c) => c.workspace_id !== workspaceId).concat(fresh.claims.map(c => ({ ...c, workspace_id: workspaceId })));
    this.db.relationships = this.db.relationships.filter((r) => r.workspace_id !== workspaceId).concat(fresh.relationships.map(r => ({ ...r, workspace_id: workspaceId })));
    this.saveDb();
    return this.db;
  }
}

export const dbEngine = new DatabaseEngine();
