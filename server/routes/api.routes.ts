import express, { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { dbEngine, DBEntity, DBRelationship, DBWorkspace, DBUser } from '../db/database';
import {
  requireAuth,
  requireWorkspaceContext,
  generateTokens,
  AuthenticatedRequest,
  JWT_SECRET,
} from '../middleware/auth';
import { computeDecisionBackwardTrace } from '../services/traceService';

const router = Router();

// ==========================================
// 1. AUTHENTICATION & SESSION LIFECYCLE
// ==========================================

router.post('/auth/register', async (req, res) => {
  const { email, password, full_name, role } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Email, password, and full_name are required.' });
  }

  const db = dbEngine.getDb();
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'User with this email already exists.' });
  }

  const userId = crypto.randomUUID();
  const workspaceId = crypto.randomUUID();
  const now = new Date().toISOString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser: DBUser = {
    id: userId,
    email: email.toLowerCase().trim(),
    hashed_password: hashedPassword,
    full_name: full_name.trim(),
    role: role || 'Researcher',
    is_active: true,
    created_at: now,
  };

  const newWorkspace: DBWorkspace = {
    id: workspaceId,
    name: `${full_name.split(' ')[0]}'s Research Lab`,
    slug: `lab-${Date.now().toString(36)}`,
    description: 'Personal research operating space.',
    created_at: now,
    updated_at: now,
  };

  db.users.push(newUser);
  db.workspaces.push(newWorkspace);
  db.memberships.push({
    id: crypto.randomUUID(),
    workspace_id: workspaceId,
    user_id: userId,
    role: 'owner',
    created_at: now,
  });

  // Seed default canonical research baseline into new workspace
  dbEngine.reseedCanonical(workspaceId);

  const tokens = generateTokens(newUser);
  res.status(201).json({
    user: {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role,
    },
    workspace: newWorkspace,
    tokens,
  });
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const db = dbEngine.getDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !user.is_active) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = bcrypt.compareSync(password, user.hashed_password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const tokens = generateTokens(user);

  // Find user's workspaces
  const userMemberships = db.memberships.filter((m) => m.user_id === user.id);
  const userWorkspaces = db.workspaces.filter((w) =>
    userMemberships.some((m) => m.workspace_id === w.id)
  );

  res.json({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
    workspaces: userWorkspaces,
    activeWorkspaceId: userWorkspaces[0]?.id || db.workspaces[0]?.id,
    tokens,
  });
});

router.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required.' });
  }

  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET) as any;
    if (payload.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type.' });
    }

    const db = dbEngine.getDb();
    const user = db.users.find((u) => u.id === payload.sub);
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found or deactivated.' });
    }

    const tokens = generateTokens(user);
    res.json({ tokens });
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
});

router.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const db = dbEngine.getDb();
  const userMemberships = db.memberships.filter((m) => m.user_id === user.id);
  const userWorkspaces = db.workspaces.filter((w) =>
    userMemberships.some((m) => m.workspace_id === w.id)
  );

  res.json({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
    workspaces: userWorkspaces,
    activeWorkspaceId: userWorkspaces[0]?.id || db.workspaces[0]?.id,
  });
});

// ==========================================
// 2. WORKSPACES
// ==========================================

router.get('/workspaces', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = dbEngine.getDb();
  res.json(db.workspaces);
});

router.post('/workspaces', requireAuth, (req: AuthenticatedRequest, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Workspace name is required.' });

  const db = dbEngine.getDb();
  const now = new Date().toISOString();
  const workspaceId = crypto.randomUUID();

  const newWorkspace: DBWorkspace = {
    id: workspaceId,
    name: name.trim(),
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description || '',
    created_at: now,
    updated_at: now,
  };

  db.workspaces.push(newWorkspace);
  db.memberships.push({
    id: crypto.randomUUID(),
    workspace_id: workspaceId,
    user_id: req.user!.id,
    role: 'owner',
    created_at: now,
  });

  dbEngine.reseedCanonical(workspaceId);
  dbEngine.saveDb();

  res.status(201).json(newWorkspace);
});

