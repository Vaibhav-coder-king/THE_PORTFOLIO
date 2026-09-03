// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Load saved theme preference or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
htmlElement.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = htmlElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  htmlElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update Three.js canvas background
  const newBgColor = newTheme === 'dark' ? 0x030611 : 0xf5f7ff;
  renderer.setClearColor(newBgColor, 1);
});

// ===== THREE.JS SETUP =====
const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
const bgColor = savedTheme === 'dark' ? 0x030611 : 0xf5f7ff;
renderer.setClearColor(bgColor, 1);
camera.position.z = 50;

// ===== PARTICLES BACKGROUND =====
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = Math.min(1500, Math.floor(window.innerWidth / 4));
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i += 3) {
  posArray[i] = (Math.random() - 0.5) * 200;
  posArray[i + 1] = (Math.random() - 0.5) * 200;
  posArray[i + 2] = (Math.random() - 0.5) * 200;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particleColor = savedTheme === 'dark' ? 0xb7a4ff : 0x7040ff;
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.5,
  color: particleColor,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.7,
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// ===== 3D FLOATING SHAPES =====
const shapes = [];

function createFloatingShape() {
  const geometries = [
    new THREE.IcosahedronGeometry(1, 4),
    new THREE.TetrahedronGeometry(1),
    new THREE.OctahedronGeometry(1),
  ];

  const darkColors = [0x7b42ff, 0x35d8ff, 0xff4bd8, 0x9b5cff];
  const lightColors = [0x7040ff, 0x0066cc, 0xd62c87, 0x8c4dd8];
  const colors = savedTheme === 'dark' ? darkColors : lightColors;
  const geometry = geometries[Math.floor(Math.random() * geometries.length)];
  const material = new THREE.MeshPhongMaterial({
    color: colors[Math.floor(Math.random() * colors.length)],
    emissive: colors[Math.floor(Math.random() * colors.length)],
    emissiveIntensity: 0.3,
    wireframe: Math.random() > 0.5,
  });

  const shape = new THREE.Mesh(geometry, material);
  shape.position.set(
    (Math.random() - 0.5) * 150,
    (Math.random() - 0.5) * 150,
    (Math.random() - 0.5) * 100 - 50
  );
  shape.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  shape.scale.set(Math.random() * 2 + 0.5, Math.random() * 2 + 0.5, Math.random() * 2 + 0.5);
  shape.userData = {
    vx: (Math.random() - 0.5) * 0.002,
    vy: (Math.random() - 0.5) * 0.002,
    vz: (Math.random() - 0.5) * 0.002,
    rx: (Math.random() - 0.5) * 0.005,
    ry: (Math.random() - 0.5) * 0.005,
    rz: (Math.random() - 0.5) * 0.005,
  };

  scene.add(shape);
  shapes.push(shape);
}

for (let i = 0; i < 8; i++) createFloatingShape();

// ===== LIGHTING =====
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0x7b42ff, 1, 100);
pointLight1.position.set(30, 30, 40);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x35d8ff, 0.8, 100);
pointLight2.position.set(-30, -30, 40);
scene.add(pointLight2);

// ===== INTERSECTION OBSERVER =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// ===== HERO MODEL SCROLL ROTATION =====
const platform = document.querySelector('.platform');
let platformRotationFrame;

function updatePlatformRotation() {
  const rotation = window.scrollY * -0.72;
  platform.style.setProperty('--platform-rotate-y', `${rotation}deg`);
}

window.addEventListener('scroll', () => {
  if (platformRotationFrame) return;
  platformRotationFrame = requestAnimationFrame(() => {
    updatePlatformRotation();
    platformRotationFrame = null;
  });
}, { passive: true });
updatePlatformRotation();

// ===== 3D TILT EFFECT =====
document.querySelectorAll('.tilt').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
  });
  card.addEventListener('pointerleave', () => (card.style.transform = ''));
});

// ===== NAVIGATION ACTIVE STATE =====
const navLinks = [...document.querySelectorAll('nav a')];
const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href')));

addEventListener(
  'scroll',
  () => {
    let current = sections.findIndex(
      (s) => s.getBoundingClientRect().top <= 130 && s.getBoundingClientRect().bottom > 130
    );
    navLinks.forEach((a, i) => a.classList.toggle('active', i === current));
    document.getElementById('topBtn').classList.toggle('show', scrollY > 700);
  },
  { passive: true }
);

document.getElementById('topBtn').onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

// ===== MOBILE NAVIGATION DRAWER =====
const menuToggle = document.getElementById('menu-toggle');
const mobileDrawer = document.getElementById('mobile-drawer');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const drawerClose = document.getElementById('drawer-close');

function setDrawerOpen(isOpen) {
  mobileDrawer.classList.toggle('open', isOpen);
  drawerBackdrop.classList.toggle('open', isOpen);
  mobileDrawer.setAttribute('aria-hidden', String(!isOpen));
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
}

menuToggle.addEventListener('click', () => setDrawerOpen(!mobileDrawer.classList.contains('open')));
drawerClose.addEventListener('click', () => setDrawerOpen(false));
drawerBackdrop.addEventListener('click', () => setDrawerOpen(false));
mobileDrawer.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setDrawerOpen(false)));

// ===== MODAL =====
const modal = document.getElementById('modal'),
  modalImg = document.getElementById('modalImg'),
  modalTitle = document.getElementById('modalTitle');

document.querySelectorAll('.cert-card').forEach((card) =>
  card.querySelectorAll('.preview-btn, .cert-img-wrap').forEach((previewButton) => previewButton.addEventListener('click', () => {
    modalTitle.textContent = card.dataset.title;
    modalImg.src = card.dataset.img;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }))
);

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  modalImg.src = '';
}

document.getElementById('closeModal').onclick = closeModal;
modal.querySelector('.modal-backdrop').onclick = closeModal;
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Escape') setDrawerOpen(false);
});

// ===== ANIMATION LOOP =====
function animate() {
  requestAnimationFrame(animate);

  // Rotate particles
  particles.rotation.x += 0.0001;
  particles.rotation.y += 0.00015;

  // Update floating shapes
  shapes.forEach((shape) => {
    shape.position.x += shape.userData.vx;
    shape.position.y += shape.userData.vy;
    shape.position.z += shape.userData.vz;

    shape.rotation.x += shape.userData.rx;
    shape.rotation.y += shape.userData.ry;
    shape.rotation.z += shape.userData.rz;

    // Boundary check
    if (Math.abs(shape.position.x) > 100) shape.userData.vx *= -1;
    if (Math.abs(shape.position.y) > 100) shape.userData.vy *= -1;
    if (Math.abs(shape.position.z) > 60) shape.userData.vz *= -1;
  });

  // Mouse interaction
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    camera.position.x = x * 10;
    camera.position.y = y * 10;
  });

  renderer.render(scene, camera);
}

animate();

// ===== HANDLE WINDOW RESIZE =====
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

