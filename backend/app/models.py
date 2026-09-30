from datetime import datetime, timezone

from sqlalchemy import Column, BigInteger, String, Text, DateTime, Integer, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

from .database import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key = True
    )

    username: Mapped[str] = mapped_column(
        String(100),
        unique = True,
        nullable = False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique = True,
        nullable = False
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),        
        nullable = False
    )

    role: Mapped[str] = mapped_column(
        String(50),  
        default = 'author',
        nullable = False
    )

    status: Mapped[str] = mapped_column(
        String(20),  
        default = 'active',
        nullable = False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),  
        default = datetime.utcnow,
        nullable = False
    )

class Page(Base):
    __tablename__ = "pages"

    id = Column(BigInteger, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)

    content = Column(Text, nullable=True)
    css = Column(Text, nullable=True)

    project_data = Column(JSONB, nullable=True)

    status = Column(String(20), default="published")

    author_id = Column(BigInteger, nullable=True)

    created_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True))

class Staff(Base):
    __tablename__ = "staff"

    id = Column(BigInteger, primary_key=True, index=True)

    photo_url = Column(Text, nullable=True)

    teacher_code = Column(String(255), nullable=True)
    gpf_pran = Column(String(255), nullable=True)
    name = Column(String(255), nullable=False)

    address = Column(Text, nullable=True)
    mobile_number = Column(String(50), nullable=False)

    designation = Column(String(100), nullable=False)
    gender = Column(String(10), nullable=False)

    teacher_cast = Column(String(100), nullable=True)

    qualifications = Column(String(100), nullable=True)

    account_entered_date = Column(DateTime(timezone=True), nullable=True)
    regular_pay_scale_date = Column(DateTime(timezone=True), nullable=True)
    current_school_admission_date = Column(DateTime(timezone=True), nullable=True)

    dob = Column(DateTime(timezone=True), nullable=True)
    retirement_date = Column(DateTime(timezone=True), nullable=True)

    employee_code = Column(String(100), nullable=True)
    teacher_order = Column(
        Integer,
        nullable=False,
        default=0
    )
    status = Column(
        String(20),
        nullable=False,
        default="published"
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

class GalleryPage(Base):
    __tablename__ = "gallery_pages"

    id = Column(BigInteger, primary_key=True, index=True)

    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True)

    status = Column(
        String(20),
        default="published",
        nullable=False
    )

    page_order = Column(
        Integer,
        default=0,
        nullable=False
    )

    show_title = Column(Boolean, nullable=False, default=True)

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    items = relationship(
        "GalleryItem",
        back_populates="gallery_page",
        cascade="all, delete-orphan",
        order_by="GalleryItem.item_order"
    )


class GalleryItem(Base):
    __tablename__ = "gallery_items"

    id = Column(BigInteger, primary_key=True, index=True)

    gallery_page_id = Column(
        BigInteger,
        ForeignKey("gallery_pages.id", ondelete="CASCADE"),
        nullable=False
    )

    image_url = Column(Text, nullable=False)

    caption = Column(Text, nullable=True)

    item_order = Column(
        Integer,
        default=0,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    gallery_page = relationship(
        "GalleryPage",
        back_populates="items"
    )