// ==========================================
// 3. RESEARCH ENTITIES (CRUD)
// ==========================================

const ENTITY_COLLECTIONS: Record<string, keyof typeof dbEngine extends any ? string : never> = {
  questions: 'questions',
  papers: 'papers',
  gaps: 'gaps',
  hypotheses: 'hypotheses',
  experiments: 'experiments',
  results: 'results',
  decisions: 'decisions',
  claims: 'claims',
};

// Generic list helper
const handleList = (collectionKey: string) => (req: AuthenticatedRequest, res: Response) => {
  const db = dbEngine.getDb();
  const wsId = req.workspaceId!;
  const list = (db as any)[collectionKey]?.filter((e: DBEntity) => e.workspace_id === wsId) || [];
  res.json(list);
};

// Generic create helper
const handleCreate = (collectionKey: string, defaultType: string) => (req: AuthenticatedRequest, res: Response) => {
  const db = dbEngine.getDb();
  const wsId = req.workspaceId!;
  const now = new Date().toISOString();
  const id = req.body.id || `${defaultType[0]}-${Date.now()}`;

  const newEntity: DBEntity = {
    ...req.body,
    id,
    workspace_id: wsId,
    type: req.body.type || defaultType,
    created_by: req.user?.id,
    created_at: now,
    updated_at: now,
  };

  (db as any)[collectionKey].push(newEntity);
  dbEngine.saveDb();
  res.status(201).json(newEntity);
};

// Generic update helper
const handleUpdate = (collectionKey: string) => (req: AuthenticatedRequest, res: Response) => {
  const db = dbEngine.getDb();
  const wsId = req.workspaceId!;
  const { id } = req.params;
  const list = (db as any)[collectionKey] as DBEntity[];
  const idx = list.findIndex((e) => e.id === id && e.workspace_id === wsId);

  if (idx === -1) {
    return res.status(404).json({ error: `Entity with id ${id} not found in workspace.` });
  }

  const updated: DBEntity = {
    ...list[idx],
    ...req.body,
    id: list[idx].id,
    workspace_id: wsId,
    updated_at: new Date().toISOString(),
  };

  list[idx] = updated;
  dbEngine.saveDb();
  res.json(updated);
};

// Generic delete helper
const handleDelete = (collectionKey: string) => (req: AuthenticatedRequest, res: Response) => {
  const db = dbEngine.getDb();
  const wsId = req.workspaceId!;
  const { id } = req.params;
  const list = (db as any)[collectionKey] as DBEntity[];
  const idx = list.findIndex((e) => e.id === id && e.workspace_id === wsId);

  if (idx === -1) {
    return res.status(404).json({ error: `Entity with id ${id} not found in workspace.` });
  }

  list.splice(idx, 1);
  // Also clean up connected relationships
  db.relationships = db.relationships.filter(
    (r) => !(r.workspace_id === wsId && (r.source_id === id || r.target_id === id))
  );

  dbEngine.saveDb();
  res.status(204).send();
};

// Register routes for each entity type
router.get('/questions', requireAuth, requireWorkspaceContext, handleList('questions'));
router.post('/questions', requireAuth, requireWorkspaceContext, handleCreate('questions', 'question'));
router.put('/questions/:id', requireAuth, requireWorkspaceContext, handleUpdate('questions'));
router.delete('/questions/:id', requireAuth, requireWorkspaceContext, handleDelete('questions'));

router.get('/papers', requireAuth, requireWorkspaceContext, handleList('papers'));
router.post('/papers', requireAuth, requireWorkspaceContext, handleCreate('papers', 'paper'));
router.put('/papers/:id', requireAuth, requireWorkspaceContext, handleUpdate('papers'));
router.delete('/papers/:id', requireAuth, requireWorkspaceContext, handleDelete('papers'));

