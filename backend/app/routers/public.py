from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Page
from ..models import Staff
from ..models import GalleryPage
from ..schemas import GalleryPageResponse
from ..cache import cache


router = APIRouter(
    prefix="/public",
    tags=["Public"]
)



@router.get("/welcome")
def get_public_welcome(
    db: Session = Depends(get_db)
):
    # Change the key to avoid using the old cached Page object.
    cache_key = "public_welcome_v2"

    cached_welcome = cache.get(cache_key)

    if cached_welcome is not None:
        return cached_welcome

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

    # Cache the API response, not the SQLAlchemy model.
    response = {
        "title": page.title,
        "html": page.content,
        "css": page.css
    }

    cache.set(
        cache_key,
        response,
        ttl=7200
    )

    return response


@router.get("/staff")
def get_public_staff(
    db: Session = Depends(get_db)
):

    cache_key = "public_staff"
    cached_staff = cache.get(cache_key)

    if cached_staff is not None:
        return cached_staff
    
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

    response =  [
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

    cache.set(
        cache_key,
        response,
        ttl=7200
    )

    return response



@router.get(
    "/gallery",
    response_model=list[GalleryPageResponse]
)
def get_galleries(db: Session = Depends(get_db)):

    cache_key = "public_gallery_v2"
    cached_gallery = cache.get(cache_key)

    if cached_gallery is not None:
        return cached_gallery

    galleries = (
        db.query(GalleryPage)
        .filter(GalleryPage.status == "published")
        .order_by(GalleryPage.title.asc())
        .all()
    )

    # Convert SQLAlchemy objects, including nested items,
    # into JSON-compatible dictionaries.
    response = [
        GalleryPageResponse.model_validate(gallery).model_dump(mode="json")
        for gallery in galleries
    ]

    cache.set(
        cache_key,
        response,
        ttl=7200
    )

    return response



@router.get(
    "/{slug}",
    response_model=GalleryPageResponse
)
def get_public_gallery(
    slug: str,
    db: Session = Depends(get_db)
):

    cache_key = f"public_gallery_{slug}"

    cached_gallery = cache.get(cache_key)

    if cached_gallery is not None:
        return cached_gallery
    
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

    response = {
            "id": gallery.id,
            "items": gallery.items,
            "page_order": gallery.page_order,
            "show_title": gallery.show_title,        
            "title": gallery.title,
            "slug": gallery.slug,
            "status": gallery.status, 
            "created_at": gallery.created_at,
            "updated_at": gallery.updated_at,
        }

    cache.set(
        cache_key,
        response,
        ttl=300
    )

    return response
