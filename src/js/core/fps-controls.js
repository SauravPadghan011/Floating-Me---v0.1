import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export function createFPSController(camera, domEl, {
    speed = 5,      // units per second
    boost = 2,      // hold shift to go faster
    minY = null     // true = can move up/down with q/e
} = {}) {

    const controls = new PointerLockControls(camera, domEl);

    // make canvas focusable so it can receive key events
    domEl.tabIndex = domEl.tabIndex >= 0 ? domEl.tabIndex : 0;

    const pressed = new Set();
    const codes = new Set([
        'KeyW', 'KeyA', 'keyS', 'KeyD',
        'ShiftLeft', 'ShiftRight'
    ]);

    function onKeyDown(e) {
        if (codes.has(e.code))
            e.preventDefault();
        pressed.add(e.code);
    }
    function onKeyUp(e) { pressed.delete(e.code); }

    domEl.addEventListener('keydown', onKeyDown);
    domEl.addEventListener('keyup', onKeyUp);

    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const upAxis = new THREE.Vector3(0, 1, 0);
    const move = new THREE.Vector3();

    function update(dt) {
        const mult = (pressed.has('ShiftLeft') || pressed.has('ShiftRight')) ? speed * boost : speed;

        // Camera-local forward (includes pitch for vertical movement when pressing W/S)
        forward.set(0, 0, -1).applyQuaternion(camera.quaternion).normalize();

        // Horizontal strafe: camera-right projected onto world XZ plane (no vertical drift)
        right.set(1, 0, 0).applyQuaternion(camera.quaternion);
        right.projectOnPlane(upAxis).normalize();

        move.set(0, 0, 0);

        if (pressed.has('KeyW')) move.add(forward);
        if (pressed.has('KeyS')) move.sub(forward);
        if (pressed.has('KeyD')) move.add(right);
        if (pressed.has('KeyA')) move.sub(right);

        if (move.lengthSq() > 0) {
            move.normalize().multiplyScalar(mult * dt);
            controls.getObject().position.add(move);
            if (minY !== null) {
                const p = controls.getObject().position;
                if (p.y < minY) p.y = minY; // optional floor clamp
            }
        }
    }

    function lock() { controls.lock(); domEl.focus(); }
    function unlock() { controls.unlock(); }
    function dispose() {
        domEl.removeEventListener('keydown', onKeyDown);
        domEl.removeEventListener('keyup', onKeyUp);
    }

    return { controls, update, lock, unlock, dispose };
}