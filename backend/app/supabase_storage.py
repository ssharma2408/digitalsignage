import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET")

if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL is not configured")

if not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY is not configured")

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
)


def upload_file(
    file_bytes: bytes,
    file_path: str,
    content_type: str,
    bucket_name: str = SUPABASE_STORAGE_BUCKET,
):
    """
    Upload a file to Supabase Storage.

    Example:
        file_path = "staff/photo.jpg"
    """

    response = supabase.storage.from_(bucket_name).upload(
        path=file_path,
        file=file_bytes,
        file_options={
            "content-type": content_type,
            "upsert": "true",
        },
    )

    return response


def get_public_url(
    file_path: str,
    bucket_name: str = SUPABASE_STORAGE_BUCKET,
):
    """
    Return the public URL of a file.
    """

    return supabase.storage.from_(bucket_name).get_public_url(
        file_path
    )


def delete_file(
    file_path: str,
    bucket_name: str = SUPABASE_STORAGE_BUCKET,
):
    """
    Delete a file from Supabase Storage.
    """

    return supabase.storage.from_(bucket_name).remove(
        [file_path]
    )