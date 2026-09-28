from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Page
from ..models import Staff
from ..models import GalleryPage
from ..schemas import GalleryPageResponse


router = APIRouter(
    prefix="/public",
    tags=["Public"]
)


@router.get("/welcome")
def get_public_welcome(
    db: Session = Depends(get_db)
):

    page = (
        db.query(Page)
        .filter(
            Page.slug == "welcome",
            Page.status == "published"
        )
        .first()
    )

    if not page:
        raise HTTPException(
            status_code=404,
            detail="Welcome page not found"
        )

    return {
        "title": page.title,
        "html": page.content,
        "css": page.css
    }

@router.get("/staff")
def get_public_staff(
    db: Session = Depends(get_db)
):
    staff_members = (
        db.query(Staff)
        .filter(Staff.status == "published")
        .order_by(
            Staff.teacher_order.asc(),
            Staff.name.asc()
        )
        .all()
    )

    if not staff_members:
        raise HTTPException(
            status_code=404,
            detail="staff not found"
        )

    return [
        {
            "id": staff.id,
            "photo_url": staff.photo_url,
            "teacher_code": staff.teacher_code,
            "gpf_pran": staff.gpf_pran,
            "name": staff.name,
            "address": staff.address,
            "mobile_number": staff.mobile_number,
            "designation": staff.designation,
            "gender": staff.gender,
            "teacher_cast": staff.teacher_cast,
            "qualifications": staff.qualifications,
            "account_entered_date": staff.account_entered_date,
            "regular_pay_scale_date": staff.regular_pay_scale_date,
            "current_school_admission_date": staff.current_school_admission_date,
            "dob": staff.dob,
            "retirement_date": staff.retirement_date,
            "employee_code": staff.employee_code,
        }
        for staff in staff_members
    ]

@router.get(
    "/{slug}",
    response_model=GalleryPageResponse
)
def get_public_gallery(
    slug: str,
    db: Session = Depends(get_db)
):
    gallery = (
        db.query(GalleryPage)
        .filter(
            GalleryPage.slug == slug,
            GalleryPage.status == "published"
        )
        .first()
    )

    if not gallery:
        raise HTTPException(
            status_code=404,
            detail="Gallery not found"
        )

    return gallery
    