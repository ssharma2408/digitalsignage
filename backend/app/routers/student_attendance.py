from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import StudentAttendance
from app.schemas import (
    StudentAttendanceCreate,
    StudentAttendanceUpdate,
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin Attendance"]
)


def serialize(row):
    data = {
        column.name: getattr(row, column.name)
        for column in row.__table__.columns
    }
    data["total_strength"] = (
        row.registered_boys + row.registered_girls
    )
    data["total_present"] = row.present_boys + row.present_girls
    data["total_absent"] = row.absent_boys + row.absent_girls
    return data


def get_record_or_404(db: Session, record_id: int):
    row = db.query(StudentAttendance).filter(
        StudentAttendance.id == record_id
    ).first()

    if not row:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    return row


@router.get("/attendance")
def admin_list_attendance(
    attendance_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(StudentAttendance)

    if attendance_date:
        query = query.filter(
            StudentAttendance.attendance_date == attendance_date
        )

    rows = query.order_by(
        StudentAttendance.id,       
    ).all()

    return [serialize(row) for row in rows]


@router.post("/attendance", status_code=201)
def create_attendance(
    payload: StudentAttendanceCreate,
    db: Session = Depends(get_db),
):
    row = StudentAttendance(**payload.model_dump())
    db.add(row)

    try:
        db.commit()
        db.refresh(row)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Attendance already exists for this date, standard and section.",
        )

    return serialize(row)


@router.put("/attendance/{record_id}")
def update_attendance(
    record_id: int,
    payload: StudentAttendanceUpdate,
    db: Session = Depends(get_db),
):
    row = get_record_or_404(db, record_id)

    for field, value in payload.model_dump().items():
        setattr(row, field, value)

    try:
        db.commit()
        db.refresh(row)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Another record already exists for this date, standard and section.",
        )

    return serialize(row)


@router.delete("/attendance/{record_id}")
def delete_attendance(
    record_id: int,
    db: Session = Depends(get_db),
):
    row = get_record_or_404(db, record_id)
    db.delete(row)
    db.commit()

    return {"message": "Attendance record deleted successfully"}