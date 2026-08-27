# PranPriyaPurchase — Premium Editorial Redesign Specification

## Current Codebase Analysis

**Framework**: Vanilla HTML/CSS/JS with Three.js + GSAP
- **Strengths**: Performant, already has 3D capabilities, smooth animations
- **Current Stack Can Support**: All required interactions - cursor effects, scroll parallax, 3D bead animations
- **Recommendation**: Evolve current codebase, don't rebuild. Stack is perfect for requirements.

**Current Typography**: Playfair Display + Inter (close to target, needs refinement to Fraunces/Outfit)
**Current 3D**: Three.js with floating beads, canvas-based scenes
**Current Animation**: GSAP with ScrollTrigger (perfect for premium interactions)

---

## Requirements Specification

### Brand Positioning
- **From**: Colorful craft-fair aesthetic
- **To**: Premium editorial jewelry brand (level of nish-s-pipe-studio.vercel.app)
- **Unique Value**: Hand-rolled paper beads, Instagram-native, one-of-a-kind pieces
- **Target**: Instagram bio traffic (mobile-first)

### Typography System
- **Headlines/Wordmark**: Fraunces (Google Font) - editorial serif
- **Body/Navigation**: Outfit (Google Font) - clean sans-serif  
- **Hero Scale**: Keep bold "Handcrafted with Love" but tighten line-height/letter-spacing for couture feel

### Color Palette (Restrained Application)
- **Primary Text/Dark Sections**: `#784563` (deep plum)
- **Base Background**: `#FAF6F0` (warm ivory/parchment - paper reference)
- **Primary Accent**: `#E5B646` (gold - CTAs, highlights, jewel details)
- **Secondary Accent**: `#E75964` (coral - badges, hover glows, sparingly)
- **3D Elements Only**: `#FA863E` (orange), `#63AAB8` (teal) - reserved for floating beads

### Motion & Interaction Requirements
- **Hero Beads**: Cursor-reactive parallax + scroll response (light-catching effect)
- **Scroll Reveals**: Staggered fade/slide with generous easing (no linear motion)
- **Custom Cursor**: Small bead/dot, scales on hover (desktop only)
- **Product Images**: Soft shadows, subtle zoom-on-hover
- **Transitions**: Smooth section transitions, no abrupt cuts

### Performance Constraints
- **Mobile-First**: Instagram bio traffic primary
- **3D Throttling**: Simplify/reduce motion below certain width/performance thresholds
- **Loading**: Keep existing elegant loading screen concept

---

## Design System Specification

### Layout Structure

#### Navigation
- **Behavior**: Sticky with glass/blur effect on scroll
- **Links**: Home | Necklaces | Keychains | Contact (keep current)
- **Logo**: Refined typography, deep plum on ivory

#### Hero Section
- **Background**: Drop full-bleed gradient → ivory/plum base
- **3D Elements**: Handful of large, softly out-of-focus bead spheres with paper-grain texture
- **Arrangement**: Intentional placement, not scattered
- **Typography**: "Handcrafted with Love" - refined spacing
- **CTAs**: Pill buttons - outline default, gold fill on hover

#### Instagram Integration
- **New Section**: "As seen on Instagram" 
- **Content**: Grid of recent post thumbnails → @pranpriyapurchase
- **Purpose**: Signal active, real studio

#### Product Sections
- **Layout**: Large photography-led cards with generous whitespace
- **Interaction**: Hover reveal for price/details (not always visible)
- **Photography**: Soft shadows, subtle zoom-on-hover

#### Custom Order Process
- **Treatment**: Considered service presentation
- **Structure**: 3-step visual (describe → we craft → you receive) → CTA
- **Not**: Just a button

#### Footer
- **Contact**: Instagram + WhatsApp for orders
- **Trust Line**: "Handmade in Surat, ships across India"

### Interaction Specifications

#### Custom Cursor (Desktop Only)
- **Appearance**: Small bead/dot matching brand colors
- **Behavior**: Scale transform on interactive element hover
- **Fallback**: Standard cursor on mobile/touch

