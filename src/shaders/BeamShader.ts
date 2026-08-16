/** Browser-only GLSL source for a visual beam material. */
export const BeamShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColorCore;
    uniform vec3 uColorGlow;
    uniform float uTime;
    uniform float uScrollSpeed;
    uniform float uIntensity;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float fresnel = pow(clamp(1.0 - abs(dot(viewDir, vNormal)), 0.0, 1.0), 2.5);
      float band = sin(vUv.y * 40.0 - uTime * uScrollSpeed) * 0.5 + 0.5;
      float spiral = sin((vUv.x + vUv.y) * 15.0 - uTime * uScrollSpeed * 1.5) * 0.5 + 0.5;
      vec3 color = mix(uColorGlow, uColorCore, fresnel + band * 0.5);
      color += uColorCore * spiral * uIntensity;
      float alpha = (fresnel * 0.8 + band * 0.3) * clamp(vUv.y * 4.0, 0.0, 1.0);
      gl_FragColor = vec4(color, alpha);
    }
  `
};
