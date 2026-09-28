from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models import Staff
from app.schemas import (
    StaffCreate,
    StaffUpdate,
    StaffResponse
)

router = APIRouter(
    prefix="/admin/staff",
    tags=["Admin Staff"]
)


# ---------------------------------------------------------
# GET ALL STAFF
# ---------------------------------------------------------

@router.get(
    "",
    response_model=list[StaffResponse]
)
def get_staff(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):

    staff = (
        db.query(Staff)
        .order_by(
            Staff.teacher_order.asc(),
            Staff.name.asc()
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

    return staff


# ---------------------------------------------------------
# GET SINGLE STAFF
# ---------------------------------------------------------

@router.get(
    "/{staff_id}",
    response_model=StaffResponse
)
def get_staff_by_id(
    staff_id: int,
    db: Session = Depends(get_db)
):

    staff = (
        db.query(Staff)
        .filter(Staff.id == staff_id)
        .first()
    )

    if not staff:
        raise HTTPException(
            status_code=404,
            detail="Staff member not found"
        )

    return staff


# ---------------------------------------------------------
# CREATE STAFF
# ---------------------------------------------------------

@router.post(
    "",
    response_model=StaffResponse,
    status_code=201
)
def create_staff(
    data: StaffCreate,
    db: Session = Depends(get_db)
):

    # Check teacher code
    existing = (
        db.query(Staff)
        .filter(Staff.teacher_code == data.teacher_code)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Teacher code already exists"
        )
    now = datetime.now(timezone.utc)
    staff = Staff(
        photo_url=data.photo_url,

        teacher_code=data.teacher_code,
        gpf_pran=data.gpf_pran,
        name=data.name,

        address=data.address,
        mobile_number=data.mobile_number,

        designation=data.designation,
        gender=data.gender,

        teacher_cast=data.teacher_cast,
        qualifications=data.qualifications,

        account_entered_date=data.account_entered_date,
        regular_pay_scale_date=data.regular_pay_scale_date,
        current_school_admission_date=data.current_school_admission_date,

        dob=data.dob,
        retirement_date=data.retirement_date,

        employee_code=data.employee_code,

        status=data.status or "published",

        created_at=now,
        updated_at=now
    )

    db.add(staff)
    db.commit()
    db.refresh(staff)

    return staff


# ---------------------------------------------------------
# UPDATE STAFF
# ---------------------------------------------------------

@router.put(
    "/{staff_id}",
    response_model=StaffResponse
)
def update_staff(
    staff_id: int,
    data: StaffUpdate,
    db: Session = Depends(get_db)
):

    staff = (
        db.query(Staff)
        .filter(Staff.id == staff_id)
        .first()
    )

    if not staff:
        raise HTTPException(
            status_code=404,
            detail="Staff member not found"
        )

    update_data = data.model_dump(
        exclude_unset=True
    )   

    for field, value in update_data.items():
        setattr(staff, field, value)

    db.commit()
    db.refresh(staff)

    return staff


# ---------------------------------------------------------
# DELETE STAFF
# ---------------------------------------------------------

@router.delete(
    "/{staff_id}"
)
def delete_staff(
    staff_id: int,
    db: Session = Depends(get_db)
):

    staff = (
        db.query(Staff)
        .filter(Staff.id == staff_id)
        .first()
    )

    if not staff:
        raise HTTPException(
            status_code=404,
            detail="Staff member not found"
        )

    db.delete(staff)
    db.commit()

    return {
        "message": "Staff deleted successfully",
        "id": staff_id
    }