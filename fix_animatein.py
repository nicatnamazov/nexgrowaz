import re

with open("src/components/AnimateIn.tsx", "r") as f:
    content = f.read()

# Easing
content = content.replace("const EASE_REVEAL = [0.44, 0, 0.56, 1] as const;", "const EASE_REVEAL = [0.25, 0.1, 0.25, 1] as const; // Faster ease-out")

# Movement distance
content = content.replace("y: prefersReduced ? 0 : 44", "y: prefersReduced ? 0 : 20")
content = content.replace("y: prefersReduced ? 0 : -44", "y: prefersReduced ? 0 : -20")
content = content.replace("x: prefersReduced ? 0 : 52", "x: prefersReduced ? 0 : 20")
content = content.replace("x: prefersReduced ? 0 : -52", "x: prefersReduced ? 0 : -20")

# Scale and blur
content = content.replace('filter: prefersReduced ? "none" : "blur(4px)"', 'filter: prefersReduced ? "none" : "blur(2px)"')
content = content.replace("scale: prefersReduced ? 1 : 0.98", "scale: 1")
content = content.replace('scale: 1 }', '}') # fix whileInView

# Viewport
content = content.replace('viewport={{ once: true, margin: "-4%" }}', 'viewport={{ once: true, margin: "0px" }}')

# Duration
content = content.replace("duration: prefersReduced ? 0 : 0.8", "duration: prefersReduced ? 0 : 0.3")

with open("src/components/AnimateIn.tsx", "w") as f:
    f.write(content)
