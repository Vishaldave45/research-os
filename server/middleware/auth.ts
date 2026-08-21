import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbEngine, DBUser, DBWorkspaceMembership } from '../db/database';

export const JWT_SECRET = process.env.JWT_SECRET_KEY || 'dev_jwt_secret_key_change_in_production_32chars';
export const JWT_ALGORITHM = 'HS256';
export const ACCESS_TOKEN_EXPIRE_MINUTES = 120;

export interface AuthenticatedRequest extends Request {
  user?: DBUser;
  workspaceId?: string;
  membership?: DBWorkspaceMembership;
}

export function generateTokens(user: DBUser) {
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role, type: 'access' },
    JWT_SECRET,
    { expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m` }
  );

  const refreshToken = jwt.sign(
    { sub: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header with Bearer token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type provided for authorization.' });
    }

    const db = dbEngine.getDb();
    const user = db.users.find((u) => u.id === payload.sub);
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User account not found or inactive.' });
    }

    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Expired or invalid JWT token.', details: err.message });
  }
}

export function requireWorkspaceContext(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const wsHeader = req.headers['x-workspace-id'] as string;
  const db = dbEngine.getDb();

  // If no workspace header is supplied, fallback to the user's primary/first workspace
  let targetWsId = wsHeader;
  if (!targetWsId) {
    const userMemberships = db.memberships.filter((m) => m.user_id === req.user?.id);
    if (userMemberships.length > 0) {
      targetWsId = userMemberships[0].workspace_id;
    } else if (db.workspaces.length > 0) {
      targetWsId = db.workspaces[0].id;
    }
  }

  if (!targetWsId) {
    return res.status(400).json({ error: 'No workspace context found or specified in X-Workspace-Id header.' });
  }

  const workspace = db.workspaces.find((w) => w.id === targetWsId);
  if (!workspace) {
    return res.status(404).json({ error: `Workspace '${targetWsId}' not found.` });
  }

  const membership = db.memberships.find(
    (m) => m.workspace_id === targetWsId && m.user_id === req.user?.id
  );

  req.workspaceId = targetWsId;
  req.membership = membership;
  next();
}
