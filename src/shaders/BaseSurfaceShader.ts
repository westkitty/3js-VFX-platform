/** Browser-only GLSL source for the editable base surface material. */
export const BaseSurfaceShader = {
  vertexShader: /* glsl */ `
    uniform float uTime;
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uBaseColor;
    uniform vec3 uGridColor;
    uniform float uShowGrid;
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying vec2 vUv;
    void main() {
      vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
      float diff = max(dot(vNormal, lightDir), 0.25);
      vec3 color = uBaseColor * diff;
      if (uShowGrid > 0.5) {
        vec2 gridUv = fract(vWorldPos.xz * 0.5);
        float grid = step(0.96, gridUv.x) + step(0.96, gridUv.y);
        color = mix(color, uGridColor, grid * 0.35);
      }
      gl_FragColor = vec4(color, 1.0);
    }
  `
};
