import React, { useCallback, useState } from "react";
import Cropper from "react-easy-crop";

function createImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));

        image.setAttribute("crossOrigin", "anonymous");
        image.src = url;
    });
}

async function getCroppedImg(
    imageSrc,
    pixelCrop,
    outputWidth = 1600,
    outputHeight = 900
) {
    const image = await createImage(imageSrc);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputWidth,
        outputHeight
    );

    return new Promise((resolve) => {
        canvas.toBlob(
            (blob) => {
                resolve(blob);
            },
            "image/jpeg",
            0.90
        );
    });
}

export default function ImageCropModal({
    image,
    onCancel,
    onComplete,
    aspect = 16 / 9,
}) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [processing, setProcessing] = useState(false);

    const onCropComplete = useCallback(
        (croppedArea, croppedAreaPixels) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );

    const handleCrop = async () => {
        if (!croppedAreaPixels) {
            return;
        }

        try {
            setProcessing(true);

            const croppedBlob = await getCroppedImg(
                image,
                croppedAreaPixels,
                1600,
                900
            );

            if (!croppedBlob) {
                throw new Error("Could not create cropped image");
            }

            onComplete(croppedBlob);
        } catch (error) {
            console.error("Crop error:", error);
            alert("Unable to crop image.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="crop-modal-overlay">
            <div className="crop-modal">

                <div className="crop-modal-header">
                    <h2>Crop Image</h2>

                    <button
                        type="button"
                        className="crop-close"
                        onClick={onCancel}
                    >
                        ×
                    </button>
                </div>

                <div className="crop-container">

                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />

                </div>

                <div className="crop-controls">

                    <label>
                        Zoom
                    </label>

                    <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={zoom}
                        onChange={(e) =>
                            setZoom(Number(e.target.value))
                        }
                    />

                </div>

                <div className="crop-modal-footer">

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={processing}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleCrop}
                        disabled={processing}
                    >
                        {processing ? "Processing..." : "Crop & Continue"}
                    </button>

                </div>

            </div>
        </div>
    );
}