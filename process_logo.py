from PIL import Image
import math

def main():
    try:
        # Load the original logo image (the one with the correct man's proportions)
        img = Image.open('logo/logo_artmagadon_original.png').convert('RGBA')
        width, height = img.size
        new_img = Image.new('RGBA', (width, height))
        
        cx, cy = width // 2, height // 2
        # The Vitruvian circle border in the original drawing starts around R=172-173 px.
        # By setting crop_radius to 171.0 px, we crop EXACTLY inside the circle outline.
        # This completely removes the nated/drawn circle border, the square, and the text.
        # Only the man's body, hands, and feet remain, stretching to the very edge of the cropped area.
        crop_radius = 171.0
        
        for x in range(width):
            for y in range(height):
                dx = x - cx
                dy = y - cy
                dist = math.sqrt(dx*dx + dy*dy)
                
                # If outside the crop radius, make it transparent
                if dist > crop_radius:
                    new_img.putpixel((x, y), (0, 0, 0, 0))
                    continue
                
                r, g, b, a = img.getpixel((x, y))
                # Calculate grayscale brightness
                brightness = int(0.299*r + 0.587*g + 0.114*b)
                
                if brightness < 45: # Drawing pixels (original man's outline) -> Make it white
                    new_img.putpixel((x, y), (255, 255, 255, 255))
                else:
                    # Background inside -> Make it transparent
                    new_img.putpixel((x, y), (0, 0, 0, 0))
                    
        # Save as transparent PNG (v3 to break browser cache)
        new_img.save('logo/logo_artmagadon_v3.png', 'PNG')
        print("Original logo processed successfully! Circular outline, square, and text removed. Saved as logo/logo_artmagadon_v3.png")
    except Exception as e:
        print(f"Error processing logo: {e}")

if __name__ == "__main__":
    main()
