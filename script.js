// Global variables
let heroScene, contactScene;
let heroRenderer, contactRenderer;
let heroCamera, contactCamera;
let isLoaded = false;
let animationId;
let customCursor;
let mouseX = 0, mouseY = 0;

// Performance monitoring
const performanceMonitor = {
    frameCount: 0,
    lastTime: performance.now(),
    fps: 60,
    
    update() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // Adjust quality based on performance
            this.adjustQuality();
        }
    },
    
    adjustQuality() {
        const isLowFPS = this.fps < 30;
        
        // Adjust renderer settings based on performance
        [heroRenderer, contactRenderer].forEach(renderer => {
            if (renderer) {
                renderer.setPixelRatio(isLowFPS ? Math.min(window.devicePixelRatio, 1.5) : window.devicePixelRatio);
            }
        });
    }
};

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    // Setup custom cursor first
    setupCustomCursor();
    
    // Hide loading screen after a delay
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
        document.body.classList.remove('no-scroll');
        isLoaded = true;
        
        // Initialize 3D scenes after loading with error handling
        try {
            initializeScenes();
            setupScrollAnimations();
            setupPremiumInteractions();
        } catch (error) {
            console.error('3D initialization failed:', error);
            // Fallback: hide canvases if 3D fails
            document.querySelectorAll('canvas').forEach(canvas => {
                canvas.style.display = 'none';
            });
        }
    }, 3000);
    
    // Add no-scroll class initially
    document.body.classList.add('no-scroll');
    
    // Setup navigation
    setupNavigation();
    
    // Setup performance monitoring
    setupPerformanceOptimizations();
});

// Custom Cursor System
function setupCustomCursor() {
    // Only setup custom cursor on desktop devices
    if (window.innerWidth > 768 && !('ontouchstart' in window)) {
        customCursor = document.createElement('div');
        customCursor.classList.add('custom-cursor');
        document.body.appendChild(customCursor);
        
        // Track mouse movement
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            if (customCursor) {
                customCursor.style.left = mouseX + 'px';
                customCursor.style.top = mouseY + 'px';
            }
        });
        
        // Handle hover states
        const interactiveElements = document.querySelectorAll('a, button, .info-card, .instagram-post, .gallery-canvas');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                if (customCursor) {
                    customCursor.classList.add('hover');
                }
            });
            
            element.addEventListener('mouseleave', () => {
                if (customCursor) {
                    customCursor.classList.remove('hover');
                }
            });
        });
        
        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            if (customCursor) {
                customCursor.style.opacity = '0';
            }
        });
        
        document.addEventListener('mouseenter', () => {
            if (customCursor) {
                customCursor.style.opacity = '1';
            }
        });
    } else {
        // Fallback for mobile/touch devices
        document.body.style.cursor = 'auto';
    }
}

// Navigation functionality
function setupNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
        
        // Animate hamburger menu
        const spans = navToggle.querySelectorAll('span');
        if (navLinks.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
            
            // Reset hamburger menu
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
    
    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
            
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Initialize all 3D scenes with error handling
function initializeScenes() {
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.warn('Three.js library not loaded');
        return;
    }
    
    // Check for WebGL support
    if (!isWebGLSupported()) {
        console.warn('WebGL not supported, falling back to static content');
        setupFallbackExperience();
        return;
    }
    
    try {
        initHeroScene();
        initContactScene();
        
        // Verify scenes were created
        if (!heroScene || !contactScene) {
            console.warn('Scene initialization incomplete');
            setupFallbackExperience();
            return;
        }
        
        // Start animation loop
        animate();
    } catch (error) {
        console.error('3D initialization failed:', error);
        setupFallbackExperience();
    }
}

// Check WebGL support
function isWebGLSupported() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!(window.WebGLRenderingContext && gl);
    } catch (e) {
        return false;
    }
}

// Fallback experience for unsupported browsers
function setupFallbackExperience() {
    // Only hide canvases that haven't been initialized, don't replace them
    const heroCanvas = document.getElementById('hero-canvas');
    const contactCanvas = document.getElementById('contact-canvas');
    
    if (heroCanvas && !heroScene) {
        heroCanvas.style.display = 'none';
    }
    
    if (contactCanvas && !contactScene) {
        contactCanvas.style.display = 'none';
    }
    
    // Log that we're using fallback (don't show intrusive message)
    console.log('3D features disabled - browser does not support WebGL or initialization failed');
}

// Add initialization call to the preload function
function preloadResources() {
    // Preload Google Fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap';
    fontLink.as = 'style';
    fontLink.onload = function() { this.onload = null; this.rel = 'stylesheet'; };
    document.head.appendChild(fontLink);
    
    // Preload critical scripts
    const scripts = [
        'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js'
    ];
    
    scripts.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = src;
        link.as = 'script';
        document.head.appendChild(link);
    });
}

// Call preload on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadResources);
} else {
    preloadResources();
}

