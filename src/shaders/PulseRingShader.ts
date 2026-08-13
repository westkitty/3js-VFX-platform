/** Browser-only GLSL source for expanding visual rings. */
export const PulseRingShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vWorldPos;
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColorPrimary;
    uniform vec3 uColorSecondary;
    uniform float uRadius;
    uniform float uRingWidth;
    uniform float uTime;
    uniform float uFillAlpha;
    varying vec2 vUv;
    varying vec3 vWorldPos;
    void main() {
      vec2 center = vec2(0.5, 0.5);
      float dist = length(vUv - center) * 2.0;
      float ring = smoothstep(uRadius - uRingWidth, uRadius, dist) - smoothstep(uRadius, uRadius + uRingWidth, dist);
      float fill = step(dist, uRadius) * uFillAlpha;
      float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
      float ray = sin(angle * 12.0 + uTime * 4.0) * 0.5 + 0.5;
      vec3 color = mix(uColorSecondary, uColorPrimary, ring + ray * fill);
      float alpha = ring * 0.9 + fill * 0.3 * (1.0 - dist);
      gl_FragColor = vec4(color, alpha);
    }
  `
};
