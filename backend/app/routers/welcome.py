from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Page
from app.schemas import WelcomePageUpdate

router = APIRouter(
    prefix="/admin",
    tags=["Admin Welcome"]
)


@router.put("/welcome")
def update_welcome_page(
    data: WelcomePageUpdate,
    db: Session = Depends(get_db)
):
    page = db.query(Page).filter(Page.slug == "welcome").first()

    if not page:
        page = Page(
            title="Welcome",
            slug="welcome"
        )
        db.add(page)

    page.content = data.html
    page.css = data.css
    page.project_data = data.project_data

    db.commit()
    db.refresh(page)

    return {
        "message": "Welcome page saved successfully",
        "id": page.id
    }

@router.get("/welcome")
def get_welcome_page(
    db: Session = Depends(get_db)
):
    page = (
        db.query(Page)
        .filter(Page.slug == "welcome")
        .first()
    )

    if not page:
        raise HTTPException(
            status_code=404,
            detail="Welcome page not found"
        )

    return {
        "id": page.id,
        "title": page.title,
        "slug": page.slug,
        "html": page.content,
        "css": page.css,
        "project_data": page.project_data,
        "status": page.status,
    }