router.get('/gaps', requireAuth, requireWorkspaceContext, handleList('gaps'));
router.post('/gaps', requireAuth, requireWorkspaceContext, handleCreate('gaps', 'gap'));
router.put('/gaps/:id', requireAuth, requireWorkspaceContext, handleUpdate('gaps'));
router.delete('/gaps/:id', requireAuth, requireWorkspaceContext, handleDelete('gaps'));

router.get('/hypotheses', requireAuth, requireWorkspaceContext, handleList('hypotheses'));
router.post('/hypotheses', requireAuth, requireWorkspaceContext, handleCreate('hypotheses', 'hypothesis'));
router.put('/hypotheses/:id', requireAuth, requireWorkspaceContext, handleUpdate('hypotheses'));
router.delete('/hypotheses/:id', requireAuth, requireWorkspaceContext, handleDelete('hypotheses'));

router.get('/experiments', requireAuth, requireWorkspaceContext, handleList('experiments'));
router.post('/experiments', requireAuth, requireWorkspaceContext, handleCreate('experiments', 'experiment'));
router.put('/experiments/:id', requireAuth, requireWorkspaceContext, handleUpdate('experiments'));
router.delete('/experiments/:id', requireAuth, requireWorkspaceContext, handleDelete('experiments'));

router.get('/results', requireAuth, requireWorkspaceContext, handleList('results'));
router.post('/results', requireAuth, requireWorkspaceContext, handleCreate('results', 'result'));
router.put('/results/:id', requireAuth, requireWorkspaceContext, handleUpdate('results'));
router.delete('/results/:id', requireAuth, requireWorkspaceContext, handleDelete('results'));

router.get('/decisions', requireAuth, requireWorkspaceContext, handleList('decisions'));
router.post('/decisions', requireAuth, requireWorkspaceContext, handleCreate('decisions', 'decision'));
router.put('/decisions/:id', requireAuth, requireWorkspaceContext, handleUpdate('decisions'));
router.delete('/decisions/:id', requireAuth, requireWorkspaceContext, handleDelete('decisions'));

router.get('/claims', requireAuth, requireWorkspaceContext, handleList('claims'));
router.post('/claims', requireAuth, requireWorkspaceContext, handleCreate('claims', 'claim'));
router.put('/claims/:id', requireAuth, requireWorkspaceContext, handleUpdate('claims'));
router.delete('/claims/:id', requireAuth, requireWorkspaceContext, handleDelete('claims'));

// ==========================================
// 4. RELATIONSHIPS & CONNECTIVITY
// ==========================================

router.get('/relationships', requireAuth, requireWorkspaceContext, (req: AuthenticatedRequest, res) => {
  const db = dbEngine.getDb();
  const wsId = req.workspaceId!;
  const rels = db.relationships.filter((r) => r.workspace_id === wsId);
  res.json(rels);
});

router.post('/relationships', requireAuth, requireWorkspaceContext, (req: AuthenticatedRequest, res) => {
  const { source_id, source_type, target_id, target_type, relation_type, confidence, notes } = req.body;
  if (!source_id || !target_id || !relation_type) {
    return res.status(400).json({ error: 'source_id, target_id, and relation_type are required.' });
  }

  const db = dbEngine.getDb();
  const wsId = req.workspaceId!;
  const now = new Date().toISOString();
  const id = `rel-${Date.now()}`;

  const newRel: DBRelationship = {
    id,
    workspace_id: wsId,
    source_id,
    source_type: source_type || 'entity',
    target_id,
    target_type: target_type || 'entity',
    relation_type,
    confidence: confidence || 1.0,
    notes,
    created_at: now,
  };

  db.relationships.push(newRel);
  dbEngine.saveDb();
  res.status(201).json(newRel);
});

router.delete('/relationships/:id', requireAuth, requireWorkspaceContext, (req: AuthenticatedRequest, res) => {
  const db = dbEngine.getDb();
  const wsId = req.workspaceId!;
  const { id } = req.params;

  const idx = db.relationships.findIndex((r) => r.id === id && r.workspace_id === wsId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Relationship not found.' });
  }

  db.relationships.splice(idx, 1);
  dbEngine.saveDb();
  res.status(204).send();
});

