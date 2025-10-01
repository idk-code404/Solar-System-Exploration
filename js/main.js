// main.js

let scene, camera, renderer;
let planets = [];
let planetData = [
  { name: "Mercury", size: 0.383, distance: 10, color: 0xb5b5b5 },
  { name: "Venus", size: 0.949, distance: 15, color: 0xeed6a0 },
  { name: "Earth", size: 1, distance: 20, color: 0x2a5fff },
  { name: "Mars", size: 0.532, distance: 25, color: 0xff4500 },
  // Add remaining planets
];

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 30, 60);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight * 0.7);
  document.getElementById('solar-system-container').appendChild(renderer.domElement);

  const light = new THREE.PointLight(0xffffff, 2, 500);
  light.position.set(0, 0, 0);
  scene.add(light);

  const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);

  planetData.forEach(data => {
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: data.color });
    const planet = new THREE.Mesh(geometry, material);
    planet.position.x = data.distance;
    scene.add(planet);
    planets.push({ mesh: planet, data: data });
  });

  window.addEventListener('resize', onWindowResize, false);

  document.getElementById('search').addEventListener('input', searchPlanet);
}

function animate() {
  requestAnimationFrame(animate);

  planets.forEach(p => {
    p.mesh.position.x = p.data.distance * Math.cos(Date.now() * 0.0001);
    p.mesh.position.z = p.data.distance * Math.sin(Date.now() * 0.0001);
  });

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / (window.innerHeight * 0.7);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight * 0.7);
}

function searchPlanet(e) {
  const query = e.target.value.toLowerCase();
  planets.forEach(p => {
    if(p.data.name.toLowerCase().includes(query)) {
      p.mesh.material.emissive.setHex(0x00ff00); // Highlight
    } else {
      p.mesh.material.emissive.setHex(0x000000);
    }
  });
}
