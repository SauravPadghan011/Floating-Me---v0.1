import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export function createFPSController(camera, domEl, {
    speed = 5,      // units per second
    boost = 2,      // hold shift to go faster
    fly = false     // true = can move up/down with q/e
} = {}) {

    const controls = new PointerLockControls(camera, domEl);

    // make canvas focusable so it can receive key events
    domEl.tabIndex = domEl.tabIndex >= 0 ? domEl.tabIndex : 0;

    const pressed = new Set();
    const codes = new Set([
        'KeyW', 'KeyA', 'keyS', 'KeyD',
        'ShiftLeft', 'ShiftRight',
        'KeyQ', 'KeyE'
    ]);
    
    function onKeyDown(e) {
        if (codes.has(e.code))
            e.preventDefault();
        pressed.add(e.code);
    }
    function onKeyUp(e) { pressed.delete(e.code); }

    domEl.addEventListener('keydown', onKeyDown);
    domEl.addEventListener('keyup', onKeyUp);

    // const forward = new THREE.Vector3();
    // const right = new THREE.Vector3();
    // const up = new THREE.Vector3(0, 1, 0);
    // const move = new THREE.Vector3();

    function update(dt) {
        const mult = (pressed.has('ShiftLeft') || pressed.has('ShiftRight')) ? speed * boost : speed;

        // Forward/back
        if (pressed.has('KeyW')) controls.moveForward(mult * dt);
        if (pressed.has('KeyS')) controls.moveForward(-mult * dt);

        // Strafe right/left
        if (pressed.has('KeyD')) controls.moveRight(mult * dt);
        if (pressed.has('KeyA')) controls.moveRight(-mult * dt);

        // Optional vertical fly
        if (fly) {
            const obj = controls.getObject();
            if (pressed.has('KeyE')) obj.position.y += mult * dt;
            if (pressed.has('KeyQ')) obj.position.y -= mult * dt;
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