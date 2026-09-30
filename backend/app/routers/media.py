import os
import uuid
from typing import List, Optional

from fastapi import APIRouter, UploadFile, File, HTTPException
from ..supabase_storage import upload_file, get_public_url

SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET")

router = APIRouter(
    prefix="/admin/media",
    tags=["Admin Media"]
)

# Example
UPLOAD_DIR = "uploads/images"

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
}


@router.post("/upload")
async def upload_image(
    file: Optional[UploadFile] = File(None),
    files: Optional[List[UploadFile]] = File(None, alias="files[]")
):
    """
    Accept image upload from:

    1. Staff form:
       file

    2. GrapesJS:
       files[]
    """

    # Combine both upload formats
    upload_files = []

    if file:
        upload_files.append(file)

    if files:
        upload_files.extend(files)

    # No file received
    if not upload_files:
        raise HTTPException(
            status_code=400,
            detail="No image file received. Expected 'file' or 'files[]'."
        )

    response_data = []

    for uploaded_file in upload_files:

        print("FILE RECEIVED:", uploaded_file.filename)
        print("CONTENT TYPE:", uploaded_file.content_type)

        # Validate MIME type
        if uploaded_file.content_type not in ALLOWED_TYPES:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported image type: "
                    f"{uploaded_file.content_type}"
                )
            )

        extension = ALLOWED_TYPES[uploaded_file.content_type]

        # Generate unique filename
        filename = f"{uuid.uuid4().hex}{extension}"

        filepath = f"{UPLOAD_DIR}/{filename}"

        # Read file
        contents = await uploaded_file.read()

        # Upload to Supabase
        upload_file(
            file_bytes=contents,
            file_path=filepath,
            content_type=uploaded_file.content_type or "application/octet-stream",
            bucket_name=SUPABASE_STORAGE_BUCKET,
        )

        # Get public URL
        public_url = get_public_url(
            file_path=filepath,
            bucket_name=SUPABASE_STORAGE_BUCKET,
        )

        response_data.append({
            "src": public_url,
            "name": filename,
            "type": "image"
        })

    return {
        "data": response_data
    }