// Premium Hero Scene with intentional bead placement
function initHeroScene() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    
    // Scene setup
    heroScene = new THREE.Scene();
    heroCamera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    heroRenderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true, 
        alpha: true 
    });
    
    heroRenderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    heroRenderer.setClearColor(0x000000, 0);
    heroRenderer.shadowMap.enabled = true;
    heroRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Premium lighting setup
    const ambientLight = new THREE.AmbientLight(0xFAF6F0, 0.4);
    heroScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xE5B646, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    heroScene.add(directionalLight);
    
    const pointLight1 = new THREE.PointLight(0xE75964, 0.6);
    pointLight1.position.set(-8, 5, 3);
    heroScene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x63AAB8, 0.4);
    pointLight2.position.set(8, -5, 2);
    heroScene.add(pointLight2);
    
    // Create premium paper-grain beads (rose family only - max 2-3 beads)
    const beadConfigs = [
        { 
            position: { x: -5, y: 3, z: -4 }, 
            scale: 2.5, 
            color: 0xE75964, // Rose
            opacity: 0.25,
            speed: { rotation: 0.002, float: 0.0008 }
        },
        { 
            position: { x: 6, y: -3, z: -6 }, 
            scale: 3.0, 
            color: 0xFBE4E2, // Blush
            opacity: 0.3,
            speed: { rotation: 0.0015, float: 0.001 }
        },
        { 
            position: { x: 0, y: 0, z: -8 }, 
            scale: 2.2, 
            color: 0xE75964, // Rose
            opacity: 0.2,
            speed: { rotation: 0.0025, float: 0.0012 }
        }
    ];
    
    beadConfigs.forEach((config, index) => {
        createPremiumBead(config, index);
    });
    
    heroCamera.position.z = 15;
    
    // Enhanced mouse parallax setup
    setupHeroParallax();
}

