let scene, camera, renderer, controls;
let planets = [];
let asteroidBelt = [];
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

const planetTextures = {
  Mercury: 'textures/mercury.jpg',
  Venus: 'textures/venus.jpg',
  Earth: 'textures/earth.jpg',
  Moon: 'textures/moon.jpg',
  Mars: 'textures/mars.jpg',
  Jupiter: 'textures/jupiter.jpg',
  Saturn: 'textures/saturn.jpg',
  Uranus: 'textures/uranus.jpg',
  Neptune: 'textures/neptune.jpg'
};

const planetData = [
  { name: "Mercury", size: 0.383, distance: 10, texture: planetTextures.Mercury },
  { name: "Venus", size: 0.949, distance: 15, texture: planetTextures.Venus },
  { name: "Earth", size: 1, distance: 20, texture: planetTextures.Earth, moons: [{ name: "Moon", size: 0.27, distance: 2, texture: planetTextures.Moon }] },
  { name: "Mars", size: 0.532, distance: 25, texture: planetTextures.Mars, moons: [
      { name: "Phobos", size: 0.01, distance: 1.5, color: 0xaaaaaa },
      { name: "Deimos", size: 0.006, distance: 2.5, color: 0xbbbbbb }
    ] 
  },
  { name: "Jupiter", size: 11.2, distance: 40, texture: planetTextures.Jupiter },
  { name: "Saturn", size: 9.45, distance: 60, texture: planetTextures.Saturn, rings: { inner: 10, outer: 15, texture: 'textures/saturn_ring.png' } },
  { name: "Uranus", size: 4, distance: 75, texture: planetTextures.Uranus },
  { name: "Neptune", size: 3.8, distance: 90, texture: planetTextures.Neptune }
];

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 30, 100);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight * 0.7);
  document.getElementById('solar-system-container').appendChild(renderer.domElement);

  const light = new THREE.PointLight(0xffffff, 2, 1000);
  light.position.set(0,0,0);
  scene.add(light);

  // Sun
  const sunGeo = new THREE.SphereGeometry(5,32,32);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  scene.add(sun);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.minDistance = 10;
  controls.maxDistance = 200;

  planetData.forEach(p => {
    const texture = p.texture ? new THREE.TextureLoader().load(p.texture) : null;
    const mat = texture ? new THREE.MeshStandardMaterial({ map: texture }) : new THREE.MeshStandardMaterial({ color: p.color || 0xffffff });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.size,32,32), mat);
    mesh.position.x = p.distance;
    scene.add(mesh);

    // Rings
    if(p.rings){
      const ringTexture = new THREE.TextureLoader().load(p.rings.texture);
      const ringGeo = new THREE.RingGeometry(p.rings.inner, p.rings.outer, 64);
      const ringMat = new THREE.MeshBasicMaterial({ map: ringTexture, side: THREE.DoubleSide, transparent: true });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI/2;
      mesh.add(ring);
    }

    // Moons
    let moons = [];
    if(p.moons){
      p.moons.forEach(moon => {
        const mTex = moon.texture ? new THREE.TextureLoader().load(moon.texture) : null;
        const moonMat = mTex ? new THREE.MeshStandardMaterial({ map: mTex }) : new THREE.MeshStandardMaterial({ color: moon.color || 0xffffff });
        const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(moon.size,16,16), moonMat);
        moonMesh.position.x = mesh.position.x + moon.distance;
        scene.add(moonMesh);
        moons.push({ mesh: moonMesh, data: moon, parent: mesh });
      });
    }

    planets.push({ mesh: mesh, data: p, moons: moons });
  });

  // Asteroid Belt
  const asteroidCount = 200;
  for(let i=0; i<asteroidCount; i++){
    const angle = Math.random()*2*Math.PI;
    const distance = 30 + Math.random()*10;
    const size = 0.1 + Math.random()*0.3;
    const geometry = new THREE.SphereGeometry(size,8,8);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const asteroid = new THREE.Mesh(geometry, material);
    asteroid.position.x = distance*Math.cos(angle);
    asteroid.position.z = distance*Math.sin(angle);
    asteroid.userData = { name: `Asteroid ${i+1}`, description: "Part of the main asteroid belt.", angle: angle, distance: distance };
    scene.add(asteroid);
    asteroidBelt.push(asteroid);
  }

  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('click', onMouseClick, false);
  document.getElementById('search').addEventListener('input', searchPlanet);
}

function animate() {
  requestAnimationFrame(animate);
  const t = Date.now()*0.0001;

  planets.forEach(p => {
    p.mesh.position.x = p.data.distance * Math.cos(t);
    p.mesh.position.z = p.data.distance * Math.sin(t);
    p.moons.forEach(m => {
      const tMoon = Date.now()*0.001;
      m.mesh.position.x = p.mesh.position.x + m.data.distance * Math.cos(tMoon);
      m.mesh.position.z = p.mesh.position.z + m.data.distance * Math.sin(tMoon);
    });
  });

  // Asteroid belt rotation
  asteroidBelt.forEach(a => {
    a.userData.angle += 0.00005 + Math.random()*0.00005;
    a.position.x = a.userData.distance * Math.cos(a.userData.angle);
    a.position.z = a.userData.distance * Math.sin(a.userData.angle);
  });

  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize(){
  camera.aspect = window.innerWidth / (window.innerHeight*0.7);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight*0.7);
}

function onMouseClick(event){
  mouse.x = (event.clientX / window.innerWidth)*2-1;
  mouse.y = -(event.clientY / (window.innerHeight*0.7))*2+1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([
    ...planets.flatMap(p=>[p.mesh,...p.moons.map(m=>m.mesh)]),
    ...asteroidBelt
  ]);

  if(intersects.length>0){
    const obj = intersects[0].object;
    let clicked = planets.find(p=>p.mesh===obj) || planets.find(p=>p.moons.some(m=>m.mesh===obj)) || asteroidBelt.find(a=>a===obj);
    if(clicked){
      document.getElementById('body-name').textContent = clicked.data?.name || obj.userData?.name;
      document.getElementById('body-description').textContent = clicked.data?.description || obj.userData?.description || 'Description coming soon!';
      if(clicked.data?.texture){
        document.getElementById('body-image').src = clicked.data.texture;
        document.getElementById('body-image').hidden = false;
      } else {
        document.getElementById('body-image').hidden = true;
      }
    }
  }
}

function searchPlanet(e){
  const query = e.target.value.toLowerCase();
  planets.forEach(p=>{
    if(p.data.name.toLowerCase().includes(query)){
      p.mesh.material.emissive = new THREE.Color(0x00ff00);
    } else {
      p.mesh.material.emissive = new THREE.Color(0x000000);
    }
  });
}
