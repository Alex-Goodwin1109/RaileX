import { useEffect, useRef } from "react";
import type * as THREE_T from "three";

export type OrbState = "hero" | "idle" | "listening" | "processing" | "replying" | "support" | "urgent";

const PALETTE: Record<OrbState, [string, string]> = {
  hero: ["#ff4b1f", "#00c6ff"],
  idle: ["#8b8b88", "#5c5c5a"],
  listening: ["#c4b5fd", "#a78bfa"],
  processing: ["#93c5fd", "#60a5fa"],
  replying: ["#6ee7b7", "#34d399"],
  support: ["#fcd34d", "#f59e0b"],
  urgent: ["#fb923c", "#f97316"],
};

type Props = {
  state: OrbState;
  size: number;
  micActive?: boolean;
  className?: string;
};

/**
 * Three.js stratified voice-reactive orb. Loaded lazily on the client only.
 */
export function Orb({ state, size, micActive = false, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const micRef = useRef(micActive);
  stateRef.current = state;
  micRef.current = micActive;

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      const container = containerRef.current;
      if (!container || disposed) return;

      const w = container.clientWidth || 120;
      const h = container.clientHeight || 120;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
      camera.position.z = 2.2;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const geometry = new THREE.SphereGeometry(1, 64, 64);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uAudio: { value: 0 },
          uEnergy: { value: 0 },
          uColorTop: { value: new THREE.Color(PALETTE[stateRef.current][0]) },
          uColorBottom: { value: new THREE.Color(PALETTE[stateRef.current][1]) },
        },
        transparent: true,
        vertexShader: `
          uniform float uTime;
          uniform float uAudio;
          varying vec3 vPosition;
          varying vec3 vNormal;
          void main() {
            vPosition = position;
            vNormal = normal;
            float pulse = 1.0 + (uAudio * 0.15);
            vec3 newPosition = position * pulse;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uAudio;
          uniform float uEnergy;
          uniform vec3 uColorTop;
          uniform vec3 uColorBottom;
          varying vec3 vPosition;
          varying vec3 vNormal;

          void main() {
            float waveSpeed = uTime * (1.0 + uAudio * 2.0);
            float waveFrequency = 3.0;
            float waveAmplitude = 0.1 + (uAudio * 0.4);

            float wave = sin(vPosition.x * waveFrequency + waveSpeed) *
                         cos(vPosition.z * waveFrequency + waveSpeed) * waveAmplitude;

            float displacedY = vPosition.y + wave;

            float bandThickness = 0.45 + uAudio * 0.25 + uEnergy * 0.1;
            float bandMask = smoothstep(bandThickness, 0.0, abs(displacedY));

            float splitMask = smoothstep(-0.05, 0.05, displacedY);
            vec3 bandColor = mix(uColorBottom, uColorTop, splitMask);

            vec3 viewDirection = normalize(cameraPosition - vPosition);
            float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 4.0);
            vec3 glassEdge = vec3(0.8, 0.9, 1.0) * fresnel * 0.3;

            vec3 darkCore = vec3(0.02, 0.02, 0.03);
            vec3 finalColor = mix(darkCore, bandColor, bandMask);

            float glowIntensity = (1.5 + uAudio * 3.0 + uEnergy) * bandMask;
            finalColor += bandColor * glowIntensity * 0.5;
            finalColor += glassEdge;

            gl_FragColor = vec4(finalColor, 0.95);
          }
        `,
      });

      const U = material.uniforms as unknown as {
        uTime: { value: number };
        uAudio: { value: number };
        uEnergy: { value: number };
        uColorTop: { value: THREE_T.Color };
        uColorBottom: { value: THREE_T.Color };
      };

      const orb = new THREE.Mesh(geometry, material);
      scene.add(orb);

      // Audio reactivity
      let analyser: AnalyserNode | null = null;
      let dataArray: Uint8Array | null = null;
      let audioContext: AudioContext | null = null;
      let stream: MediaStream | null = null;
      let level = 0;
      let audioStarted = false;

      const startAudio = async () => {
        if (audioStarted || typeof navigator === "undefined" || !navigator.mediaDevices) return;
        audioStarted = true;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioContext = new (window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.8;
          audioContext.createMediaStreamSource(stream).connect(analyser);
          dataArray = new Uint8Array(analyser.frequencyBinCount);
        } catch {
          /* mic denied — fall back to simulated pulse */
        }
      };

      const clock = new THREE.Clock();
      let raf = 0;
      const targetTop = new THREE.Color();
      const targetBottom = new THREE.Color();

      const animate = () => {
        raf = requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        const st = stateRef.current;

        U['uTime'].value = time;
        orb.rotation.y = time * (st === "urgent" ? 0.6 : st === "processing" ? 0.45 : 0.2);
        orb.rotation.z = Math.sin(time * 0.5) * 0.1;

        targetTop.set(PALETTE[st][0]);
        targetBottom.set(PALETTE[st][1]);
        U['uColorTop'].value.lerp(targetTop, 0.06);
        U['uColorBottom'].value.lerp(targetBottom, 0.06);

        const energyTarget = st === "urgent" ? 1.4 : st === "hero" ? 0.5 : st === "idle" ? 0 : 0.6;
        U['uEnergy'].value +=
          (energyTarget - U['uEnergy'].value) * 0.05;

        let volume = 0;
        if (micRef.current) {
          void startAudio();
          if (analyser && dataArray) {
            analyser.getByteFrequencyData(dataArray as unknown as Uint8Array<ArrayBuffer>);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i] ?? 0;
            volume = sum / dataArray.length / 255;
          } else {
            volume = 0.18 + Math.abs(Math.sin(time * 2.4)) * 0.25;
          }
        } else if (st === "processing") {
          volume = 0.12 + Math.abs(Math.sin(time * 4.0)) * 0.18;
        } else if (st === "replying" || st === "support") {
          volume = 0.08 + Math.abs(Math.sin(time * 1.4)) * 0.12;
        } else if (st === "urgent") {
          volume = 0.2 + Math.abs(Math.sin(time * 6.0)) * 0.3;
        } else if (st === "hero") {
          volume = 0.05 + Math.abs(Math.sin(time * 0.8)) * 0.08;
        }

        level += (volume - level) * 0.15;
        U['uAudio'].value = level;

        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        if (!cw || !ch) return;
        renderer.setSize(cw, ch);
        camera.aspect = cw / ch;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(onResize);
      ro.observe(container);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        stream?.getTracks().forEach((t) => t.stop());
        void audioContext?.close();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: size, height: size, transition: "width 500ms ease-out, height 500ms ease-out" }}
    />
  );
}
