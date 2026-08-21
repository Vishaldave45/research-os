import uuid
from typing import Optional, List
from sqlalchemy import select, and_, or_, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.relationship import Relationship


class RelationshipRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, rel_id: uuid.UUID, workspace_id: uuid.UUID) -> Optional[Relationship]:
        stmt = select(Relationship).where(
            Relationship.id == rel_id,
            Relationship.workspace_id == workspace_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, relationship: Relationship) -> Relationship:
        self.db.add(relationship)
        await self.db.flush()
        await self.db.refresh(relationship)
        return relationship

    async def exists(
        self,
        workspace_id: uuid.UUID,
        source_type: str,
        source_id: uuid.UUID,
        target_type: str,
        target_id: uuid.UUID,
        relation_type: str,
    ) -> bool:
        stmt = select(Relationship).where(
            and_(
                Relationship.workspace_id == workspace_id,
                Relationship.source_type == source_type,
                Relationship.source_id == source_id,
                Relationship.target_type == target_type,
                Relationship.target_id == target_id,
                Relationship.relation_type == relation_type,
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def list_for_workspace(
        self,
        workspace_id: uuid.UUID,
        relation_type: Optional[str] = None,
        entity_type: Optional[str] = None,
    ) -> List[Relationship]:
        stmt = select(Relationship).where(Relationship.workspace_id == workspace_id)
        if relation_type:
            stmt = stmt.where(Relationship.relation_type == relation_type)
        if entity_type:
            stmt = stmt.where(
                or_(
                    Relationship.source_type == entity_type,
                    Relationship.target_type == entity_type,
                )
            )
        stmt = stmt.order_by(Relationship.created_at.asc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_outgoing_for_entity(
        self,
        workspace_id: uuid.UUID,
        source_type: str,
        source_id: uuid.UUID,
    ) -> List[Relationship]:
        stmt = select(Relationship).where(
            and_(
                Relationship.workspace_id == workspace_id,
                Relationship.source_type == source_type,
                Relationship.source_id == source_id,
            )
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_incoming_for_entity(
        self,
        workspace_id: uuid.UUID,
        target_type: str,
        target_id: uuid.UUID,
    ) -> List[Relationship]:
        stmt = select(Relationship).where(
            and_(
                Relationship.workspace_id == workspace_id,
                Relationship.target_type == target_type,
                Relationship.target_id == target_id,
            )
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_all_for_entity(
        self,
        workspace_id: uuid.UUID,
        entity_type: str,
        entity_id: uuid.UUID,
    ) -> List[Relationship]:
        stmt = select(Relationship).where(
            and_(
                Relationship.workspace_id == workspace_id,
                or_(
                    and_(Relationship.source_type == entity_type, Relationship.source_id == entity_id),
                    and_(Relationship.target_type == entity_type, Relationship.target_id == entity_id),
                ),
            )
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def delete(self, rel_id: uuid.UUID, workspace_id: uuid.UUID) -> bool:
        stmt = (
            delete(Relationship)
            .where(
                and_(
                    Relationship.id == rel_id,
                    Relationship.workspace_id == workspace_id,
                )
            )
        )
        result = await self.db.execute(stmt)
        return result.rowcount > 0
