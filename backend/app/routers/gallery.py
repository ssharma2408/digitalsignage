from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import GalleryPage, GalleryItem
from app.schemas import (
    GalleryPageCreate,
    GalleryPageUpdate,
    GalleryPageResponse
)

router = APIRouter(
    prefix="/admin/gallery",
    tags=["Admin Gallery"]
)

@router.get("", response_model=list[GalleryPageResponse])
def get_galleries(
    db: Session = Depends(get_db)
):
    return (
        db.query(GalleryPage)
        .order_by(
            GalleryPage.page_order.asc(),
            GalleryPage.title.asc()
        )
        .all()
    )

@router.get("/{gallery_id}", response_model=GalleryPageResponse)
def get_gallery(
    gallery_id: int,
    db: Session = Depends(get_db)
):
    gallery = (
        db.query(GalleryPage)
        .filter(GalleryPage.id == gallery_id)
        .first()
    )

    if not gallery:
        raise HTTPException(
            status_code=404,
            detail="Gallery not found"
        )

    return gallery

@router.post(
    "",
    response_model=GalleryPageResponse
)
def create_gallery(
    data: GalleryPageCreate,
    db: Session = Depends(get_db)
):
    # Gallery must contain 1 to 9 items
    if not 1 <= len(data.items) <= 9:
        raise HTTPException(
            status_code=400,
            detail="Gallery must contain between 1 and 9 items"
        )

    existing = (
        db.query(GalleryPage)
        .filter(GalleryPage.slug == data.slug)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Gallery slug already exists"
        )

    gallery = GalleryPage(
        title=data.title,
        slug=data.slug,
        status=data.status,
        page_order=data.page_order,
        show_title=data.show_title
    )

    db.add(gallery)
    db.flush()

    for index, item in enumerate(data.items):
        gallery_item = GalleryItem(
            gallery_page_id=gallery.id,
            image_url=item.image_url,
            caption=item.caption,
            item_order=item.item_order if item.item_order is not None else index
        )

        db.add(gallery_item)

    db.commit()
    db.refresh(gallery)

    return gallery


@router.put(
    "/{gallery_id}",
    response_model=GalleryPageResponse
)
def update_gallery(
    gallery_id: int,
    data: GalleryPageUpdate,
    db: Session = Depends(get_db)
):
    gallery = (
        db.query(GalleryPage)
        .filter(GalleryPage.id == gallery_id)
        .first()
    )

    if not gallery:
        raise HTTPException(
            status_code=404,
            detail="Gallery not found"
        )

    # Gallery must contain 1 to 9 items
    if not 1 <= len(data.items) <= 9:
        raise HTTPException(
            status_code=400,
            detail="Gallery must contain between 1 and 9 items"
        )

    gallery.title = data.title
    gallery.slug = data.slug
    gallery.status = data.status
    gallery.page_order = data.page_order
    gallery.show_title = data.show_title

    # Delete existing items
    db.query(GalleryItem).filter(
        GalleryItem.gallery_page_id == gallery.id
    ).delete(
        synchronize_session=False
    )

    # Insert updated items
    for index, item in enumerate(data.items):
        gallery_item = GalleryItem(
            gallery_page_id=gallery.id,
            image_url=item.image_url,
            caption=item.caption,
            item_order=item.item_order if item.item_order is not None else index
        )

        db.add(gallery_item)

    db.commit()
    db.refresh(gallery)

    return gallery

@router.delete("/{gallery_id}")
def delete_gallery(
    gallery_id: int,
    db: Session = Depends(get_db)
):
    gallery = (
        db.query(GalleryPage)
        .filter(GalleryPage.id == gallery_id)
        .first()
    )

    if not gallery:
        raise HTTPException(
            status_code=404,
            detail="Gallery not found"
        )

    db.delete(gallery)
    db.commit()

    return {
        "message": "Gallery deleted successfully"
    }