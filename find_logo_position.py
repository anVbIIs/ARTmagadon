from PIL import Image

def main():
    try:
        # Load the screenshot
        img = Image.open('screenshot_stitch.png').convert('L')
        width, height = img.size
        print(f"Screenshot size: {width}x{height}")
        
        # We know the logo is horizontally centered, so X is around width // 2 (1280)
        cx = width // 2
        
        # Scan along the center vertical line (and slightly offset lines) for bright pixels
        # corresponding to the logo border
        y_coords = []
        for y in range(0, min(3000, height)):
            val = img.getpixel((cx, y))
            # If we find a bright pixel (white logo border/drawing)
            if val > 200:
                y_coords.append(y)
                
        # Group contiguous y-coordinates to find the active logo region
        if not y_coords:
            print("No white pixels found along the center line. Let's try scanning X in range [1270, 1290]")
            for y in range(0, min(3000, height)):
                for x in range(cx - 20, cx + 20):
                    if img.getpixel((x, y)) > 200:
                        y_coords.append(y)
                        break
                        
        if y_coords:
            # Find the min and max Y for the contiguous block in the upper hero section
            # (which should be the first block of white pixels)
            blocks = []
            current_block = [y_coords[0]]
            for y in y_coords[1:]:
                if y - current_block[-1] <= 10:
                    current_block.append(y)
                else:
                    blocks.append(current_block)
                    current_block = [y]
            blocks.append(current_block)
            
            print("Found active vertical blocks of white pixels in center:")
            for idx, block in enumerate(blocks):
                min_y, max_y = block[0], block[-1]
                height_block = max_y - min_y
                print(f"Block {idx+1}: Y={min_y} to Y={max_y} (height={height_block})")
                
        else:
            print("Could not find any logo pixels near the center.")
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