#### Hero Bead System
- **Count**: 3-5 large spheres (not 50+ small ones)
- **Texture**: Subtle paper-grain, not glossy CSS
- **Physics**: Cursor parallax + scroll-driven rotation/position
- **Performance**: Reduce to static/minimal animation on mobile

#### Scroll Animations
- **Principle**: Generous easing, staggered reveals
- **Timing**: No linear or robotic motion
- **Sections**: Each section fades/slides with intentional delay
- **Performance**: Reduce-motion media query support

---

## Technical Implementation Plan

### Phase 1: Foundation Refinement
1. **Typography Migration**
   - Replace Inter → Outfit
   - Replace Playfair Display → Fraunces  
   - Refine hero typography spacing

2. **Color System Update**
   - Update CSS custom properties
   - Remove gradient hero background
   - Apply restrained color usage

3. **Hero Background Redesign**
   - Reduce floating beads from 50 to 3-5 large spheres
   - Add paper-grain texture to bead materials
   - Implement cursor parallax system

### Phase 2: Premium Interactions
1. **Custom Cursor Implementation**
   - CSS cursor override
   - Scale animation on hover states
   - Desktop-only with proper feature detection

2. **Enhanced Scroll System**
   - Refine GSAP ScrollTrigger animations
   - Add staggered section reveals
   - Improve easing curves

3. **Product Card Enhancement**
   - Hover reveal system for pricing/details
   - Soft shadow implementation
   - Subtle zoom interactions

### Phase 3: Content Integration
1. **Instagram Feed Integration**
   - Instagram Basic Display API or static implementation
   - Grid layout for recent posts
   - Proper linking to @pranpriyapurchase

2. **Custom Order Process**
   - 3-step visual process design
   - Enhanced CTA treatment
   - Service positioning language

3. **Trust Signals**
   - Location/shipping information
   - Enhanced footer content

### Phase 4: Performance & Polish
1. **Mobile Optimization**
   - 3D simplification based on device capabilities
   - Touch interaction refinements
   - Performance throttling

2. **Accessibility**
   - Reduced motion support
   - Proper ARIA labels
   - Keyboard navigation

3. **Cross-browser Testing**
   - WebGL fallbacks
   - Animation fallbacks
   - Progressive enhancement

---

## Success Metrics

### Visual Quality
- [ ] Reads as premium/editorial (not craft-fair)
- [ ] Paper-bead material authenticity in 3D elements
- [ ] Refined typography hierarchy
- [ ] Restrained color application

### Interaction Quality
- [ ] Smooth cursor-reactive beads
- [ ] Generous, non-robotic animations
- [ ] Mobile performance maintained
- [ ] Instagram integration feels native

### Business Impact
- [ ] Higher perceived value
- [ ] Clear custom order process
- [ ] Strong Instagram integration
- [ ] Trust signals for shipping/location

---

## Technical Risks & Mitigations

### Risk: 3D Performance on Mobile
**Mitigation**: Implement device capability detection, progressive enhancement

### Risk: Instagram API Limitations  
**Mitigation**: Start with static grid, upgrade to API if needed

### Risk: Custom Cursor Accessibility
**Mitigation**: Desktop-only with proper fallbacks, respects system preferences

### Risk: Over-Animation
**Mitigation**: Respect prefers-reduced-motion, provide toggle if needed

---

## Next Steps

1. **Approval of Specification**
2. **Design System Implementation** (Typography, Colors, Basic Layout)
3. **3D Enhancement** (Refined bead system, cursor interactions)  
4. **Premium Interactions** (Scroll animations, hover states)
5. **Content Integration** (Instagram, custom order process)
6. **Performance Optimization** (Mobile, accessibility)
7. **Testing & Refinement**

**Estimated Timeline**: 2-3 development cycles for complete transformation

---

*This specification maintains the existing technical foundation while elevating the brand to premium editorial standards through refined typography, restrained color usage, and sophisticated interactions.*