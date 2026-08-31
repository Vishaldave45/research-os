import {
  INITIAL_QUESTIONS,
  INITIAL_PAPERS,
  INITIAL_GAPS,
  INITIAL_HYPOTHESES,
  INITIAL_EXPERIMENTS,
  INITIAL_RESULTS,
  INITIAL_DECISIONS,
  INITIAL_CLAIMS,
  INITIAL_RELATIONSHIPS,
} from '../../data/canonicalWceData';
import { db } from '../firebase/firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export interface StoredUser {
  id: string;
  email: string;
  password?: string;
  full_name: string;
  role: string;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
  workspaces: string[];
}

export interface StoredWorkspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  owner_id: string;
  created_at: string;
  members: { user_id: string; role: string; email?: string; full_name?: string }[];
}

export interface StoredMember {
  id: string;
  workspace_id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'admin' | 'researcher' | 'viewer';
  created_at: string;
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'researchos_access_token',
  REFRESH_TOKEN: 'researchos_refresh_token',
  WORKSPACE_ID: 'researchos_workspace_id',
  USERS_DB: 'researchos_users_db',
  WORKSPACES_DB: 'researchos_workspaces_db',
  MEMBERS_PREFIX: 'researchos_members_',
  ENTITIES_PREFIX: 'researchos_entities_',
  RELATIONSHIPS_PREFIX: 'researchos_relationships_',
};

// Seed default development users
function getInitialUsers(): StoredUser[] {
  return [
    {
      id: 'usr-0000-0000-0001',
      email: 'lead.researcher@lab.org',
      password: 'Researcher#123',
      full_name: 'Dr. Elena Vance',
      role: 'Principal Investigator',
      is_active: true,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
      created_at: '2026-01-10T08:00:00.000Z',
      workspaces: ['ws-canonical-wce'],
    },
    {
      id: 'usr-0000-0000-0002',
      email: 'vdave8633@gmail.com',
      password: 'Researcher#123',
      full_name: 'Dr. V. Dave',
      role: 'Lead AI Scientist',
      is_active: true,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80',
      created_at: '2026-01-12T08:00:00.000Z',
      workspaces: ['ws-canonical-wce'],
    },
  ];
}

function getInitialWorkspaces(): StoredWorkspace[] {
  return [
    {
      id: 'ws-canonical-wce',
      name: 'Wireless Capsule Endoscopy Lab',
      slug: 'wce-lab',
      description: 'Model compression, depth reduction, and knowledge distillation on Kvasir-Capsule.',
      owner_id: 'usr-0000-0000-0001',
      created_at: '2026-01-10T08:30:00.000Z',
      members: [
        { user_id: 'usr-0000-0000-0001', role: 'owner', email: 'lead.researcher@lab.org', full_name: 'Dr. Elena Vance' },
        { user_id: 'usr-0000-0000-0002', role: 'admin', email: 'vdave8633@gmail.com', full_name: 'Dr. V. Dave' },
      ],
    },
  ];
}

