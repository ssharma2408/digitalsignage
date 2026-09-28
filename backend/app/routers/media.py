import os
import uuid
from typing import List, Optional

from fastapi import APIRouter, UploadFile, File, HTTPException

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

    # Make sure upload directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)

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

        filepath = os.path.join(
            UPLOAD_DIR,
            filename
        )

        # Read file
        contents = await uploaded_file.read()

        # Save file
        with open(filepath, "wb") as buffer:
            buffer.write(contents)

        # Public URL
        image_url = (
            f"http://127.0.0.1:8000/"
            f"uploads/images/{filename}"
        )

        response_data.append({
            "src": image_url,
            "name": filename,
            "type": "image"
        })

    return {
        "data": response_data
    }