import os
import subprocess
import sys

def create_directories():
    """Create necessary project directories"""
    dirs = [
        'models',
        'models/vqgan_imagenet_f16_16384',
        'models/vqgan_imagenet_f16_16384/checkpoints',
        'models/vqgan_imagenet_f16_16384/configs',
        'src',
        'fastapi_app',
        'web_app'
    ]
    for dir_path in dirs:
        os.makedirs(dir_path, exist_ok=True)
        print(f"Created directory: {dir_path}")

def check_npm_dependencies():
    """Check and install required npm packages"""
    try:
        # Check if concurrently is installed globally
        result = subprocess.run(['npm', 'list', '-g', 'concurrently'], capture_output=True, text=True)
        if 'concurrently' not in result.stdout:
            print("Installing concurrently globally...")
            subprocess.run(['npm', 'install', '-g', 'concurrently'], check=True)
        
        # Install project dependencies
        os.chdir('web_app')
        print("Installing project dependencies...")
        subprocess.run(['npm', 'install'], check=True)
        os.chdir('..')
        
    except subprocess.CalledProcessError:
        print("Error: Failed to install npm dependencies")
        print("Please run: npm install -g concurrently")
        print("Then cd into web_app and run: npm install")
        sys.exit(1)

def check_python_dependencies():
    """Check and install required Python packages"""
    try:
        subprocess.run(['pip', 'install', '-r', 'requirements.txt'], check=True)
    except subprocess.CalledProcessError:
        print("Error: Failed to install Python dependencies")
        print("Please run: pip install -r requirements.txt")
        sys.exit(1)

def check_model_files():
    """Check if model files exist in the correct location"""
    required_files = [
        'models/vqgan_imagenet_f16_16384/checkpoints/last.ckpt',
        'models/vqgan_imagenet_f16_16384/configs/model.yaml'
    ]
    
    missing_files = [f for f in required_files if not os.path.exists(f)]
    
    if missing_files:
        print("\nWARNING: Missing model files:")
        for file in missing_files:
            print(f" - {file}")
        print("\nPlease copy the model files from your Jupyter notebook output to the appropriate directories.")
        print("The model files should be organized as follows:")
        print("""
models/vqgan_imagenet_f16_16384/
├── checkpoints/
│   └── last.ckpt
└── configs/
    └── model.yaml
        """)

def main():
    print("Setting up Text to Image Generation Web App...")
    
    # Create directory structure
    create_directories()
    
    # Check dependencies
    print("\nChecking Python dependencies...")
    check_python_dependencies()
    
    print("\nChecking npm dependencies...")
    check_npm_dependencies()
    
    # Check model files
    print("\nChecking model files...")
    check_model_files()
    
    print("\nSetup complete!")
    print("""
To start the application:

1. Make sure model files are in place
2. Run the backend:
   cd fastapi_app
   uvicorn main:app --reload --port 8000

3. In a new terminal, run the frontend:
   cd web_app
   npm run dev

Or run both simultaneously:
   cd web_app
   npm run start
    """)

if __name__ == "__main__":
    main()
