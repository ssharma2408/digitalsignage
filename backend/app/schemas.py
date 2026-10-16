from datetime import datetime, date

from pydantic import BaseModel, EmailStr, ConfigDict, Field, model_validator
from typing import Any, Optional, List, Literal

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

Standard = Literal["બાલ", "1", "2", "3", "4", "5", "6", "7", "8"]


class StudentAttendanceBase(BaseModel):
    attendance_date: date
    standard: Standard
    section: str = Field(default="")

    registered_boys: int = Field(default=0, ge=0)
    registered_girls: int = Field(default=0, ge=0)

    present_boys: int = Field(default=0, ge=0)
    present_girls: int = Field(default=0, ge=0)

    absent_boys: int = Field(default=0, ge=0)
    absent_girls: int = Field(default=0, ge=0)

    come_boys: int = Field(default=0, ge=0)
    come_girls: int = Field(default=0, ge=0)

    go_boys: int = Field(default=0, ge=0)
    go_girls: int = Field(default=0, ge=0)

    midday_meal_beneficiaries: int = Field(default=0, ge=0)

    @model_validator(mode="after")
    def set_group_and_validate_counts(self):
        self.standard_group = (
            "Primary" if self.standard in ("બાલ", "1", "2", "3", "4", "5")
            else "Upper Primary"
        )

        if self.present_boys > self.registered_boys:
            raise ValueError("Present boys cannot exceed registered boys.")
        if self.present_girls > self.registered_girls:
            raise ValueError("Present girls cannot exceed registered girls.")

        if self.absent_boys > self.registered_boys:
            raise ValueError("Absent boys cannot exceed registered boys.")
        if self.absent_girls > self.registered_girls:
            raise ValueError("Absent girls cannot exceed registered girls.")

        if self.present_boys + self.absent_boys > self.registered_boys:
            raise ValueError("Present and absent boys exceed registered boys.")
        if self.present_girls + self.absent_girls > self.registered_girls:
            raise ValueError("Present and absent girls exceed registered girls.")

        return self

    # Populated by the validator above.
    standard_group: str = "Primary"


class StudentAttendanceCreate(StudentAttendanceBase):
    pass


class StudentAttendanceUpdate(StudentAttendanceBase):
    pass


class StudentAttendanceResponse(StudentAttendanceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime

    @property
    def total_strength(self) -> int:
        return self.registered_boys + self.registered_girls

