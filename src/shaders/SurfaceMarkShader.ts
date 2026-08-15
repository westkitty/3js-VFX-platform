/** Browser-only GLSL source for projected visual surface marks. */
export const SurfaceMarkShader = {
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
    uniform int uMarkVariant;
    uniform vec3 uColor;
    uniform float uFade;
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vWorldPos;
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    void main() {
      vec2 st = vUv - 0.5;
      float dist = length(st) * 2.0;
      float boundary = 1.0 - step(1.0, dist);
      float n = noise(vUv * 8.0);
      float alpha = max(1.0 - dist, 0.0) * uFade * boundary;
      vec3 finalColor = uColor;
      if (uMarkVariant == 0) {
        float mark = smoothstep(0.8, 0.2, dist + n * 0.2);
        finalColor = mix(vec3(0.05), uColor * 0.3, mark);
        alpha *= mark;
      } else if (uMarkVariant == 1) {
        float coolMask = step(0.4, noise(vUv * 16.0));
        finalColor = mix(vec3(0.8, 0.95, 1.0), uColor, coolMask);
        alpha *= (0.7 + coolMask * 0.3);
      } else if (uMarkVariant == 2) {
        float warmMask = smoothstep(0.45, 0.5, noise(vUv * 12.0));
        float glow = sin(uTime * 3.0 + n * 10.0) * 0.5 + 0.5;
        finalColor = mix(vec3(0.1, 0.02, 0.0), vec3(1.0, 0.3, 0.0) * (1.5 + glow), warmMask);
        alpha *= (1.0 - dist);
      } else if (uMarkVariant == 3) {
        float ring1 = smoothstep(0.02, 0.0, abs(dist - 0.7));
        float ring2 = smoothstep(0.01, 0.0, abs(dist - 0.9));
        float angle = atan(st.y, st.x);
        float glyphMask = step(0.5, sin(angle * 16.0 + uTime));
        finalColor = uColor * 1.8;
        alpha *= (ring1 + ring2 + glyphMask * 0.3 * ring1);
      } else if (uMarkVariant == 4) {
        float angle = atan(st.y, st.x);
        float spiral = sin(angle * 4.0 - dist * 8.0 + uTime * 2.0);
        float core = smoothstep(0.7, 0.1, dist + spiral * 0.15);
        finalColor = mix(vec3(0.02, 0.0, 0.05), uColor * 1.5, core);
        alpha *= core;
      }
      gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 1.0));
    }
  `
};
