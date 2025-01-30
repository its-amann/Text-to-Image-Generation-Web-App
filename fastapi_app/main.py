import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import base64
from io import BytesIO
from src.model_inference import TextToImageGenerator
import json
from typing import Optional
from fastapi.responses import StreamingResponse, JSONResponse
import time
import asyncio
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI(
    title="Text to Image API",
    description="AI Image Generation API using multi-modal LLM",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Gzip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Initialize model
generator = TextToImageGenerator()

class GenerationRequest(BaseModel):
    prompt: str = Field(..., 
        description="Text prompt describing the image to generate",
        min_length=1
    )
    include: list[str] = Field(
        default=[],
        description="Additional elements to include in the image"
    )
    exclude: str = Field(
        default="",
        description="Elements to exclude from the image"
    )
    extras: str = Field(
        default="",
        description="Style/medium like 'watercolor painting'"
    )
    num_steps: int = Field(
        default=50,
        description="Number of denoising steps",
        ge=1
    )
    num_iterations: int = Field(
        default=1000,
        description="Number of iterations to refine the image",
        ge=1
    )
    guidance_scale: float = Field(
        default=7.5,
        description="How closely to follow the prompt",
        ge=1.0,
        le=20.0
    )

def encode_image(image):
    """Convert PIL Image to base64 string"""
    try:
        buffered = BytesIO()
        image.save(buffered, format="PNG", optimize=True, quality=85)
        return base64.b64encode(buffered.getvalue()).decode()
    except Exception as e:
        print(f"Error encoding image: {str(e)}")
        return None

async def generate_stream(prompt: str, include: list[str], exclude: str, extras: str, 
                        num_steps: int, num_iterations: int, guidance_scale: float):
    """Stream generation progress with error handling and rate limiting"""
    
    async def send_update(data):
        try:
            return json.dumps(data) + "\n"
        except Exception as e:
            print(f"Error sending update: {str(e)}")
            return json.dumps({"type": "error", "message": "Error sending update"}) + "\n"

    def progress_callback(step, total_steps, iteration, image):
        image_base64 = encode_image(image)
        if image_base64:
            progress = {
                "type": "progress",
                "step": step,
                "total_steps": total_steps,
                "iteration": iteration,
                "image": image_base64,
                "timestamp": time.time()
            }
            return progress
        return None
    
    try:
        # Generate the image with multiple iterations
        final_image = await asyncio.to_thread(
            generator.generate,
            prompt=prompt,
            include=include,
            exclude=exclude,
            extras=extras,
            num_inference_steps=num_steps,
            num_iterations=num_iterations,
            guidance_scale=guidance_scale,
            progress_callback=progress_callback
        )
        
        if final_image:
            final_base64 = encode_image(final_image)
            if final_base64:
                yield await send_update({
                    "type": "complete",
                    "image": final_base64,
                    "timestamp": time.time()
                })
            else:
                yield await send_update({
                    "type": "error",
                    "message": "Failed to encode final image"
                })
        else:
            yield await send_update({
                "type": "error",
                "message": "Image generation failed"
            })
            
    except Exception as e:
        print(f"Generation error: {str(e)}")
        yield await send_update({
            "type": "error",
            "message": f"Generation failed: {str(e)}"
        })

@app.post("/generate_image")
async def generate_image(request: GenerationRequest):
    """
    Generate an image from a text prompt with progress updates
    """
    if not request.prompt.strip():
        raise HTTPException(
            status_code=400,
            detail="Prompt cannot be empty or just whitespace"
        )
        
    try:
        return StreamingResponse(
            generate_stream(
                prompt=request.prompt,
                include=request.include,
                exclude=request.exclude,
                extras=request.extras,
                num_steps=request.num_steps,
                num_iterations=request.num_iterations,
                guidance_scale=request.guidance_scale
            ),
            media_type="application/x-ndjson"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Generation failed: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """
    Check API health and model status
    """
    try:
        return {
            "status": "healthy",
            "model_loaded": True,
            "timestamp": time.time(),
            "version": "1.0.0"
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": time.time()
            }
        )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "error": str(exc),
            "type": type(exc).__name__,
            "timestamp": time.time()
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
