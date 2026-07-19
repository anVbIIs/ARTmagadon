import os
import sys
from PIL import Image

def optimize_image(src_path, dest_path, max_dim=1600, quality=80):
    try:
        with Image.open(src_path) as img:
            # Convert RGBA to RGB if saving as JPEG
            if img.mode in ('RGBA', 'LA') and dest_path.endswith('.jpg'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1])
                img = background
            
            # Calculate new size
            w, h = img.size
            if max(w, h) > max_dim:
                if w > h:
                    new_w = max_dim
                    new_h = int(h * (max_dim / w))
                else:
                    new_h = max_dim
                    new_w = int(w * (max_dim / h))
                img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                print(f"Resized {os.path.basename(src_path)} from {w}x{h} to {new_w}x{new_h}")
            
            # Save optimized
            img.save(dest_path, optimize=True, quality=quality)
            print(f"Saved optimized image to {dest_path} (Size: {os.path.getsize(dest_path) / 1024:.1f} KB)")
            return True
    except Exception as e:
        print(f"Error optimizing {src_path}: {e}")
        return False

def main():
    print("Starting image optimization...")
    
    # 1. Optimize backgrounds in 'tła/'
    bg_dir = "tła"
    bg_images = {
        "Mural Agaty.jpg": "mural_agaty.webp",
        "Mural Agnieszki.jpg": "mural_agnieszki.webp",
        "Mural do obrócenia Agaty.jpg": "mural_do_obrocenia_agaty.webp"
    }
    
    if os.path.exists(bg_dir):
        for src, dest in bg_images.items():
            src_path = os.path.join(bg_dir, src)
            dest_path = os.path.join(bg_dir, dest)
            if os.path.exists(src_path):
                optimize_image(src_path, dest_path, max_dim=1920, quality=85)
            else:
                print(f"Source file not found: {src_path}")
    
    # 2. Optimize user murals in 'wolne projekty na murale/'
    projects_dir = "wolne projekty na murale"
    if os.path.exists(projects_dir):
        for filename in os.listdir(projects_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                # We skip optimized WebP files if they are already processed
                if filename.endswith('_opt.webp'):
                    continue
                src_path = os.path.join(projects_dir, filename)
                name_part, _ = os.path.splitext(filename)
                dest_filename = f"{name_part}_opt.webp"
                dest_path = os.path.join(projects_dir, dest_filename)
                optimize_image(src_path, dest_path, max_dim=1200, quality=80)
    else:
        print(f"Directory '{projects_dir}' not found.")

if __name__ == "__main__":
    main()