function getInitialMembersForWorkspace(wsId: string): StoredMember[] {
  if (wsId === 'ws-canonical-wce') {
    return [
      {
        id: 'mem-001',
        workspace_id: 'ws-canonical-wce',
        user_id: 'usr-0000-0000-0001',
        email: 'lead.researcher@lab.org',
        full_name: 'Dr. Elena Vance',
        role: 'owner',
        created_at: '2026-01-10T08:30:00.000Z',
      },
      {
        id: 'mem-002',
        workspace_id: 'ws-canonical-wce',
        user_id: 'usr-0000-0000-0002',
        email: 'vdave8633@gmail.com',
        full_name: 'Dr. V. Dave',
        role: 'admin',
        created_at: '2026-01-12T09:00:00.000Z',
      },
    ];
  }
  return [
    {
      id: `mem-${Date.now()}-1`,
      workspace_id: wsId,
      user_id: 'usr-0000-0000-0001',
      email: 'lead.researcher@lab.org',
      full_name: 'Dr. Elena Vance',
      role: 'owner',
      created_at: new Date().toISOString(),
    },
  ];
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private activeWorkspaceId: string | null = null;

  constructor() {
    this.loadTokens();
    this.initDatabase();
  }

  private loadTokens() {
    try {
      this.accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      this.refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      this.activeWorkspaceId = localStorage.getItem(STORAGE_KEYS.WORKSPACE_ID);
    } catch {
      // Storage unavailable
    }
  }

  private initDatabase() {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.USERS_DB)) {
        localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(getInitialUsers()));
      }
      if (!localStorage.getItem(STORAGE_KEYS.WORKSPACES_DB)) {
        localStorage.setItem(STORAGE_KEYS.WORKSPACES_DB, JSON.stringify(getInitialWorkspaces()));
      }
      const canonicalKey = `${STORAGE_KEYS.ENTITIES_PREFIX}ws-canonical-wce`;
      if (!localStorage.getItem(canonicalKey)) {
        const initialEntities = {
          questions: INITIAL_QUESTIONS,
          papers: INITIAL_PAPERS,
          gaps: INITIAL_GAPS,
          hypotheses: INITIAL_HYPOTHESES,
          experiments: INITIAL_EXPERIMENTS,
          results: INITIAL_RESULTS,
          decisions: INITIAL_DECISIONS,
          claims: INITIAL_CLAIMS,
        };
        localStorage.setItem(canonicalKey, JSON.stringify(initialEntities));
      }
      const canonicalRelKey = `${STORAGE_KEYS.RELATIONSHIPS_PREFIX}ws-canonical-wce`;
      if (!localStorage.getItem(canonicalRelKey)) {
        localStorage.setItem(canonicalRelKey, JSON.stringify(INITIAL_RELATIONSHIPS));
      }
      const canonicalMemKey = `${STORAGE_KEYS.MEMBERS_PREFIX}ws-canonical-wce`;
      if (!localStorage.getItem(canonicalMemKey)) {
        localStorage.setItem(
          canonicalMemKey,
          JSON.stringify(getInitialMembersForWorkspace('ws-canonical-wce'))
        );
      }
    } catch (e) {
      console.warn('LocalStorage init warning:', e);
    }
  }

  public setTokens(accessToken: string, refreshToken?: string) {
    if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
      this.clearTokens();
      return;
    }
    this.accessToken = accessToken;
    if (refreshToken && refreshToken !== 'undefined') {
      this.refreshToken = refreshToken;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
    } catch {}
  }

  public clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch {}
  }

  public setActiveWorkspace(workspaceId: string) {
    if (!workspaceId) return;
    this.activeWorkspaceId = workspaceId;
    try {
      localStorage.setItem(STORAGE_KEYS.WORKSPACE_ID, workspaceId);
    } catch {}
  }

  public getActiveWorkspaceId(): string | null {
    if (this.activeWorkspaceId && this.activeWorkspaceId !== 'undefined') {
      return this.activeWorkspaceId;
    }
    try {
      const wsId = localStorage.getItem(STORAGE_KEYS.WORKSPACE_ID);
      if (wsId && wsId !== 'undefined') {
        this.activeWorkspaceId = wsId;
        return wsId;
      }
    } catch {}
    return 'ws-canonical-wce';
  }

  public getAccessToken(): string | null {
    if (this.accessToken && this.accessToken !== 'undefined' && this.accessToken !== 'null') {
      return this.accessToken;
    }
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token && token !== 'undefined' && token !== 'null') {
        this.accessToken = token;
        return token;
      }
    } catch {}
    return null;
  }

  private generateToken(userId: string, email: string, type: 'access' | 'refresh'): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: userId,
        email,
        type,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (type === 'access' ? 3600 : 86400 * 7),
      })
    );
    const sig = btoa(`sig_${userId}_${Date.now()}`).slice(0, 16);
    return `${header}.${payload}.${sig}`;
  }

  private decodeToken(token: string): { sub: string; email: string; type: string } | null {
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const decoded = JSON.parse(atob(parts[1]));
        return decoded;
      }
    } catch {}
    return null;
  }

  private getUsers(): StoredUser[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USERS_DB);
      if (raw) return JSON.parse(raw);
    } catch {}
    return getInitialUsers();
  }

  private saveUsers(users: StoredUser[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
    } catch {}
  }

  private getWorkspaces(): StoredWorkspace[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.WORKSPACES_DB);
      if (raw) return JSON.parse(raw);
    } catch {}
    return getInitialWorkspaces();
  }

  private saveWorkspaces(workspaces: StoredWorkspace[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKSPACES_DB, JSON.stringify(workspaces));
    } catch {}
  }

  private getMembers(workspaceId: string): StoredMember[] {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.MEMBERS_PREFIX}${workspaceId}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return getInitialMembersForWorkspace(workspaceId);
  }

  private saveMembers(workspaceId: string, members: StoredMember[]) {
    try {
      localStorage.setItem(`${STORAGE_KEYS.MEMBERS_PREFIX}${workspaceId}`, JSON.stringify(members));
    } catch {}
  }

  private getEntities(workspaceId: string): Record<string, any[]> {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.ENTITIES_PREFIX}${workspaceId}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    if (workspaceId === 'ws-canonical-wce') {
      return {
        questions: INITIAL_QUESTIONS,
        papers: INITIAL_PAPERS,
        gaps: INITIAL_GAPS,
        hypotheses: INITIAL_HYPOTHESES,
        experiments: INITIAL_EXPERIMENTS,
        results: INITIAL_RESULTS,
        decisions: INITIAL_DECISIONS,
        claims: INITIAL_CLAIMS,
      };
    }
    return {
      questions: [],
      papers: [],
      gaps: [],
      hypotheses: [],
      experiments: [],
      results: [],
      decisions: [],
      claims: [],
    };
  }

  private saveEntities(workspaceId: string, entities: Record<string, any[]>) {
    try {
      localStorage.setItem(`${STORAGE_KEYS.ENTITIES_PREFIX}${workspaceId}`, JSON.stringify(entities));
      // Asynchronously backup to Firestore collection if available
      this.syncWorkspaceToFirestore(workspaceId, entities).catch(() => {});
    } catch {}
  }

  private getRelationships(workspaceId: string): any[] {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.RELATIONSHIPS_PREFIX}${workspaceId}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    if (workspaceId === 'ws-canonical-wce') {
      return INITIAL_RELATIONSHIPS;
    }
    return [];
  }

  private saveRelationships(workspaceId: string, rels: any[]) {
    try {
      localStorage.setItem(`${STORAGE_KEYS.RELATIONSHIPS_PREFIX}${workspaceId}`, JSON.stringify(rels));
    } catch {}
  }

  private async syncWorkspaceToFirestore(workspaceId: string, entities: Record<string, any[]>) {
    try {
      if (db) {
        const wsRef = doc(db, 'workspaces', workspaceId);
        await setDoc(wsRef, { updatedAt: new Date().toISOString(), entityCount: Object.values(entities).flat().length }, { merge: true });
      }
    } catch {
      // Offline fallback
    }
  }

  /**
   * Authoritative routing engine with persistence across refresh,
   * authentication, workspace switching, and membership.
   */
  private async handleInternalRoute(
    endpoint: string,
    method: string,
    body: any,
    headers: Record<string, string>
  ): Promise<any> {
    const cleanUrl = endpoint.replace(/^\/api\/v1/, '').replace(/^\/api/, '');
    const path = cleanUrl.split('?')[0];
    const activeWsId = headers['X-Workspace-Id'] || this.getActiveWorkspaceId() || 'ws-canonical-wce';

    // -------------------------------------------------------------
    // AUTHENTICATION ROUTES
    // -------------------------------------------------------------
    if (path === '/auth/login' && method === 'POST') {
      const { email, password } = body || {};
      const users = this.getUsers();
      const user = users.find(
        (u) => u.email.toLowerCase() === (email || '').trim().toLowerCase()
      );

      if (!user) {
        const newUser: StoredUser = {
          id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          email: (email || 'researcher@lab.org').trim().toLowerCase(),
          password: password || 'Researcher#123',
          full_name: (email || '').split('@')[0].replace('.', ' ').toUpperCase() || 'Principal Researcher',
          role: 'researcher',
          is_active: true,
          created_at: new Date().toISOString(),
          workspaces: ['ws-canonical-wce'],
        };
        users.push(newUser);
        this.saveUsers(users);

        const accessToken = this.generateToken(newUser.id, newUser.email, 'access');
        const refreshToken = this.generateToken(newUser.id, newUser.email, 'refresh');
        this.setTokens(accessToken, refreshToken);

        return {
          user: {
            id: newUser.id,
            email: newUser.email,
            full_name: newUser.full_name,
            role: newUser.role,
            is_active: newUser.is_active,
            avatar_url: newUser.avatar_url,
          },
          tokens: {
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: 'bearer',
            expires_in: 3600,
          },
        };
      }

      const accessToken = this.generateToken(user.id, user.email, 'access');
      const refreshToken = this.generateToken(user.id, user.email, 'refresh');
      this.setTokens(accessToken, refreshToken);

      return {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          is_active: user.is_active,
          avatar_url: user.avatar_url,
        },
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: 'bearer',
          expires_in: 3600,
        },
      };
    }

    if (path === '/auth/register' && method === 'POST') {
      const { email, password, full_name, role } = body || {};
      const users = this.getUsers();
      const existing = users.find(
        (u) => u.email.toLowerCase() === (email || '').trim().toLowerCase()
      );

      const userId = existing?.id || `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const userObj: StoredUser = {
        id: userId,
        email: (email || 'researcher@lab.org').trim().toLowerCase(),
        password: password || 'Researcher#123',
        full_name: full_name || 'Dr. Principal Researcher',
        role: role || 'Principal Investigator',
        is_active: true,
        created_at: new Date().toISOString(),
        workspaces: ['ws-canonical-wce'],
      };

      if (!existing) {
        users.push(userObj);
        this.saveUsers(users);
      }

      const accessToken = this.generateToken(userObj.id, userObj.email, 'access');
      const refreshToken = this.generateToken(userObj.id, userObj.email, 'refresh');
      this.setTokens(accessToken, refreshToken);

      return {
        user: {
          id: userObj.id,
          email: userObj.email,
          full_name: userObj.full_name,
          role: userObj.role,
          is_active: userObj.is_active,
        },
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: 'bearer',
          expires_in: 3600,
        },
      };
    }

    if (path.includes('/auth/oauth/') && path.includes('/url')) {
      const provider = path.includes('google') ? 'google' : 'github';
      return {
        provider,
        url: `${window.location.origin}/auth/callback?provider=${provider}&code=auth_code_${Date.now()}`,
        configured: true,
        redirect_uri: `${window.location.origin}/auth/callback`,
      };
    }

    if (
      (path.includes('/auth/oauth/') && path.includes('/callback')) ||
      path === '/auth/oauth/dev-connect'
    ) {
      const users = this.getUsers();
      const provider = body?.provider || 'google';
      const email = body?.email || (provider === 'google' ? 'vdave8633@gmail.com' : 'github.researcher@lab.org');
      const name = body?.full_name || (provider === 'google' ? 'Dr. V. Dave' : 'Dr. GitHub Researcher');

      let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        user = {
          id: `usr-oauth-${Date.now()}`,
          email,
          full_name: name,
          role: 'Principal Investigator',
          is_active: true,
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
          created_at: new Date().toISOString(),
          workspaces: ['ws-canonical-wce'],
        };
        users.push(user);
        this.saveUsers(users);
      }

      const accessToken = this.generateToken(user.id, user.email, 'access');
      const refreshToken = this.generateToken(user.id, user.email, 'refresh');
      this.setTokens(accessToken, refreshToken);

      return {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          is_active: user.is_active,
          avatar_url: user.avatar_url,
        },
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: 'bearer',
          expires_in: 3600,
        },
      };
    }

    if (path === '/auth/refresh' && method === 'POST') {
      const token = body?.refresh_token || this.refreshToken;
      const decoded = token ? this.decodeToken(token) : null;
      const userId = decoded?.sub || 'usr-0000-0000-0001';
      const email = decoded?.email || 'lead.researcher@lab.org';

      const newAccess = this.generateToken(userId, email, 'access');
      const newRefresh = this.generateToken(userId, email, 'refresh');
      this.setTokens(newAccess, newRefresh);

      return {
        access_token: newAccess,
        refresh_token: newRefresh,
        token_type: 'bearer',
        expires_in: 3600,
      };
    }

    if (path === '/auth/me' && method === 'GET') {
      const authHeader = headers['Authorization'] || headers['authorization'] || '';
      const token = authHeader.replace(/^Bearer\s+/i, '') || this.getAccessToken();
      const decoded = token ? this.decodeToken(token) : null;
      const users = this.getUsers();
      const user =
        users.find((u) => u.id === decoded?.sub || u.email === decoded?.email) ||
        users[0];

      return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      };
    }

    if (path === '/auth/logout') {
      this.clearTokens();
      return { success: true };
    }

    // -------------------------------------------------------------
    // WORKSPACE MEMBERSHIP ROUTES
    // -------------------------------------------------------------
    const memberListMatch = path.match(/^\/workspaces\/([^/]+)\/members$/);
    if (memberListMatch) {
      const wsId = memberListMatch[1];
      if (method === 'GET') {
        return this.getMembers(wsId);
      }
      if (method === 'POST') {
        const members = this.getMembers(wsId);
        const { email, role } = body || {};
        const newMember: StoredMember = {
          id: `mem-${Date.now()}`,
          workspace_id: wsId,
          user_id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          email: email || 'collaborator@lab.org',
          full_name: (email || 'Collaborator').split('@')[0].replace('.', ' '),
          role: role || 'researcher',
          created_at: new Date().toISOString(),
        };
        members.push(newMember);
        this.saveMembers(wsId, members);
        return newMember;
      }
    }

    const memberDeleteMatch = path.match(/^\/workspaces\/([^/]+)\/members\/([^/]+)$/);
    if (memberDeleteMatch && method === 'DELETE') {
      const wsId = memberDeleteMatch[1];
      const userId = memberDeleteMatch[2];
      const members = this.getMembers(wsId);
      const filtered = members.filter((m) => m.user_id !== userId && m.id !== userId);
      this.saveMembers(wsId, filtered);
      return { success: true };
    }

    // -------------------------------------------------------------
    // WORKSPACE CRUD ROUTES
    // -------------------------------------------------------------
    if (path === '/workspaces' && method === 'GET') {
      return this.getWorkspaces();
    }

    if (path === '/workspaces' && method === 'POST') {
      const workspaces = this.getWorkspaces();
      const wsId = `ws-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newWs: StoredWorkspace = {
        id: wsId,
        name: body.name || 'New Research Lab',
        slug: body.slug || `lab-${Date.now()}`,
        description: body.description || '',
        owner_id: 'usr-0000-0000-0001',
        created_at: new Date().toISOString(),
        members: [{ user_id: 'usr-0000-0000-0001', role: 'owner' }],
      };
      workspaces.unshift(newWs);
      this.saveWorkspaces(workspaces);
      this.setActiveWorkspace(wsId);

      // Initialize workspace members
      const initialMem = getInitialMembersForWorkspace(wsId);
      this.saveMembers(wsId, initialMem);

      return newWs;
    }

    const singleWsMatch = path.match(/^\/workspaces\/([^/]+)$/);
    if (singleWsMatch && method === 'GET') {
      const wsId = singleWsMatch[1];
      const workspaces = this.getWorkspaces();
      const ws = workspaces.find((w) => w.id === wsId);
      if (ws) return ws;
      return {
        id: wsId,
        name: 'Research Lab',
        slug: 'research-lab',
        description: '',
        owner_id: 'usr-0000-0000-0001',
        created_at: new Date().toISOString(),
      };
    }

    // -------------------------------------------------------------
    // ENTITY CRUD ROUTES (Workspace-Scoped & Persistent)
    // -------------------------------------------------------------
    const entities = this.getEntities(activeWsId);
    const relationships = this.getRelationships(activeWsId);

    // Reset/seed canonical dataset or domain template
    if (path === '/seed/wce' || path === '/seed') {
      const initialEntities = {
        questions: INITIAL_QUESTIONS,
        papers: INITIAL_PAPERS,
        gaps: INITIAL_GAPS,
        hypotheses: INITIAL_HYPOTHESES,
        experiments: INITIAL_EXPERIMENTS,
        results: INITIAL_RESULTS,
        decisions: INITIAL_DECISIONS,
        claims: INITIAL_CLAIMS,
      };
      this.saveEntities(activeWsId, initialEntities);
      this.saveRelationships(activeWsId, INITIAL_RELATIONSHIPS);
      return { success: true, message: 'Canonical WCE dataset seeded successfully.' };
    }

    if (path === '/seed/template' || path === '/seed/custom') {
      if (body?.dataset) {
        const d = body.dataset;
        this.saveEntities(activeWsId, {
          questions: d.questions || [],
          papers: d.papers || [],
          gaps: d.gaps || [],
          hypotheses: d.hypotheses || [],
          experiments: d.experiments || [],
          results: d.results || [],
          decisions: d.decisions || [],
          claims: d.claims || [],
        });
        this.saveRelationships(activeWsId, d.relationships || []);
        return { success: true, message: 'Domain template dataset seeded successfully.' };
      }
    }

    // Relationships
    if (path === '/relationships') {
      if (method === 'GET') return relationships;
      if (method === 'POST') {
        const newRel = {
          id: `rel-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          source_id: body.source_id || body.sourceId,
          target_id: body.target_id || body.targetId,
          relation_type: body.relationship_type || body.relationshipType || body.relation_type || body.relationType,
          description: body.description || '',
          metadata: body.metadata || {},
          confidence: body.confidence ?? 0.95,
          notes: body.notes || '',
          created_at: new Date().toISOString(),
        };
        relationships.push(newRel);
        this.saveRelationships(activeWsId, relationships);
        return newRel;
      }
    }

    if (path.startsWith('/relationships/') && method === 'DELETE') {
      const relId = path.split('/')[2];
      const filtered = relationships.filter((r) => r.id !== relId);
      this.saveRelationships(activeWsId, filtered);
      return { success: true };
    }

    // Decision Tracing
    if (path.includes('/decisions/') && path.includes('/trace')) {
      const decisionId = path.split('/')[2];
      const allEntities = Object.values(entities).flat();
      const decision = entities.decisions?.find((d) => d.id === decisionId) || allEntities.find((e) => e.id === decisionId);

      return {
        decision: decision || { id: decisionId, title: 'Decision Trace' },
        lineage: {
          questions: entities.questions || [],
          hypotheses: entities.hypotheses || [],
          experiments: entities.experiments || [],
          results: entities.results || [],
          claims: entities.claims || [],
        },
        evidence_chain: relationships,
      };
    }

    // Standard entity collection endpoints
    const entityTypes = [
      'questions',
      'papers',
      'gaps',
      'hypotheses',
      'experiments',
      'results',
      'decisions',
      'claims',
    ];

    for (const key of entityTypes) {
      if (path === `/${key}`) {
        if (method === 'GET') {
          return entities[key] || [];
        }
        if (method === 'POST') {
          const list = entities[key] || [];
          const prefix = key.slice(0, 1).toLowerCase();
          const nextIndex = list.length + 1;
          const newEntity = {
            ...body,
            id: body.id || `${prefix}-${Date.now()}`,
            code: body.code || `${prefix.toUpperCase()}-${String(nextIndex).padStart(3, '0')}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          list.push(newEntity);
          entities[key] = list;
          this.saveEntities(activeWsId, entities);
          return newEntity;
        }
      }

      if (path.startsWith(`/${key}/`)) {
        const id = path.split('/')[2];
        const list = entities[key] || [];

        if (method === 'GET') {
          const found = list.find((e) => e.id === id);
          if (found) return found;
          throw { status: 404, message: `Entity with id ${id} not found.` };
        }

        if (method === 'PUT') {
          const idx = list.findIndex((e) => e.id === id);
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...body, updated_at: new Date().toISOString() };
            entities[key] = list;
            this.saveEntities(activeWsId, entities);
            return list[idx];
          }
          const created = { ...body, id, updated_at: new Date().toISOString() };
          list.push(created);
          entities[key] = list;
          this.saveEntities(activeWsId, entities);
          return created;
        }

        if (method === 'DELETE') {
          entities[key] = list.filter((e) => e.id !== id);
          this.saveEntities(activeWsId, entities);
          const cleanedRels = relationships.filter(
            (r) => (r.source_id || r.sourceId) !== id && (r.target_id || r.targetId) !== id
          );
          this.saveRelationships(activeWsId, cleanedRels);
          return { success: true };
        }
      }
    }

    return {};
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getAccessToken();
    const isPublicAuth =
      endpoint.includes('/auth/login') ||
      endpoint.includes('/auth/register') ||
      endpoint.includes('/auth/refresh') ||
      endpoint.includes('/auth/oauth/');

    if (token && !isPublicAuth && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const workspaceId = this.getActiveWorkspaceId();
    if (workspaceId && !headers['X-Workspace-Id']) {
      headers['X-Workspace-Id'] = workspaceId;
    }

    const method = (options.method || 'GET').toUpperCase();
    let parsedBody: any = undefined;
    if (options.body && typeof options.body === 'string') {
      try {
        parsedBody = JSON.parse(options.body);
      } catch {
        parsedBody = options.body;
      }
    } else if (options.body) {
      parsedBody = options.body;
    }

    return (await this.handleInternalRoute(endpoint, method, parsedBody, headers)) as T;
  }

  public get<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public put<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public delete<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
