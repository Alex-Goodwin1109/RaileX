import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  CLASS_NAMES,
  COACH_COLORS,
  COACH_SPACING,
  FULL_TRAIN_COMPOSITION,
  LIVERIES,
  coachIndexFor,
  type TrainTypeId,
} from "@/lib/train-model";

type Props = {
  /** e.g. "B4" */
  coach: string;
  berth?: string | number | undefined;
  trainType: TrainTypeId;
  /** Called when the user taps a coach in the 3D scene. */
  onCoachFocus?: ((index: number) => void) | undefined;
  /** Externally requested coach to centre on (from the mini map). */
  focusIndex?: number | null | undefined;
  onCameraMove?: ((x: number) => void) | undefined;
};

function labelTexture(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, w = 256, h = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function Train3DViewer({ coach, berth, trainType, onCoachFocus, focusIndex, onCameraMove }: Props) {
  const host = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const focusRef = useRef<number | null>(null);
  const moveRef = useRef(onCameraMove);
  moveRef.current = onCameraMove;
  const focusCbRef = useRef(onCoachFocus);
  focusCbRef.current = onCoachFocus;

  useEffect(() => {
    focusRef.current = focusIndex ?? null;
  }, [focusIndex]);

  useEffect(() => {
    const mount = host.current;
    if (!mount) return;
    const myIndex = coachIndexFor(coach);
    const livery = LIVERIES[trainType];

    const scene = new THREE.Scene();
    const width = mount.clientWidth || 320;
    const height = mount.clientHeight || 220;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(0, 3.5, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "pan-y";
    renderer.domElement.style.cursor = "grab";

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 0.8);
    key.position.set(5, 10, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.3);
    fill.position.set(-5, 5, -5);
    scene.add(fill);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(item: T) => {
      disposables.push(item);
      return item;
    };

    const wheelGeo = track(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 12));
    const wheelMat = track(new THREE.MeshLambertMaterial({ color: 0x1a1a1a }));
    const bogieGeo = track(new THREE.BoxGeometry(0.8, 0.12, 0.82));
    const bogieMat = track(new THREE.MeshLambertMaterial({ color: 0x333333 }));
    const windowGeo = track(new THREE.BoxGeometry(0.38, 0.32, 0.05));
    const windowMat = track(new THREE.MeshLambertMaterial({ color: 0x88ccff }));

    const coachGroups: THREE.Group[] = [];
    const pickTargets: THREE.Mesh[] = [];
    let userMaterial: THREE.MeshStandardMaterial | null = null;
    let userLabel: THREE.Object3D | null = null;

    FULL_TRAIN_COMPOSITION.forEach((spec, i) => {
      const group = new THREE.Group();
      group.position.x = i * COACH_SPACING;
      const isLoco = spec.type === "loco";
      const isMine = i === myIndex;
      const baseColor = isLoco
        ? COACH_COLORS['loco']!
        : (livery?.body ?? COACH_COLORS[spec.type] ?? 0x555555);

      const bodyGeo = track(isLoco ? new THREE.BoxGeometry(3.8, 1.6, 1.0) : new THREE.BoxGeometry(3.2, 1.4, 0.9));
      const bodyMat = isMine
        ? track(new THREE.MeshStandardMaterial({ color: baseColor, emissive: baseColor, emissiveIntensity: 0.4, roughness: 0.6 }))
        : track(new THREE.MeshLambertMaterial({ color: baseColor }));
      if (isMine) userMaterial = bodyMat as THREE.MeshStandardMaterial;
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.userData['index'] = i;
      group.add(body);
      pickTargets.push(body);

      const darker = new THREE.Color(baseColor).multiplyScalar(0.7).getHex();
      const roofGeo = track(new THREE.BoxGeometry(isLoco ? 3.8 : 3.2, 0.08, isLoco ? 1.02 : 0.92));
      const roofMat = track(new THREE.MeshLambertMaterial({ color: darker }));
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = isLoco ? 0.84 : 0.74;
      group.add(roof);

      if (livery && !isLoco) {
        const stripeGeo = track(new THREE.BoxGeometry(3.2, 0.15, 0.95));
        const stripeMat = track(new THREE.MeshLambertMaterial({ color: livery.stripe }));
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.y = 0.3;
        group.add(stripe);
      }

      if (isLoco) {
        const noseGeo = track(new THREE.BoxGeometry(1.2, 1.2, 1.0));
        const noseMat = track(new THREE.MeshLambertMaterial({ color: baseColor }));
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(-2.3, -0.1, 0);
        group.add(nose);
        const shieldGeo = track(new THREE.BoxGeometry(0.8, 0.5, 0.05));
        const shield = new THREE.Mesh(shieldGeo, windowMat);
        shield.position.set(-2.3, 0.25, 0.51);
        group.add(shield);
        const shieldBack = new THREE.Mesh(shieldGeo, windowMat);
        shieldBack.position.set(-2.3, 0.25, -0.51);
        group.add(shieldBack);
        const pantoGeo = track(new THREE.BoxGeometry(0.05, 0.4, 0.6));
        const pantoMat = track(new THREE.MeshLambertMaterial({ color: 0x9e9e9e }));
        const panto = new THREE.Mesh(pantoGeo, pantoMat);
        panto.position.set(0.4, 1.1, 0);
        group.add(panto);
      } else {
        for (let w = 0; w < 5; w += 1) {
          const x = -1.2 + w * 0.6;
          for (const z of [0.48, -0.48]) {
            const win = new THREE.Mesh(windowGeo, windowMat);
            win.position.set(x, 0.15, z);
            group.add(win);
          }
        }
        const doorGeo = track(new THREE.BoxGeometry(0.18, 0.6, 0.05));
        const doorMat = track(new THREE.MeshLambertMaterial({ color: darker }));
        for (const x of [-1.45, 1.45]) {
          for (const z of [0.47, -0.47]) {
            const door = new THREE.Mesh(doorGeo, doorMat);
            door.position.set(x, -0.2, z);
            group.add(door);
          }
        }
      }

      for (const bx of [-0.9, 0.9]) {
        const frame = new THREE.Mesh(bogieGeo, bogieMat);
        frame.position.set(bx, -0.85, 0);
        group.add(frame);
        for (const z of [0.38, -0.38]) {
          for (const dx of [-0.25, 0.25]) {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.rotation.y = Math.PI / 2;
            wheel.position.set(bx + dx, -0.85, z);
            group.add(wheel);
          }
        }
      }

      if (!isLoco) {
        const tex = track(
          labelTexture((ctx, w, h) => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 56px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(spec.label, w / 2, h / 2);
          }, 256, 110),
        );
        const planeGeo = track(new THREE.PlaneGeometry(0.6, 0.25));
        const planeMat = track(new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
        const plate = new THREE.Mesh(planeGeo, planeMat);
        plate.position.set(1.05, -0.35, 0.47);
        group.add(plate);
        const back = new THREE.Mesh(planeGeo, planeMat);
        back.position.set(-1.05, -0.35, -0.47);
        back.rotation.y = Math.PI;
        group.add(back);
      }

      if (isMine) {
        const ringGeo = track(new THREE.BoxGeometry(3.4, 1.6, 1.05));
        const ringMat = track(new THREE.MeshBasicMaterial({ color: 0xffd700, wireframe: true, transparent: true, opacity: 0.4 }));
        group.add(new THREE.Mesh(ringGeo, ringMat));

        const tex = track(
          labelTexture((ctx, w, h) => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = "rgba(0,0,0,0.55)";
            ctx.fillRect(0, 0, w, h);
            ctx.textAlign = "center";
            ctx.fillStyle = "#ffffff";
            ctx.font = "22px sans-serif";
            ctx.fillText("YOUR COACH", w / 2, 42);
            ctx.fillStyle = "#ffd700";
            ctx.font = "bold 34px sans-serif";
            ctx.fillText(`${coach}${berth ? ` · Berth ${berth}` : ""}`, w / 2, 88);
          }, 512, 128),
        );
        const labelGeo = track(new THREE.PlaneGeometry(2.2, 0.6));
        const labelMat = track(new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
        const label = new THREE.Mesh(labelGeo, labelMat);
        label.position.y = 1.5;
        const arrowTex = track(
          labelTexture((ctx, w, h) => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = "#ffd700";
            ctx.beginPath();
            ctx.moveTo(4, 4);
            ctx.lineTo(w - 4, 4);
            ctx.lineTo(w / 2, h - 4);
            ctx.closePath();
            ctx.fill();
          }, 64, 64),
        );
        const arrowGeo = track(new THREE.PlaneGeometry(0.25, 0.2));
        const arrowMat = track(new THREE.MeshBasicMaterial({ map: arrowTex, transparent: true }));
        const arrow = new THREE.Mesh(arrowGeo, arrowMat);
        arrow.position.y = 1.12;
        const holder = new THREE.Group();
        holder.add(label);
        holder.add(arrow);
        holder.position.y = 0;
        group.add(holder);
        userLabel = holder;
      }

      scene.add(group);
      coachGroups.push(group);
    });

    const minX = -2;
    const maxX = (FULL_TRAIN_COMPOSITION.length - 1) * COACH_SPACING + 2;
    let targetX: number | null = myIndex * COACH_SPACING;
    let cameraX = Math.min(Math.max(targetX - 8, minX), maxX);
    camera.position.x = cameraX;
    let velocity = 0;
    let dragging = false;
    let lastPointerX = 0;
    let moved = 0;
    const clock = new THREE.Clock();

    const setTooltipFor = (index: number) => {
      const spec = FULL_TRAIN_COMPOSITION[index];
      if (!spec) return;
      const cls = CLASS_NAMES[spec.type] ?? spec.type;
      setTooltip(
        index === myIndex
          ? `${spec.label} · ${cls} · ★ Your coach${berth ? ` · Berth ${berth}` : ""}`
          : `${spec.label} · ${cls} · Not your coach`,
      );
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      lastPointerX = e.clientX;
      velocity = 0;
      targetX = null;
      renderer.domElement.setPointerCapture(e.pointerId);
      renderer.domElement.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastPointerX;
      lastPointerX = e.clientX;
      moved += Math.abs(dx);
      const delta = -dx * 0.03;
      cameraX = Math.min(Math.max(cameraX + delta, minX), maxX);
      velocity = delta;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      renderer.domElement.style.cursor = "grab";
      try {
        renderer.domElement.releasePointerCapture(e.pointerId);
      } catch {
        /* capture already gone */
      }
      if (moved < 5) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(pickTargets, false)[0];
        if (hit) {
          const index = hit.object.userData['index'] as number;
          targetX = index * COACH_SPACING;
          velocity = 0;
          setTooltipFor(index);
          focusCbRef.current?.(index);
        }
      }
    };

    const el = renderer.domElement;
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);

    let frame = 0;
    let visible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
      },
      { threshold: 0.05 },
    );
    observer.observe(mount);

    const resize = () => {
      const w = mount.clientWidth || width;
      const h = mount.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visible) return;
      if (focusRef.current !== null) {
        targetX = focusRef.current * COACH_SPACING;
        focusRef.current = null;
      }
      if (targetX !== null) {
        cameraX += (targetX - cameraX) * 0.06;
        if (Math.abs(targetX - cameraX) < 0.01) {
          cameraX = targetX;
          targetX = null;
        }
      } else if (!dragging && Math.abs(velocity) > 0.0005) {
        cameraX = Math.min(Math.max(cameraX + velocity, minX), maxX);
        velocity *= 0.92;
      }
      camera.position.x = cameraX;
      camera.lookAt(cameraX, 0, 0);
      moveRef.current?.(cameraX / COACH_SPACING);
      if (userMaterial) {
        userMaterial.emissiveIntensity = Math.sin(clock.getElapsedTime() * 2) * 0.2 + 0.3;
      }
      if (userLabel) userLabel.quaternion.copy(camera.quaternion);
      renderer.render(scene, camera);
    };
    tick();
    setTooltipFor(myIndex);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      ro.disconnect();
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (el.parentNode) el.parentNode.removeChild(el);
    };
  }, [coach, berth, trainType]);

  return (
    <div className="w-full">
      <div ref={host} className="h-[220px] w-full sm:h-[280px]" aria-label="Interactive 3D train view" />
      {tooltip && <p className="mt-2 text-center text-xs text-muted-foreground">{tooltip}</p>}
    </div>
  );
}
