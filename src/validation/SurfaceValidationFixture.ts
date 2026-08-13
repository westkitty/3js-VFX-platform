import * as THREE from 'three';

/**
 * Representative non-production geometry for the Phase 3 surface gate.
 * Enabled only with ?surfaceFixture=1 so normal workbench behavior is untouched.
 */
export class SurfaceValidationFixture {
  private readonly group = new THREE.Group();
  private readonly meshes: THREE.Mesh[] = [];

  constructor(private readonly scene: THREE.Scene) {
    this.group.name = 'SurfaceValidationFixture';
    this.scene.add(this.group);
    this.addRamp();
    this.addSteps();
  }

  public getPlayableMeshes(): readonly THREE.Mesh[] {
    return this.meshes;
  }

  private addRamp() {
    const geometry = new THREE.BoxGeometry(8, 0.5, 6);
    const material = this.makeMaterial(0x334155, 0x0f172a);
    const ramp = new THREE.Mesh(geometry, material);
    ramp.name = 'SurfaceValidationRamp';
    ramp.position.set(9, 1.2, -1);
    ramp.rotation.z = -Math.PI / 12;
    ramp.receiveShadow = true;
    this.group.add(ramp);
    this.meshes.push(ramp);
  }

  private addSteps() {
    for (let index = 0; index < 4; index++) {
      const geometry = new THREE.BoxGeometry(3.2, 0.5 + index * 0.65, 4.5);
      const material = this.makeMaterial(0x273449 + index * 0x030303, 0x0b1220);
      const step = new THREE.Mesh(geometry, material);
      step.name = `SurfaceValidationStep${index + 1}`;
      step.position.set(-10 + index * 3.1, 0.25 + index * 0.325, -3);
      step.receiveShadow = true;
      this.group.add(step);
      this.meshes.push(step);
    }
  }

  private makeMaterial(color: number, emissive: number): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.05, emissive, emissiveIntensity: 0.15 });
  }

  public destroy() {
    for (const mesh of this.meshes) {
      this.group.remove(mesh);
      mesh.geometry.dispose();
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => material.dispose());
    }
    this.meshes.length = 0;
    this.scene.remove(this.group);
  }
}
