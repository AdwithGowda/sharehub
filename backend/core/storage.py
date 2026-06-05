import cloudinary
import cloudinary.uploader
from django.core.files.storage import Storage
from django.conf import settings

class CloudinaryStorage(Storage):
    def __init__(self, **kwargs):
        # Configure Cloudinary settings
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )

    def _open(self, name, mode='rb'):
        raise NotImplementedError("This storage does not support opening files.")

    def _save(self, name, content):
        # Upload the file directly to Cloudinary
        upload_data = cloudinary.uploader.upload(content)
        # Return the secure URL from Cloudinary to store in the database
        return upload_data.get('secure_url')

    def url(self, name):
        # Return the URL name directly if it is already a full remote URL
        if name and (name.startswith('http://') or name.startswith('https://')):
            return name
        return name

    def exists(self, name):
        return False

    def get_available_name(self, name, max_length=None):
        return name
