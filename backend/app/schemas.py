from datetime import datetime

from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Any, Optional, List

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class WelcomePageUpdate(BaseModel):
    html: str
    css: str
    project_data: dict[str, Any]

class StaffBase(BaseModel):

    photo_url: Optional[str] = None

    teacher_code: str
    gpf_pran: str
    name: str

    address: Optional[str] = None
    mobile_number: str

    designation: str
    gender: str

    teacher_cast: Optional[str] = None
    qualifications: Optional[str] = None

    account_entered_date: Optional[datetime] = None
    regular_pay_scale_date: Optional[datetime] = None
    current_school_admission_date: Optional[datetime] = None

    dob: Optional[datetime] = None
    retirement_date: Optional[datetime] = None

    employee_code: Optional[str] = None

    status: Optional[str] = "published"

    teacher_order: int = 0


class StaffCreate(StaffBase):
    pass


class StaffUpdate(BaseModel):

    photo_url: Optional[str] = None

    teacher_code: Optional[str] = None
    gpf_pran: Optional[str] = None
    name: Optional[str] = None

    address: Optional[str] = None
    mobile_number: Optional[str] = None

    designation: Optional[str] = None
    gender: Optional[str] = None

    teacher_cast: Optional[str] = None
    qualifications: Optional[str] = None

    account_entered_date: Optional[datetime] = None
    regular_pay_scale_date: Optional[datetime] = None
    current_school_admission_date: Optional[datetime] = None

    dob: Optional[datetime] = None
    retirement_date: Optional[datetime] = None

    employee_code: Optional[str] = None

    status: Optional[str] = None

    teacher_order: Optional[int] = None


class StaffResponse(StaffBase):

    id: int
    teacher_order: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class GalleryItemBase(BaseModel):
    image_url: str
    caption: Optional[str] = None
    item_order: int = 0

class GalleryItemCreate(GalleryItemBase):
    pass

class GalleryPageBase(BaseModel):
    title: str
    slug: str
    status: str = "published"
    page_order: int = 0
    show_title: bool = True

class GalleryPageCreate(GalleryPageBase):
    items: List[GalleryItemCreate] = Field(
        ...,
        min_length=1,
        max_length=9
    )

class GalleryPageUpdate(GalleryPageBase):
    items: List[GalleryItemCreate] = Field(
        ...,
        min_length=1,
        max_length=9
    )

class GalleryItemResponse(GalleryItemBase):
    id: int

    class Config:
        from_attributes = True

class GalleryPageResponse(GalleryPageBase):
    id: int

    created_at: datetime
    updated_at: datetime

    items: List[GalleryItemResponse] = []

    class Config:
        from_attributes = True