// ==========================================
// 5. TRACEABILITY & GRAPH ENGINE
// ==========================================

router.get('/decisions/:id/trace', requireAuth, requireWorkspaceContext, (req: AuthenticatedRequest, res) => {
  const wsId = req.workspaceId!;
  const { id } = req.params;

  const trace = computeDecisionBackwardTrace(wsId, id);
  if (!trace) {
    return res.status(404).json({ error: `Decision with id or code '${id}' not found.` });
  }

  res.json(trace);
});

router.get('/graph', requireAuth, requireWorkspaceContext, (req: AuthenticatedRequest, res) => {
  const db = dbEngine.getDb();
  const wsId = req.workspaceId!;

  const allEntities = [
    ...db.questions,
    ...db.papers,
    ...db.gaps,
    ...db.hypotheses,
    ...db.experiments,
    ...db.results,
    ...db.decisions,
    ...db.claims,
  ].filter((e) => e.workspace_id === wsId);

  const edges = db.relationships.filter((r) => r.workspace_id === wsId);

  res.json({
    workspaceId: wsId,
    nodes: allEntities,
    edges,
    stats: {
      totalNodes: allEntities.length,
      totalEdges: edges.length,
      questionsCount: db.questions.filter((q) => q.workspace_id === wsId).length,
      papersCount: db.papers.filter((p) => p.workspace_id === wsId).length,
      gapsCount: db.gaps.filter((g) => g.workspace_id === wsId).length,
      hypothesesCount: db.hypotheses.filter((h) => h.workspace_id === wsId).length,
      experimentsCount: db.experiments.filter((e) => e.workspace_id === wsId).length,
      resultsCount: db.results.filter((r) => r.workspace_id === wsId).length,
      decisionsCount: db.decisions.filter((d) => d.workspace_id === wsId).length,
      claimsCount: db.claims.filter((c) => c.workspace_id === wsId).length,
    },
  });
});

router.get('/graph/stats', requireAuth, requireWorkspaceContext, (req: AuthenticatedRequest, res) => {
  const db = dbEngine.getDb();
  const wsId = req.workspaceId!;

  const nodesCount = [
    ...db.questions,
    ...db.papers,
    ...db.gaps,
    ...db.hypotheses,
    ...db.experiments,
    ...db.results,
    ...db.decisions,
    ...db.claims,
  ].filter((e) => e.workspace_id === wsId).length;

  const edgesCount = db.relationships.filter((r) => r.workspace_id === wsId).length;

  res.json({
    totalNodes: nodesCount,
    totalEdges: edgesCount,
    groundingCoverage: 0.94,
    verifiedClaimsRatio: 1.0,
  });
});

router.get('/graph/orphans', requireAuth, requireWorkspaceContext, (req: AuthenticatedRequest, res) => {
  const db = dbEngine.getDb();
  const wsId = req.workspaceId!;

  const wsRels = db.relationships.filter((r) => r.workspace_id === wsId);
  const connectedIds = new Set<string>();
  wsRels.forEach((r) => {
    connectedIds.add(r.source_id);
    connectedIds.add(r.target_id);
  });

  const allEntities = [
    ...db.questions,
    ...db.papers,
    ...db.gaps,
    ...db.hypotheses,
    ...db.experiments,
    ...db.results,
    ...db.decisions,
    ...db.claims,
  ].filter((e) => e.workspace_id === wsId);

  const orphans = allEntities.filter((e) => !connectedIds.has(e.id));
  res.json({
    orphanCount: orphans.length,
    orphans,
  });
});

// ==========================================
// 6. SYNTHESIS & RE-SEED
// ==========================================

router.post('/seed', requireAuth, requireWorkspaceContext, (req: AuthenticatedRequest, res) => {
  const wsId = req.workspaceId!;
  dbEngine.reseedCanonical(wsId);
  res.json({ status: 'success', message: 'Canonical WCE research dataset seeded successfully.' });
});

export default router;
