import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DragControls } from 'three/addons/controls/DragControls.js';

console.log("index.ts loaded");

const plane = new THREE.Plane(new THREE.Vector3(1, 1, 1).normalize());
plane.translate(new THREE.Vector3(5, 5, 5));

main();

function main(): void {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

    const camera = new THREE.PerspectiveCamera(75, 2, 1, 100_000);
    camera.position.set(10, 20, 100);

    const scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(100_000));

    const planeGeometry = new THREE.PlaneGeometry(25, 25);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.position.copy(plane.coplanarPoint(new THREE.Vector3()));
    planeMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), plane.normal);
    scene.add(planeMesh);

    const sphereGeometry = new THREE.SphereGeometry();
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphereMesh);

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.addEventListener("change", () => renderer.render(scene, camera));

    const dragControls = new DragControls([sphereMesh], camera, renderer.domElement);
    dragControls.addEventListener("dragstart", () => orbitControls.enabled = false);
    dragControls.addEventListener("drag", () => {
        projectPointOntoPlane();
        renderer.render(scene, camera);
    });
    dragControls.addEventListener("dragend", () => orbitControls.enabled = true);

    projectPointOntoPlane();
    renderer.render(scene, camera);

    function projectPointOntoPlane(): void {
        const cameraPosition = camera.position;
        const direction = sphereMesh.position.clone().sub(cameraPosition).normalize();
        const ray = new THREE.Ray(cameraPosition, direction);
        if (!ray.intersectPlane(plane, sphereMesh.position)) {
            console.error("No intersection found");
        }
    }
}