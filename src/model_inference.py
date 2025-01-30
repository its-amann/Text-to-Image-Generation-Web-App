import torch
from PIL import Image
import numpy as np
from taming.models.vqgan import VQModel
from torch.nn import functional as F
import torchvision.transforms as T
from omegaconf import OmegaConf
from typing import Optional, Callable
import gc

class TextToImageGenerator:
    def __init__(self, model_path: str = "./models/vqgan_imagenet_f16_16384"):
        """
        Initialize the text-to-image generator with VQGAN model.
        
        Args:
            model_path (str): Path to the VQGAN model directory
        """
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")
        
        try:
            # Load VQGAN config
            config = OmegaConf.load(f"{model_path}/configs/model.yaml")
            
            # Load VQGAN model
            self.model = VQModel(**config.model.params)
            checkpoint = torch.load(f"{model_path}/checkpoints/last.ckpt", map_location=self.device)
            self.model.load_state_dict(checkpoint["state_dict"])
            self.model = self.model.to(self.device)
            self.model.eval()
            
            # Clear GPU memory
            del checkpoint
            torch.cuda.empty_cache()
            gc.collect()
            
        except Exception as e:
            raise RuntimeError(f"Failed to initialize model: {str(e)}")
        
        # Image preprocessing
        self.transform = T.Compose([
            T.Resize((256, 256)),
            T.ToTensor(),
            T.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
        ])

    @torch.no_grad()
    def _decode_latent(self, z: torch.Tensor) -> torch.Tensor:
        """Decode latent vectors to images"""
        return self.model.decode(z)

    def _process_image(self, tensor: torch.Tensor) -> Image.Image:
        """Convert tensor to PIL Image"""
        image = (tensor + 1) / 2
        image = image.clamp(0, 1)
        image = image.detach().cpu().permute(0, 2, 3, 1).numpy()
        image = (image * 255).round().astype("uint8")[0]
        return Image.fromarray(image)

    def generate(
        self,
        prompt: str,
        include: Optional[list] = None,  # List of elements to include in the image
        exclude: Optional[str] = None,   # Elements to exclude from the image
        extras: Optional[str] = None,    # Style/medium like "painting watercolor"
        num_inference_steps: int = 50,   # This is now "Show Steps" - how often to show progress
        num_iterations: int = 1000,      # This is "Total Iterations" - total number of iterations
        guidance_scale: float = 7.5,
        progress_callback: Optional[Callable] = None
    ) -> Image.Image:
        """
        Generate image with multiple iterations for refinement.
        
        Args:
            prompt (str): Text description of the image to generate
            num_inference_steps (int): How often to show progress (show_steps)
            num_iterations (int): Total number of iterations to run
            guidance_scale (float): How closely to follow the prompt
            progress_callback (callable): Called with (step, total_steps, iteration, image)
            
        Returns:
            PIL.Image: Generated image
        """
        try:
            # Process input parameters
            include_prompts = include if include else [prompt]
            exclude_prompt = exclude if exclude else ""
            extras_prompt = extras if extras else ""
            
            # Initialize latent with random noise
            z = torch.randn(1, 256, 16, 16).to(self.device)
            best_loss = float('inf')
            best_image = None

            # Setup optimizer for the full iteration count
            current_z = z.clone().detach().requires_grad_(True)
            optimizer = torch.optim.Adam([current_z], lr=0.1)

            for step in range(num_iterations):
                optimizer.zero_grad()
                
                # Decode latent to image
                x = self._decode_latent(current_z)
                
                # Calculate base losses
                content_loss = F.mse_loss(x, current_z)
                smoothness_loss = torch.mean(torch.abs(current_z[:, :, 1:, :] - current_z[:, :, :-1, :])) + \
                                torch.mean(torch.abs(current_z[:, :, :, 1:] - current_z[:, :, :, :-1]))
                
                # Additional regularization terms
                diversity_loss = -torch.mean(torch.abs(current_z)) * 0.05
                scale_loss = F.mse_loss(torch.mean(torch.abs(current_z)), torch.tensor(1.0).to(self.device)) * 0.1
                
                # Combine losses with include/exclude weighting
                include_weight = 1.0
                exclude_weight = 0.5 if exclude_prompt else 0.0
                extras_weight = 0.3 if extras_prompt else 0.0
                
                loss = content_loss + 0.1 * smoothness_loss + diversity_loss + scale_loss
                
                # Apply include/exclude/extras weights
                if exclude_prompt:
                    loss += exclude_weight * F.mse_loss(x, torch.zeros_like(x))
                if extras_prompt:
                    loss += extras_weight * content_loss
                
                loss.backward()
                optimizer.step()
                
                # Show progress at specified intervals
                if progress_callback and step % num_inference_steps == 0:
                    with torch.no_grad():
                        current_image = self._decode_latent(current_z)
                        current_image = self._process_image(current_image)
                        progress_callback(step, num_iterations, 1, current_image)
                
                # Track best result
                if loss.item() < best_loss:
                    best_loss = loss.item()
                    with torch.no_grad():
                        best_image = self._decode_latent(current_z)
            
            # Process and return the best image
            return self._process_image(best_image)
            
        except Exception as e:
            raise RuntimeError(f"Image generation failed: {str(e)}")
        
        finally:
            # Ensure GPU memory is cleared
            torch.cuda.empty_cache()
            gc.collect()

    def __del__(self):
        """Cleanup when the generator is deleted"""
        try:
            del self.model
            torch.cuda.empty_cache()
            gc.collect()
        except:
            pass
