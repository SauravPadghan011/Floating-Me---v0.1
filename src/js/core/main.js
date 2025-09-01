import * as THREE from 'three';
import { createFPSController } from './fps-controls.js';

const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.style.margin = '0';
document.body.appendChild(renderer.domElement);

const EYE_HEIGHT = 1.7;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 100);
camera.position.set(0, 2, 10);

scene.add(new THREE.AxesHelper(5));
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));

// const orbit = new OrbitControls(camera, renderer.domElement);
// orbit.update();

// create a cube and geometry
const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x55ff99 });
const cube = new THREE.Mesh(boxGeometry, boxMaterial);
// cube.scale.setScalar(2);
cube.position.y = 1;
scene.add(cube);

// add a plane in scene
const groundGeometry = new THREE.PlaneGeometry(30, 30);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// add grid
const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

const clock = new THREE.Clock();
const fps = createFPSController(camera, renderer.domElement, {
    speed: 6,
    boost: 2,
    minY: null
});

// click to lock mouse & capture keys
renderer.domElement.addEventListener('click', () => fps.lock());

window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
});

function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    fps.update(dt);
    renderer.render(scene, camera);

    const obj = fps.controls.getObject();
    if (obj.position.y < EYE_HEIGHT) obj.position.y = EYE_HEIGHT;

}

animate();