// Create premium paper-grain textured bead
function createPremiumBead(config, index) {
    const beadGeometry = new THREE.SphereGeometry(config.scale, 32, 32);
    
    // Paper-grain texture creation
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base color
    const color = new THREE.Color(config.color);
    ctx.fillStyle = `rgb(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)})`;
    ctx.fillRect(0, 0, 256, 256);
    
    // Paper grain effect
    for (let i = 0; i < 3000; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
    }
    
    for (let i = 0; i < 1000; i++) {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`;
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    
    const beadMaterial = new THREE.MeshPhongMaterial({ 
        map: texture,
        shininess: 20,
        specular: 0x222222,
        transparent: true,
        opacity: config.opacity || 0.3
    });
    
    const bead = new THREE.Mesh(beadGeometry, beadMaterial);
    bead.position.set(config.position.x, config.position.y, config.position.z);
    bead.castShadow = true;
    bead.receiveShadow = true;
    
    // Animation data - create proper Vector3 for original position
    const originalPosition = new THREE.Vector3(config.position.x, config.position.y, config.position.z);
    
    bead.userData = {
        rotationSpeed: config.speed.rotation,
        floatSpeed: config.speed.float,
        floatOffset: index * 1.2,
        originalPosition: originalPosition,
        parallaxIntensity: 0.3 + Math.random() * 0.4,
        scale: config.scale
    };
    
    heroScene.add(bead);
}

// Enhanced hero parallax with cursor interaction
function setupHeroParallax() {
    let targetMouseX = 0, targetMouseY = 0;
    let currentMouseX = 0, currentMouseY = 0;
    
    document.addEventListener('mousemove', (event) => {
        if (window.innerWidth > 768) {
            targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
            targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        }
    });
    
    // Smooth mouse interpolation and bead parallax
    function updateHeroParallax() {
        currentMouseX += (targetMouseX - currentMouseX) * 0.05;
        currentMouseY += (targetMouseY - currentMouseY) * 0.05;
        
        // Update camera position with subtle movement
        if (heroCamera) {
            heroCamera.position.x += (currentMouseX * 2 - heroCamera.position.x) * 0.05;
            heroCamera.position.y += (currentMouseY * 1.5 - heroCamera.position.y) * 0.05;
            heroCamera.lookAt(0, 0, 0);
        }
        
        // Update bead positions based on mouse
        if (heroScene) {
            heroScene.children.forEach(child => {
                if (child.userData && child.userData.parallaxIntensity) {
                    const parallaxX = currentMouseX * child.userData.parallaxIntensity;
                    const parallaxY = currentMouseY * child.userData.parallaxIntensity;
                    
                    child.position.x = child.userData.originalPosition.x + parallaxX;
                    child.position.y = child.userData.originalPosition.y + parallaxY;
                }
            });
        }
        
        requestAnimationFrame(updateHeroParallax);
    }
    
    updateHeroParallax();
}

// Necklaces Scene with interactive 3D product gallery
function initNecklacesScene() {
    const canvas = document.getElementById('necklaces-canvas');
    if (!canvas) return;
    
    // Scene setup
    necklacesScene = new THREE.Scene();
    necklacesCamera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    necklacesRenderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true 
    });
    
    necklacesRenderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    necklacesRenderer.setClearColor(0xFDF8F0);
    
    // Enhanced lighting for product showcase
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    necklacesScene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 5, 5);
    necklacesScene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-3, -3, 3);
    necklacesScene.add(directionalLight2);
    
    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(0, 10, 5);
    spotLight.target.position.set(0, 0, 0);
    necklacesScene.add(spotLight);
    necklacesScene.add(spotLight.target);
    
    // Create interactive necklace gallery
    createNecklaceGallery();
    
    necklacesCamera.position.set(0, 0, 12);
    
    // Add mouse interaction for necklaces scene
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Rotate camera around the scene based on mouse position
        const radius = 12;
        necklacesCamera.position.x = Math.sin(mouseX * 0.5) * radius;
        necklacesCamera.position.z = Math.cos(mouseX * 0.5) * radius;
        necklacesCamera.position.y = mouseY * 3;
        necklacesCamera.lookAt(0, 0, 0);
    });
}

// Create interactive 3D necklace gallery
function createNecklaceGallery() {
    const necklaceConfigs = [
        {
            name: "Golden Sun Necklace",
            colors: [0xE5B646, 0xFA863E, 0xD4A574],
            beadShapes: ['elongated', 'round'],
            pendant: 'sun',
            position: { x: -4, y: 2, z: 0 }
        },
        {
            name: "Turquoise & Pink Bracelets",
            colors: [0x63AAB8, 0xE75964, 0xC0C0C0],
            beadShapes: ['round', 'oval'],
            pendant: null,
            position: { x: 0, y: 1, z: 2 }
        },
        {
            name: "Blue Elegance Necklace",
            colors: [0x4682B4, 0x87CEEB, 0xD4A574],
            beadShapes: ['elongated', 'oval'],
            pendant: null,
            position: { x: 4, y: -1, z: 0 }
        },
        {
            name: "Rainbow Collection",
            colors: [0x784563, 0xE75964, 0xFA863E, 0xE5B646, 0x63AAB8],
            beadShapes: ['round', 'elongated', 'oval'],
            pendant: 'charm',
            position: { x: -2, y: -2, z: -1 }
        },
        {
            name: "Coral Dreams",
            colors: [0xE75964, 0xFF7F7F, 0xC0C0C0],
            beadShapes: ['round', 'oval'],
            pendant: 'heart',
            position: { x: 2, y: 0, z: -2 }
        }
    ];
    
    necklaceConfigs.forEach((config, index) => {
        createNecklacePiece(config, index);
    });
    
    // Add floating particle effects
    createNecklaceParticles();
}

// Create individual necklace piece
function createNecklacePiece(config, index) {
    const necklaceGroup = new THREE.Group();
    
    // Create necklace chain
    const radius = 1.5 + Math.random() * 0.5;
    const beadCount = 16 + Math.floor(Math.random() * 8);
    
    for (let i = 0; i < beadCount; i++) {
        const angle = (i / beadCount) * Math.PI * 2;
        const colorIndex = Math.floor(Math.random() * config.colors.length);
        const shapeType = config.beadShapes[Math.floor(Math.random() * config.beadShapes.length)];
        
        let beadGeometry;
        switch(shapeType) {
            case 'elongated':
                beadGeometry = new THREE.CylinderGeometry(0.08, 0.12, 0.3, 8);
                break;
            case 'oval':
                beadGeometry = new THREE.SphereGeometry(0.12, 8, 6);
                beadGeometry.scale(1, 0.7, 1);
                break;
            default: // round
                beadGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        }
        
        const beadMaterial = new THREE.MeshPhongMaterial({ 
            color: config.colors[colorIndex],
            shininess: 90,
            specular: 0x444444
        });
        
        const bead = new THREE.Mesh(beadGeometry, beadMaterial);
        bead.position.x = Math.cos(angle) * radius;
        bead.position.y = Math.sin(angle) * radius;
        bead.position.z = (Math.random() - 0.5) * 0.3;
        
        // Add slight rotation variation
        bead.rotation.x = Math.random() * Math.PI;
        bead.rotation.y = Math.random() * Math.PI;
        
        necklaceGroup.add(bead);
    }
    
    // Add pendant if specified
    if (config.pendant) {
        let pendantGeometry;
        let pendantMaterial;
        
        switch(config.pendant) {
            case 'sun':
                pendantGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 12);
                // Create sun rays
                for (let i = 0; i < 12; i++) {
                    const rayAngle = (i / 12) * Math.PI * 2;
                    const rayGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.02);
                    const ray = new THREE.Mesh(rayGeometry, new THREE.MeshPhongMaterial({ color: 0xE5B646 }));
                    ray.position.x = Math.cos(rayAngle) * 0.35;
                    ray.position.y = Math.sin(rayAngle) * 0.35 - radius;
                    ray.rotation.z = rayAngle;
                    necklaceGroup.add(ray);
                }
                pendantMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0xE5B646,
                    shininess: 100
                });
                break;
            case 'heart':
                pendantGeometry = new THREE.SphereGeometry(0.2, 8, 8);
                pendantMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0xE75964,
                    shininess: 80
                });
                break;
            default: // charm
                pendantGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.1);
                pendantMaterial = new THREE.MeshPhongMaterial({ 
                    color: config.colors[0],
                    shininess: 70
                });
        }
        
        const pendant = new THREE.Mesh(pendantGeometry, pendantMaterial);
        pendant.position.y = -radius - 0.4;
        necklaceGroup.add(pendant);
    }
    
    // Position the necklace
    necklaceGroup.position.copy(config.position);
    
    // Add animation data
    necklaceGroup.userData = { 
        rotationSpeed: 0.003 + Math.random() * 0.002,
        floatSpeed: 0.001 + Math.random() * 0.001,
        floatOffset: index * 0.5,
        originalY: config.position.y,
        hoverScale: 1,
        isHovered: false
    };
    
    necklacesScene.add(necklaceGroup);
}

// Create floating particles around necklaces
function createNecklaceParticles() {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 50;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const colorPalette = [
        { r: 0.47, g: 0.27, b: 0.39 }, // purple
        { r: 0.91, g: 0.35, b: 0.39 }, // coral
        { r: 0.98, g: 0.53, b: 0.24 }, // orange
        { r: 0.90, g: 0.71, b: 0.27 }, // gold
        { r: 0.39, g: 0.67, b: 0.72 }  // teal
    ];
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
        
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particles.userData = { rotationSpeed: 0.001 };
    necklacesScene.add(particles);
}

// Keychains Scene with character and bead keychains
function initKeychainsScene() {
    const canvas = document.getElementById('keychains-canvas');
    if (!canvas) return;
    
    // Scene setup
    keychainsScene = new THREE.Scene();
    keychainsCamera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    keychainsRenderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true 
    });
    
    keychainsRenderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    keychainsRenderer.setClearColor(0xF0F9FF);
    
    // Enhanced lighting for keychain showcase
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    keychainsScene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(3, 3, 3);
    keychainsScene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-2, -2, 2);
    keychainsScene.add(directionalLight2);
    
    const spotLight = new THREE.SpotLight(0xffffff, 0.6);
    spotLight.position.set(0, 5, 3);
    keychainsScene.add(spotLight);
    
    // Create diverse keychain models
    createKeychainGallery();
    
    keychainsCamera.position.set(0, 0, 10);
    
    // Add mouse interaction for keychains scene
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Orbit camera around the scene
        const radius = 10;
        keychainsCamera.position.x = Math.sin(mouseX * 0.3) * radius;
        keychainsCamera.position.z = Math.cos(mouseX * 0.3) * radius;
        keychainsCamera.position.y = mouseY * 2;
        keychainsCamera.lookAt(0, 0, 0);
    });
}

// Create diverse keychain gallery
function createKeychainGallery() {
    const keychainConfigs = [
        {
            type: 'frog_couple',
            name: 'Frog Love Keychains',
            colors: [0x32CD32, 0xFF0000], // green and red
            position: { x: -3, y: 1.5, z: 1 }
        },
        {
            type: 'cute_animal',
            name: 'Lion Cub Keychain',
            colors: [0xFFA500, 0xFFFFFF, 0xFF69B4], // orange, white, pink
            position: { x: 2, y: -1, z: 2 }
        },
        {
            type: 'bead_tassel',
            name: 'Colorful Bead Tassel',
            colors: [0x784563, 0xE75964, 0xFA863E],
            position: { x: 0, y: 2, z: -1 }
        },
        {
            type: 'charm_collection',
            name: 'Mixed Charm Set',
            colors: [0x63AAB8, 0xE5B646, 0xFFFFFF],
            position: { x: -2, y: -2, z: 0 }
        },
        {
            type: 'miniature_necklace',
            name: 'Mini Necklace Keychain',
            colors: [0xE75964, 0x63AAB8, 0xD4A574],
            position: { x: 3, y: 0.5, z: -2 }
        }
    ];
    
    keychainConfigs.forEach((config, index) => {
        createKeychainPiece(config, index);
    });
    
    // Add sparkle effects
    createKeychainSparkles();
}

// Create individual keychain piece based on type
function createKeychainPiece(config, index) {
    const keychainGroup = new THREE.Group();
    
    // Add key ring (common to all)
    const ringGeometry = new THREE.TorusGeometry(0.25, 0.04, 6, 12);
    const ringMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xC0C0C0,
        shininess: 100
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = 1.2;
    keychainGroup.add(ring);
    
    // Add chain links
    for (let i = 0; i < 3; i++) {
        const linkGeometry = new THREE.TorusGeometry(0.08, 0.02, 6, 8);
        const linkMaterial = new THREE.MeshPhongMaterial({ color: 0xC0C0C0 });
        const link = new THREE.Mesh(linkGeometry, linkMaterial);
        link.position.y = 1.0 - (i * 0.15);
        link.rotation.x = Math.PI / 2;
        keychainGroup.add(link);
    }
    
    // Create main charm based on type
    switch(config.type) {
        case 'frog_couple':
            createFrogCouple(keychainGroup, config.colors);
            break;
        case 'cute_animal':
            createCuteAnimal(keychainGroup, config.colors);
            break;
        case 'bead_tassel':
            createBeadTassel(keychainGroup, config.colors);
            break;
        case 'charm_collection':
            createCharmCollection(keychainGroup, config.colors);
            break;
        case 'miniature_necklace':
            createMiniatureNecklace(keychainGroup, config.colors);
            break;
    }
    
    // Position and add animation data
    keychainGroup.position.copy(config.position);
    keychainGroup.userData = {
        rotationSpeed: 0.005 + Math.random() * 0.003,
        floatSpeed: 0.002 + Math.random() * 0.002,
        floatOffset: index * 0.8,
        originalY: config.position.y,
        swingAmplitude: 0.3 + Math.random() * 0.2
    };
    
    keychainsScene.add(keychainGroup);
}

// Create frog couple charm
function createFrogCouple(group, colors) {
    // Left frog
    const leftFrogGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.3);
    const leftFrogMaterial = new THREE.MeshPhongMaterial({ color: colors[0] });
    const leftFrog = new THREE.Mesh(leftFrogGeometry, leftFrogMaterial);
    leftFrog.position.set(-0.3, 0.3, 0);
    group.add(leftFrog);
    
    // Right frog
    const rightFrog = new THREE.Mesh(leftFrogGeometry, leftFrogMaterial);
    rightFrog.position.set(0.3, 0.3, 0);
    group.add(rightFrog);
    
    // Shared heart
    const heartGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const heartMaterial = new THREE.MeshPhongMaterial({ color: colors[1] });
    const heart = new THREE.Mesh(heartGeometry, heartMaterial);
    heart.position.set(0, 0.5, 0.2);
    group.add(heart);
    
    // Eyes for frogs
    const eyeGeometry = new THREE.SphereGeometry(0.06, 6, 6);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    
    // Left frog eyes
    const leftEye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye1.position.set(-0.4, 0.4, 0.2);
    group.add(leftEye1);
    const leftEye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye2.position.set(-0.2, 0.4, 0.2);
    group.add(leftEye2);
    
    // Right frog eyes
    const rightEye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye1.position.set(0.2, 0.4, 0.2);
    group.add(rightEye1);
    const rightEye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye2.position.set(0.4, 0.4, 0.2);
    group.add(rightEye2);
}

// Create cute animal charm
function createCuteAnimal(group, colors) {
    // Main head
    const headGeometry = new THREE.SphereGeometry(0.3, 12, 12);
    const headMaterial = new THREE.MeshPhongMaterial({ color: colors[1] }); // white
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 0.3, 0);
    group.add(head);
    
    // Mane/decoration
    const maneGeometry = new THREE.ConeGeometry(0.35, 0.2, 8);
    const maneMaterial = new THREE.MeshPhongMaterial({ color: colors[0] }); // orange
    const mane = new THREE.Mesh(maneGeometry, maneMaterial);
    mane.position.set(0, 0.5, -0.1);
    mane.rotation.x = Math.PI;
    group.add(mane);
    
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08, 6, 6);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.12, 0.35, 0.25);
    group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.12, 0.35, 0.25);
    group.add(rightEye);
    
    // Ears
    const earGeometry = new THREE.ConeGeometry(0.08, 0.2, 6);
    const earMaterial = new THREE.MeshPhongMaterial({ color: colors[2] }); // pink
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.2, 0.5, 0);
    group.add(leftEar);
    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.2, 0.5, 0);
    group.add(rightEar);
}

// Create bead tassel
function createBeadTassel(group, colors) {
    const beadCount = 6;
    for (let i = 0; i < beadCount; i++) {
        const beadGeometry = new THREE.SphereGeometry(0.08 + Math.random() * 0.04, 8, 8);
        const beadMaterial = new THREE.MeshPhongMaterial({ 
            color: colors[i % colors.length],
            shininess: 90
        });
        const bead = new THREE.Mesh(beadGeometry, beadMaterial);
        bead.position.y = 0.5 - (i * 0.18);
        bead.position.x = (Math.random() - 0.5) * 0.1;
        bead.position.z = (Math.random() - 0.5) * 0.1;
        group.add(bead);
    }
}

// Create charm collection
function createCharmCollection(group, colors) {
    // Multiple small charms
    const charmTypes = ['cube', 'sphere', 'heart'];
    for (let i = 0; i < 3; i++) {
        let charmGeometry;
        switch(charmTypes[i]) {
            case 'cube':
                charmGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
                break;
            case 'sphere':
                charmGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                break;
            case 'heart':
                charmGeometry = new THREE.SphereGeometry(0.12, 8, 8);
                break;
        }
        
        const charmMaterial = new THREE.MeshPhongMaterial({ color: colors[i] });
        const charm = new THREE.Mesh(charmGeometry, charmMaterial);
        charm.position.set((i - 1) * 0.25, 0.2, 0);
        group.add(charm);
    }
}

// Create miniature necklace
function createMiniatureNecklace(group, colors) {
    const radius = 0.3;
    const beadCount = 8;
    
    for (let i = 0; i < beadCount; i++) {
        const angle = (i / beadCount) * Math.PI * 2;
        const beadGeometry = new THREE.SphereGeometry(0.06, 6, 6);
        const beadMaterial = new THREE.MeshPhongMaterial({ 
            color: colors[i % colors.length] 
        });
        const bead = new THREE.Mesh(beadGeometry, beadMaterial);
        bead.position.x = Math.cos(angle) * radius;
        bead.position.y = 0.3 + Math.sin(angle) * radius;
        group.add(bead);
    }
}

// Create sparkle effects
function createKeychainSparkles() {
    const sparkleGeometry = new THREE.BufferGeometry();
    const sparkleCount = 30;
    const positions = new Float32Array(sparkleCount * 3);
    
    for (let i = 0; i < sparkleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 12;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    
    sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const sparkleMaterial = new THREE.PointsMaterial({
        size: 0.08,
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
    sparkles.userData = { 
        rotationSpeed: 0.002,
        twinkleSpeed: 0.01
    };
    keychainsScene.add(sparkles);
}

// Contact Scene with particle effects
function initContactScene() {
    const canvas = document.getElementById('contact-canvas');
    if (!canvas) return;
    
    // Scene setup
    contactScene = new THREE.Scene();
    contactCamera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    contactRenderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true, 
        alpha: true 
    });
    
    contactRenderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    contactRenderer.setClearColor(0x000000, 0);
    
    // Create floating particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const colorPalette = [
        { r: 0.47, g: 0.27, b: 0.39 }, // purple
        { r: 0.91, g: 0.35, b: 0.39 }, // coral
        { r: 0.98, g: 0.53, b: 0.24 }, // orange
        { r: 0.90, g: 0.71, b: 0.27 }, // gold
        { r: 0.39, g: 0.67, b: 0.72 }  // teal
    ];
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    contactScene.add(particles);
    
    contactCamera.position.z = 10;
}

// Animation loop with performance optimization
function animate() {
    if (!isLoaded) return;
    
    animationId = requestAnimationFrame(animate);
    
    // Update performance monitor
    performanceMonitor.update();
    
    // Use time-based animation for consistency
    const currentTime = Date.now() * 0.001; // Convert to seconds
    
    // Animate hero scene with enhanced effects
    if (heroScene && heroRenderer && heroCamera) {
        heroScene.children.forEach((child, index) => {
            if (child.userData && child.userData.rotationSpeed) {
                child.rotation.x += child.userData.rotationSpeed;
                child.rotation.y += child.userData.rotationSpeed * 1.5;
                child.rotation.z += child.userData.rotationSpeed * 0.5;
                
                // Enhanced floating animation with wave motion
                const wave1 = Math.sin(currentTime * child.userData.floatSpeed + child.userData.floatOffset) * 0.5;
                const wave2 = Math.cos(currentTime * child.userData.floatSpeed * 0.7 + child.userData.floatOffset) * 0.3;
                child.position.y += (wave1 + wave2) * 0.01;
                
                // Add subtle scaling for breathing effect
                const breathe = 1 + Math.sin(currentTime * 0.5 + index) * 0.05;
                child.scale.setScalar(breathe);
            }
        });
        heroRenderer.render(heroScene, heroCamera);
    }
    
    // Animate contact scene with fluid particle motion
    if (contactScene && contactRenderer && contactCamera) {
        contactScene.children.forEach(child => {
            if (child.isPoints) {
                child.rotation.y += 0.002;
                child.rotation.x += 0.001;
                
                // Fluid particle motion
                const positions = child.geometry.attributes.position.array;
                for (let i = 0; i < positions.length; i += 3) {
                    const wave = Math.sin(currentTime * 0.5 + i * 0.001) * 0.01;
                    positions[i + 1] += wave;
                    
                    // Create spiral motion
                    const spiral = Math.sin(currentTime + i * 0.01) * 0.005;
                    positions[i] += spiral;
                    positions[i + 2] += Math.cos(currentTime + i * 0.01) * 0.005;
                }
                child.geometry.attributes.position.needsUpdate = true;
            }
        });
        contactRenderer.render(contactScene, contactCamera);
    }
}

// Setup performance optimizations
function setupPerformanceOptimizations() {
    // Throttle resize events
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 150);
    });
    
    // Pause animations when page is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        } else {
            animate();
        }
    });
    
    // Optimize for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        // Reduce particle counts and effects for mobile
        document.documentElement.style.setProperty('--mobile-optimization', 'true');
    }
    
    // Memory cleanup on page unload
    window.addEventListener('beforeunload', () => {
        // Dispose of Three.js resources
        [heroScene, contactScene].forEach(scene => {
            if (scene) {
                scene.traverse(child => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => material.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            }
        });
        
        [heroRenderer, contactRenderer].forEach(renderer => {
            if (renderer) {
                renderer.dispose();
            }
        });
    });
}

// Setup scroll animations using GSAP
function setupScrollAnimations() {
    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    // Animate section titles with stagger effect
    gsap.utils.toArray('.section-title').forEach((title, index) => {
        gsap.fromTo(title, 
            { opacity: 0, y: 80, scale: 0.8 },
            { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                duration: 1.2,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: title,
                    start: 'top 85%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
    
    // Animate section subtitles
    gsap.utils.toArray('.section-subtitle').forEach(subtitle => {
        gsap.fromTo(subtitle,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 0.3,
                scrollTrigger: {
                    trigger: subtitle,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
    
    // Animate info cards with enhanced effects
    gsap.utils.toArray('.info-card').forEach((card, index) => {
        gsap.fromTo(card,
            { opacity: 0, x: 100, rotationY: 15 },
            {
                opacity: 1,
                x: 0,
                rotationY: 0,
                duration: 1,
                delay: index * 0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
    
    // Animate gallery canvases
    gsap.utils.toArray('.gallery-canvas').forEach(canvas => {
        gsap.fromTo(canvas,
            { opacity: 0, scale: 0.8, rotationY: -10 },
            {
                opacity: 1,
                scale: 1,
                rotationY: 0,
                duration: 1.5,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: canvas,
                    start: 'top 70%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
    
    // Enhanced parallax effect for hero
    gsap.to('.hero-content', {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        }
    });
    
    // Parallax for hero canvas
    gsap.to('.hero-canvas', {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        }
    });
    
    // Color transition effects for sections
    gsap.utils.toArray('.gallery-section').forEach((section, index) => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 50%',
            end: 'bottom 50%',
            onEnter: () => {
                if (index % 2 === 0) {
                    gsap.to('body', { backgroundColor: '#FDF8F0', duration: 1 });
                } else {
                    gsap.to('body', { backgroundColor: '#F0F9FF', duration: 1 });
                }
            }
        });
    });
    
    // Animate contact section with special effects
    gsap.fromTo('.contact-content',
        { opacity: 0, y: 50, scale: 0.9 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.5,
            ease: "power2.out",
            scrollTrigger: {
                trigger: '.contact-section',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            }
        }
    );
    
    // Animate buttons with hover preparation
    gsap.utils.toArray('.btn').forEach(btn => {
        gsap.fromTo(btn,
            { opacity: 0, scale: 0.8, y: 20 },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.6,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: btn,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
    
    // Navigation background blur effect
    ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        toggleClass: {
            className: 'scrolled',
            targets: '.nav'
        }
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    // Resize hero canvas
    if (heroRenderer && heroCamera) {
        const heroCanvas = document.getElementById('hero-canvas');
        heroCamera.aspect = heroCanvas.offsetWidth / heroCanvas.offsetHeight;
        heroCamera.updateProjectionMatrix();
        heroRenderer.setSize(heroCanvas.offsetWidth, heroCanvas.offsetHeight);
    }
    
    // Resize necklaces canvas
    if (necklacesRenderer && necklacesCamera) {
        const necklacesCanvas = document.getElementById('necklaces-canvas');
        necklacesCamera.aspect = necklacesCanvas.offsetWidth / necklacesCanvas.offsetHeight;
        necklacesCamera.updateProjectionMatrix();
        necklacesRenderer.setSize(necklacesCanvas.offsetWidth, necklacesCanvas.offsetHeight);
    }
    
    // Resize keychains canvas
    if (keychainsRenderer && keychainsCamera) {
        const keychainsCanvas = document.getElementById('keychains-canvas');
        keychainsCamera.aspect = keychainsCanvas.offsetWidth / keychainsCanvas.offsetHeight;
        keychainsCamera.updateProjectionMatrix();
        keychainsRenderer.setSize(keychainsCanvas.offsetWidth, keychainsCanvas.offsetHeight);
    }
    
    // Resize contact canvas
    if (contactRenderer && contactCamera) {
        const contactCanvas = document.getElementById('contact-canvas');
        contactCamera.aspect = contactCanvas.offsetWidth / contactCanvas.offsetHeight;
        contactCamera.updateProjectionMatrix();
        contactRenderer.setSize(contactCanvas.offsetWidth, contactCanvas.offsetHeight);
    }
});

// Premium interaction effects
function setupPremiumInteractions() {
    // Enhanced hover effects for Instagram posts
    document.querySelectorAll('.instagram-post').forEach(post => {
        post.addEventListener('mouseenter', () => {
            gsap.to(post, {
                scale: 1.05,
                rotationY: 5,
                duration: 0.6,
                ease: "power2.out"
            });
        });
        
        post.addEventListener('mouseleave', () => {
            gsap.to(post, {
                scale: 1,
                rotationY: 0,
                duration: 0.6,
                ease: "power2.out"
            });
        });
    });
    
    // Enhanced button interactions
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, {
                scale: 1.02,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });
    
    // Process steps animation on hover
    document.querySelectorAll('.process-step').forEach(step => {
        step.addEventListener('mouseenter', () => {
            const icon = step.querySelector('.step-icon');
            gsap.to(icon, {
                scale: 1.1,
                rotationY: 10,
                duration: 0.4,
                ease: "back.out(1.7)"
            });
        });
        
        step.addEventListener('mouseleave', () => {
            const icon = step.querySelector('.step-icon');
            gsap.to(icon, {
                scale: 1,
                rotationY: 0,
                duration: 0.4,
                ease: "power2.out"
            });
        });
    });
    
    // Enhanced hover effects for product cards
    document.querySelectorAll('.product-card').forEach((card, index) => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                scale: 1.02,
                rotationY: 3,
                duration: 0.4,
                ease: "power2.out"
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                scale: 1,
                rotationY: 0,
                duration: 0.4,
                ease: "power2.out"
            });
        });
    });
}

// Enhanced scroll animations with premium easing
function setupScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Smooth section reveals with staggered effects
    gsap.utils.toArray('.section-title').forEach((title, index) => {
        gsap.fromTo(title, 
            { 
                opacity: 0, 
                y: 100, 
                scale: 0.8,
                rotationX: 15
            },
            { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                rotationX: 0,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: title,
                    start: 'top 85%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
    
    // Subtitle animations
    gsap.utils.toArray('.section-subtitle').forEach(subtitle => {
        gsap.fromTo(subtitle,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 0.3,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: subtitle,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
    
    // Instagram grid staggered animation
    gsap.utils.toArray('.instagram-post').forEach((post, index) => {
        gsap.fromTo(post,
            { 
                opacity: 0, 
                scale: 0.8, 
                y: 60,
                rotationY: 15
            },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                rotationY: 0,
                duration: 0.8,
                delay: index * 0.1,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: '.instagram-grid',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
    
    // Info cards premium animation
    gsap.utils.toArray('.info-card').forEach((card, index) => {
        gsap.fromTo(card,
            { 
                opacity: 0, 
                x: 120, 
                rotationY: 15,
                scale: 0.9
            },
            {
                opacity: 1,
                x: 0,
                rotationY: 0,
                scale: 1,
                duration: 1,
                delay: index * 0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
    
    // Process steps animation
    gsap.utils.toArray('.process-step').forEach((step, index) => {
        gsap.fromTo(step,
            { 
                opacity: 0, 
                y: 80,
                scale: 0.8
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                delay: index * 0.2,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: '.process-steps',
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
    
    // Product cards premium animation
    gsap.utils.toArray('.product-card').forEach((card, index) => {
        gsap.fromTo(card,
            { 
                opacity: 0, 
                scale: 0.85, 
                y: 80,
                rotationY: 15
            },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                rotationY: 0,
                duration: 0.8,
                delay: (index % 4) * 0.1, // Stagger by row
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
    
    // Product image zoom on scroll
    gsap.utils.toArray('.product-image').forEach(image => {
        gsap.fromTo(image,
            { scale: 1.2 },
            {
                scale: 1,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: image,
                    start: 'top 90%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
    
    // Hero parallax on scroll
    gsap.to('.hero-content', {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        }
    });
    
    // Navigation blur enhancement
    ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        onEnter: () => {
            document.querySelector('.nav').classList.add('scrolled');
        },
        onLeaveBack: () => {
            document.querySelector('.nav').classList.remove('scrolled');
        }
    });
    
    // Section background color transitions
    ScrollTrigger.create({
        trigger: '.custom-order-section',
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => {
            gsap.to('body', { 
                backgroundColor: '#784563', 
                duration: 1,
                ease: "power2.out"
            });
        },
        onLeave: () => {
            gsap.to('body', { 
                backgroundColor: '#FAF6F0', 
                duration: 1,
                ease: "power2.out"
            });
        },
        onEnterBack: () => {
            gsap.to('body', { 
                backgroundColor: '#784563', 
                duration: 1,
                ease: "power2.out"
            });
        },
        onLeaveBack: () => {
            gsap.to('body', { 
                backgroundColor: '#FAF6F0', 
                duration: 1,
                ease: "power2.out"
            });
        }
    });
}

// Handle window resize with optimizations
function handleResize() {
    const canvasConfigs = [
        { renderer: heroRenderer, camera: heroCamera, canvas: document.getElementById('hero-canvas') },
        { renderer: contactRenderer, camera: contactCamera, canvas: document.getElementById('contact-canvas') }
    ];
    
    canvasConfigs.forEach(({ renderer, camera, canvas }) => {
        if (renderer && camera && canvas) {
            const rect = canvas.getBoundingClientRect();
            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
            renderer.setSize(rect.width, rect.height);
        }
    });
}

// Preload optimization
function preloadResources() {
    // Preload Google Fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap';
    fontLink.as = 'style';
    fontLink.onload = function() { this.onload = null; this.rel = 'stylesheet'; };
    document.head.appendChild(fontLink);
    
    // Preload critical scripts
    const scripts = [
        'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js'
    ];
    
    scripts.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = src;
        link.as = 'script';
        document.head.appendChild(link);
    });
}