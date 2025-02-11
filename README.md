# Perception Entrance Template

A minimal, customizable entrance mechanism featuring draggable alignment of two fields to reveal content. This template provides a unique and interactive way to enter a website.

https://github.com/user-attachments/assets/8a9f0923-2c40-485b-9de0-110254269c79

## Features

- Draggable fields with smooth animations and inertia
- Blur effects that respond to alignment
- Customizable ASCII art or content
- Mobile-responsive design
- Simple entrance animation sequence
- Subtle floating animation for unaligned fields
- Precise alignment detection and snapping
- Smooth transitions between states

## Dependencies

- GSAP (3.12.5 or later)
- GSAP Draggable plugin


- GSAP ScrollTrigger plugin (if adding scroll animations)

## Quick Start

1. Clone this repository
2. Replace the ASCII art in `index.html` with your own content
3. Customize colors and styles in `css/styles.css`
4. Modify the entrance sequence in `js/perception.js` if needed

## Customization

### Changing the Art

Replace the content in the `.perception-field` divs in `index.html`:

```html
<div class="perception-field perception-left">
  <div class="content">
    /* Your ASCII art here */
  </div>
</div>
```

Important considerations:
- Keep ASCII art similar in size between left and right fields
- Test on mobile to ensure art is readable when scaled
- Use monospace font for consistent spacing

### Adjusting Colors

Modify the theme variables in `css/styles.css`:

```css
:root {
  --bg-color: #080808;
  --text-color: #ffffff;
  --accent-color: rgba(255,255,255,0.2);
}
```

### Modifying Behavior

Key constants in `js/perception.js`:

```javascript
const SCALE = 0.3;              // Base scale of fields
const DRAG_SCALE = 0.33;        // Scale while dragging
const ALIGNMENT_THRESHOLD = 120; // Distance for snap alignment
const BLUR_AMOUNT = "2px";      // Blur effect amount
```

### Animation Timing

Customize animation durations in the following functions:
- `maybeSnapToMidpoint()`: Alignment animation
- `setupEnterButton()`: Entrance sequence
- `checkIfStillAligned()`: Unalignment behavior

## Core Mechanism

1. Two draggable fields are positioned randomly
2. Fields have subtle floating animation when not aligned
3. User drags fields to align them
4. When alignment threshold is met:
   - Fields snap to perfect alignment
   - Blur effect is applied
   - Enter button appears with fade-in
5. Clicking enter triggers the entrance sequence:
   - Fields fade out
   - Welcome message appears briefly
   - Main content is revealed

## Mobile Considerations

- Fields scale appropriately on smaller screens
- Touch events are properly handled
- ASCII art remains readable at small scales
- Alignment threshold adapts to screen size
- Blur effects are mobile-friendly

## Troubleshooting

Common issues and solutions:

1. **Fields not draggable**
   - Ensure GSAP and Draggable plugin are loaded
   - Check console for script loading errors
   - Verify element class names match selectors

2. **Alignment not working**
   - Check ALIGNMENT_THRESHOLD value
   - Verify getBoundingClientRect calculations
   - Ensure fields are properly centered

3. **Mobile display issues**
   - Adjust font-size clamp values in CSS
   - Test different ASCII art sizes
   - Verify viewport meta tag is present

4. **Animation glitches**
   - Check for CSS transform conflicts
   - Verify GSAP timeline sequencing
   - Ensure proper state management

## Advanced Customization

### Adding Scroll Animations

```javascript
// Requires GSAP ScrollTrigger plugin
ScrollTrigger.create({
  trigger: ".hidden-content",
  start: "top center",
  animation: gsap.from(".hidden-content", {
    y: 50,
    opacity: 0,
    duration: 1
  })
});
```

### Custom Enter Sequence

Modify the `setupEnterButton()` function to add or modify animation steps:

```javascript
tl.to(element, {
  customProperty: value,
  duration: time,
  ease: "power2.inOut"
})
.to(nextElement, {}, "<");
```

## License

MIT License - Feel free to use and modify for your projects.

## Contributing

Feel free to submit issues and enhancement requests. 
