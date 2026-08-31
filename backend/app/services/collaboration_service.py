import uuid
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.collaboration import Comment, ResearchReview, AuditLog
from app.models.user import User
from app.schemas.collaboration import (
    CommentCreate,
    CommentRead,
    ReviewCreate,
    ReviewRead,
    AuditLogRead,
)


class CollaborationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # 1. Comments
    async def list_comments(
        self,
        workspace_id: uuid.UUID,
        entity_type: str,
        entity_id: uuid.UUID,
    ) -> List[CommentRead]:
        query = (
            select(Comment, User.full_name, User.email)
            .join(User, Comment.author_id == User.id)
            .where(
                Comment.workspace_id == workspace_id,
                Comment.entity_type == entity_type,
                Comment.entity_id == entity_id,
            )
            .order_by(Comment.created_at.asc())
        )
        result = await self.db.execute(query)
        rows = result.all()
        comments: List[CommentRead] = []
        for c, full_name, email in rows:
            comment_dict = {
                "id": c.id,
                "workspace_id": c.workspace_id,
                "entity_type": c.entity_type,
                "entity_id": c.entity_id,
                "parent_id": c.parent_id,
                "author_id": c.author_id,
                "author_name": full_name,
                "author_email": email,
                "content": c.content,
                "mentions": c.mentions or [],
                "is_resolved": c.is_resolved,
                "created_at": c.created_at,
                "updated_at": c.updated_at,
            }
            comments.append(CommentRead(**comment_dict))
        return comments

    async def create_comment(
        self,
        workspace_id: uuid.UUID,
        author_id: uuid.UUID,
        data: CommentCreate,
    ) -> CommentRead:
        comment = Comment(
            workspace_id=workspace_id,
            entity_type=data.entity_type,
            entity_id=data.entity_id,
            parent_id=data.parent_id,
            author_id=author_id,
            content=data.content,
            mentions=data.mentions,
        )
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)

        # Log audit trail
        await self.record_audit_log(
            workspace_id=workspace_id,
            actor_id=author_id,
            action="create_comment",
            entity_type=data.entity_type,
            entity_id=data.entity_id,
            after_state={"comment_id": str(comment.id), "content": comment.content},
        )

        user_res = await self.db.execute(select(User).where(User.id == author_id))
        user = user_res.scalar_one_or_none()

        return CommentRead(
            id=comment.id,
            workspace_id=comment.workspace_id,
            entity_type=comment.entity_type,
            entity_id=comment.entity_id,
            parent_id=comment.parent_id,
            author_id=comment.author_id,
            author_name=user.full_name if user else None,
            author_email=user.email if user else None,
            content=comment.content,
            mentions=comment.mentions or [],
            is_resolved=comment.is_resolved,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
        )

    async def delete_comment(
        self,
        comment_id: uuid.UUID,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> None:
        c_res = await self.db.execute(select(Comment).where(Comment.id == comment_id))
        comment = c_res.scalar_one_or_none()
        if not comment or comment.workspace_id != workspace_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")

        await self.db.delete(comment)
        await self.db.commit()

    # 2. Reviews
    async def list_reviews(
        self,
        workspace_id: uuid.UUID,
        entity_type: str,
        entity_id: uuid.UUID,
    ) -> List[ReviewRead]:
        query = (
            select(ResearchReview, User.full_name, User.email)
            .join(User, ResearchReview.reviewer_id == User.id)
            .where(
                ResearchReview.workspace_id == workspace_id,
                ResearchReview.entity_type == entity_type,
                ResearchReview.entity_id == entity_id,
            )
            .order_by(ResearchReview.created_at.desc())
        )
        result = await self.db.execute(query)
        rows = result.all()
        reviews: List[ReviewRead] = []
        for r, full_name, email in rows:
            reviews.append(ReviewRead(
                id=r.id,
                workspace_id=r.workspace_id,
                entity_type=r.entity_type,
                entity_id=r.entity_id,
                reviewer_id=r.reviewer_id,
                reviewer_name=full_name,
                reviewer_email=email,
                verdict=r.verdict,
                comments=r.comments,
                confidence_rating=r.confidence_rating,
                created_at=r.created_at,
                updated_at=r.updated_at,
            ))
        return reviews

    async def create_review(
        self,
        workspace_id: uuid.UUID,
        reviewer_id: uuid.UUID,
        data: ReviewCreate,
    ) -> ReviewRead:
        review = ResearchReview(
            workspace_id=workspace_id,
            entity_type=data.entity_type,
            entity_id=data.entity_id,
            reviewer_id=reviewer_id,
            verdict=data.verdict,
            comments=data.comments,
            confidence_rating=data.confidence_rating,
        )
        self.db.add(review)
        await self.db.commit()
        await self.db.refresh(review)

        # Log audit trail
        await self.record_audit_log(
            workspace_id=workspace_id,
            actor_id=reviewer_id,
            action="submit_review",
            entity_type=data.entity_type,
            entity_id=data.entity_id,
            after_state={"verdict": review.verdict, "confidence": review.confidence_rating},
        )

        user_res = await self.db.execute(select(User).where(User.id == reviewer_id))
        user = user_res.scalar_one_or_none()

        return ReviewRead(
            id=review.id,
            workspace_id=review.workspace_id,
            entity_type=review.entity_type,
            entity_id=review.entity_id,
            reviewer_id=review.reviewer_id,
            reviewer_name=user.full_name if user else None,
            reviewer_email=user.email if user else None,
            verdict=review.verdict,
            comments=review.comments,
            confidence_rating=review.confidence_rating,
            created_at=review.created_at,
            updated_at=review.updated_at,
        )

    # 3. Audit Logs
    async def record_audit_log(
        self,
        workspace_id: uuid.UUID,
        action: str,
        entity_type: str,
        entity_id: uuid.UUID,
        actor_id: Optional[uuid.UUID] = None,
        before_state: Optional[Dict[str, Any]] = None,
        after_state: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLog:
        log = AuditLog(
            workspace_id=workspace_id,
            actor_id=actor_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            before_state=before_state or {},
            after_state=after_state or {},
            ip_address=ip_address,
        )
        self.db.add(log)
        await self.db.commit()
        return log

    async def list_audit_logs(
        self,
        workspace_id: uuid.UUID,
        entity_type: Optional[str] = None,
        limit: int = 100,
    ) -> List[AuditLogRead]:
        query = select(AuditLog).where(AuditLog.workspace_id == workspace_id)
        if entity_type:
            query = query.where(AuditLog.entity_type == entity_type)
        query = query.order_by(AuditLog.created_at.desc()).limit(limit)

        result = await self.db.execute(query)
        logs = result.scalars().all()
        return [AuditLogRead.model_validate(l) for l in logs]
