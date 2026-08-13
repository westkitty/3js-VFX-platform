/** Browser-only GLSL source for the visual orb material. */
export const OrbMaterialShader = {
  vertexShader: /* glsl */ `
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColorCore;
    uniform vec3 uColorOuter;
    uniform float uTime;
    uniform float uNoiseScale;
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      float fresnel = pow(1.0 - clamp(dot(viewDir, vNormal), 0.0, 1.0), 2.0);
      float turbulence = sin(vWorldPos.x * uNoiseScale + uTime * 4.0) * cos(vWorldPos.y * uNoiseScale + uTime * 3.0) * sin(vWorldPos.z * uNoiseScale + uTime * 5.0);
      vec3 color = mix(uColorCore, uColorOuter, fresnel + turbulence * 0.3);
      float alpha = clamp(fresnel * 1.5 + turbulence * 0.4, 0.0, 1.0);
      gl_FragColor = vec4(color * 1.4, alpha);
    }
  `
};
