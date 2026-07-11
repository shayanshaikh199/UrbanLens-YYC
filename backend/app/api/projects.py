from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Project, User
from app.db.session import get_db

router = APIRouter()


class UserCreate(BaseModel):
    username: str = Field(min_length=2, max_length=40)


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    filters: list[dict] = Field(default_factory=list)
    query: str | None = None


def _normalize_username(username: str) -> str:
    return username.strip().lower()


def _get_or_create_user(db: Session, username: str) -> User:
    normalized = _normalize_username(username)
    user = db.scalar(select(User).where(User.username == normalized))
    if user:
        return user
    user = User(username=normalized)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/users")
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    user = _get_or_create_user(db, payload.username)
    return {"id": user.id, "username": user.username, "created_at": user.created_at.isoformat()}


@router.get("/users/{username}/projects")
def list_projects(username: str, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.username == _normalize_username(username)))
    if not user:
        return {"username": _normalize_username(username), "projects": []}

    projects = db.scalars(
        select(Project).where(Project.user_id == user.id).order_by(Project.updated_at.desc())
    ).all()
    return {
        "username": user.username,
        "projects": [
            {
                "id": project.id,
                "name": project.name,
                "query": project.query,
                "filters": project.filters,
                "created_at": project.created_at.isoformat(),
                "updated_at": project.updated_at.isoformat(),
            }
            for project in projects
        ],
    }


@router.post("/users/{username}/projects")
def save_project(username: str, payload: ProjectCreate, db: Session = Depends(get_db)):
    user = _get_or_create_user(db, username)
    project = Project(user_id=user.id, name=payload.name.strip(), query=payload.query, filters=payload.filters)
    db.add(project)
    db.commit()
    db.refresh(project)
    return {
        "id": project.id,
        "name": project.name,
        "query": project.query,
        "filters": project.filters,
        "created_at": project.created_at.isoformat(),
        "updated_at": project.updated_at.isoformat(),
    }


@router.get("/users/{username}/projects/{project_id}")
def get_project(username: str, project_id: int, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.username == _normalize_username(username)))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    project = db.scalar(select(Project).where(Project.user_id == user.id, Project.id == project_id))
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        "id": project.id,
        "name": project.name,
        "query": project.query,
        "filters": project.filters,
        "created_at": project.created_at.isoformat(),
        "updated_at": project.updated_at.isoformat(),
    }
