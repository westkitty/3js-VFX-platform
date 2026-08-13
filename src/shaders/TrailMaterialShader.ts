/** Browser-only GLSL source for a visual trail material. */
export const TrailMaterialShader = {
  vertexShader: /* glsl */ `
    uniform float uTime;
    uniform float uNoiseFreq;
    uniform float uNoiseAmp;
    uniform float uWidth;
    attribute vec3 aDirection;
    attribute float aProgress;
    attribute float aSide;
    varying vec2 vUv;
    varying float vProgress;
    varying float vNoise;
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    void main() {
      vUv = uv;
      vProgress = aProgress;
      float n = snoise(vec2(aProgress * uNoiseFreq, uTime * 3.0));
      vNoise = n;
      vec3 pos = position + aDirection * n * uNoiseAmp * (1.0 - abs(aProgress - 0.5) * 1.5);
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vec3 viewDir = normalize(-mvPosition.xyz);
      vec3 sideDir = normalize(cross(viewDir, vec3(0.0, 1.0, 0.0)));
      mvPosition.xyz += sideDir * aSide * uWidth * sin(aProgress * 3.14159);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColorCore;
    uniform vec3 uColorGlow;
    uniform float uOpacity;
    uniform float uTime;
    varying vec2 vUv;
    varying float vProgress;
    varying float vNoise;
    void main() {
      float dist = abs(vUv.y - 0.5) * 2.0;
      float core = smoothstep(0.8, 0.0, dist);
      float edgeGlow = pow(clamp(1.0 - dist, 0.0, 1.0), 3.0);
      float pulse = sin(vUv.x * 20.0 - uTime * 10.0) * 0.5 + 0.5;
      vec3 finalColor = mix(uColorGlow, uColorCore, core) + uColorCore * pulse * 0.4;
      float alpha = edgeGlow * uOpacity * sin(vProgress * 3.14159);
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};
