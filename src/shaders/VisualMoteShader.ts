/** Browser-only GLSL source for instanced visual motes. */
export const VisualMoteShader = {
  vertexShader: /* glsl */ `
    attribute vec3 instancePosition;
    attribute vec3 instanceVelocity;
    attribute vec3 instanceColor;
    attribute float instanceSize;
    attribute float instanceLife;
    attribute float instanceBirthTime;
    uniform float uTime;
    uniform float uSizeMultiplier;
    varying vec3 vColor;
    varying float vLife;
    varying vec2 vParticleUv;
    void main() {
      vColor = instanceColor;
      vLife = instanceLife;
      vParticleUv = uv;
      float ageTime = max(uTime - instanceBirthTime, 0.0);
      vec3 pos = instancePosition + instanceVelocity * (ageTime * 0.8);
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      float size = instanceSize * (1.0 - instanceLife) * uSizeMultiplier;
      mvPosition.xy += position.xy * size;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    varying vec3 vColor;
    varying float vLife;
    varying vec2 vParticleUv;
    void main() {
      vec2 coord = vParticleUv - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;
      float alpha = (1.0 - smoothstep(0.2, 0.5, dist)) * (1.0 - vLife);
      gl_FragColor = vec4(vColor * 1.5, alpha);
    }
  `
};
