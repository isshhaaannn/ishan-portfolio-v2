"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  WebGLErrorBoundary,
  WebGLFallback,
} from "./webgl-error-boundary";
import { cn } from "@/lib/utils";
import {
  Cache,
  CanvasTexture,
  DoubleSide,
  LinearFilter,
  Mesh,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from "three";

if (typeof window !== "undefined") {
  Cache.enabled = true;
}
import { sfx } from "@/lib/sfx";
import {
  Suspense,
  type MutableRefObject,
  type WheelEvent,
  useEffect,
  useMemo,
  useRef,
} from "react";

export interface Spiral3DSlide {
  /** Optional unique identifier for the slide/project */
  id?: string;
  /** Image source rendered inside the slide. */
  src: string;
  /** Accessible description for the image. */
  alt: string;
  /** Extra frames of the same project, cycled while the tile is hovered. */
  slides?: string[];
  /** Optional associated project data object */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project?: any;
}

export interface Spiral3DSliderProps {
  /** Images arranged along the spiral. */
  items: Spiral3DSlide[];
  /** Callback when a slide is clicked. */
  onSelect?: (id: string) => void;
  /** Callback when hovering over a slide. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onHover?: (project: any | null) => void;
  /** Changing this value spins the helix (e.g. when a filter changes). */
  spinKey?: string;
  /** Additional classes for the WebGL stage. */
  className?: string;
  /** Maximum horizontal radius of the spiral in pixels. */
  radius?: number;
  /** Vertical distance between neighboring images in pixels. */
  verticalGap?: number;
  /** Maximum width of every image plane in pixels. */
  cardWidth?: number;
  /** Width divided by height for every image plane. */
  cardAspectRatio?: number;
  /** Whether the spiral advances automatically while idle. */
  autoRotate?: boolean;
  /** Automatic movement in slides per second. */
  autoSpeed?: number;
  /** Amount of scroll required to move along the spiral. */
  scrollSensitivity?: number;
  /** Motion smoothing between 0 and 1. */
  smoothing?: number;
  /** Maximum blur applied to distant images. */
  blurStrength?: number;
  /** Amount each image plane bends into the spiral. */
  bend?: number;
  /** Perspective camera field of view in degrees. */
  fov?: number;
  /** Accessible name for the gallery region. */
  ariaLabel?: string;
}

const vertexShader = `
  uniform float uBend;
  uniform float uVel;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    // Speed stretch: fast spins elongate the tiles along the travel axis.
    transformed.y *= 1.0 + min(abs(uVel) * 0.06, 0.28);
    float curve = 1.0 - cos(position.x * 3.14159265);
    transformed.z -= curve * uBend;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  uniform float uBlur;
  uniform float uDim;
  uniform float uVel;
  varying vec2 vUv;

  vec2 coverUv(vec2 uv) {
    vec2 scale = vec2(1.0);
    if (uImageAspect > uPlaneAspect) {
      scale.x = uPlaneAspect / uImageAspect;
    } else {
      scale.y = uImageAspect / uPlaneAspect;
    }
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = coverUv(vUv);
    vec2 stepSize = vec2(0.005) * uBlur;
    // Motion blur along the direction of travel, proportional to spin speed.
    stepSize.y += min(abs(uVel) * 0.0035, 0.03);
    vec4 color = texture2D(uTexture, uv) * 0.23;

    color += texture2D(uTexture, uv + vec2(stepSize.x, 0.0)) * 0.12;
    color += texture2D(uTexture, uv - vec2(stepSize.x, 0.0)) * 0.12;
    color += texture2D(uTexture, uv + vec2(stepSize.x * 2.0, 0.0)) * 0.06;
    color += texture2D(uTexture, uv - vec2(stepSize.x * 2.0, 0.0)) * 0.06;
    color += texture2D(uTexture, uv + vec2(0.0, stepSize.y)) * 0.12;
    color += texture2D(uTexture, uv - vec2(0.0, stepSize.y)) * 0.12;
    color += texture2D(uTexture, uv + vec2(0.0, stepSize.y * 2.0)) * 0.06;
    color += texture2D(uTexture, uv - vec2(0.0, stepSize.y * 2.0)) * 0.06;
    color += texture2D(uTexture, uv + stepSize) * 0.025;
    color += texture2D(uTexture, uv - stepSize) * 0.025;

    float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    color.rgb = mix(vec3(luminance), color.rgb, 1.18);
    color.rgb = (color.rgb - 0.5) * 1.08 + 0.5;
    float brightness = clamp(uDim, 0.15, 1.0);
    gl_FragColor = vec4(clamp(color.rgb * brightness, 0.0, 1.0), 1.0);
  }
`;

function wrappedPosition(value: number, length: number) {
  const wrapped = ((value % length) + length) % length;
  return wrapped > length / 2 ? wrapped - length : wrapped;
}

function imageAspect(texture: Texture) {
  const image = texture.image as
    | {
        naturalWidth?: number;
        naturalHeight?: number;
        width?: number;
        height?: number;
      }
    | undefined;
  const width = image?.naturalWidth ?? image?.width ?? 1;
  const height = image?.naturalHeight ?? image?.height ?? 1;
  return width / Math.max(height, 1);
}

function createPlaceholderTexture(): Texture {
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#141414";
      ctx.fillRect(0, 0, 16, 16);
      ctx.strokeStyle = "#222222";
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 14, 14);
    }
    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    return tex;
  }
  return new Texture();
}

interface SpiralSceneProps {
  items: Spiral3DSlide[];
  targetProgressRef: MutableRefObject<number>;
  radius: number;
  verticalGap: number;
  cardWidth: number;
  cardAspectRatio: number;
  autoRotate: boolean;
  autoSpeed: number;
  smoothing: number;
  blurStrength: number;
  bend: number;
  reducedMotionRef: MutableRefObject<boolean>;
  lastInteractionRef: MutableRefObject<number>;
  isDragSuppressedRef: MutableRefObject<boolean>;
  onSelect?: (id: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onHover?: (project: any | null) => void;
}

function SpiralScene({
  items,
  targetProgressRef,
  radius,
  verticalGap,
  cardWidth,
  cardAspectRatio,
  autoRotate,
  autoSpeed,
  smoothing,
  blurStrength,
  bend,
  reducedMotionRef,
  lastInteractionRef,
  isDragSuppressedRef,
  onSelect,
  onHover,
}: SpiralSceneProps) {
  const sceneItems = useMemo(
    () =>
      Array.from(
        { length: Math.max(items.length, 16) },
        (_, index) => items[index % items.length]!,
      ),
    [items],
  );

  const { gl, viewport } = useThree();
  const progress = useRef(0);
  const velocity = useRef(0);
  const hovered = useRef<number | null>(null);
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const baseTextures = useRef<(Texture | null)[]>([]);
  // One GPU texture per image URL, shared by every tile and reused across filter changes.
  const textureCache = useRef(new Map<string, Texture>());
  const baseUrls = useRef(new Set<string>());
  // Slideshow-only textures, oldest first; capped so hovering many tiles can't exhaust GPU memory.
  const slideLru = useRef<string[]>([]);
  const meshes = useRef<(Mesh | null)[]>([]);
  const materials = useRef<(ShaderMaterial | null)[]>([]);

  // Default placeholder texture
  const placeholderTex = useMemo(() => createPlaceholderTexture(), []);

  const uniforms = useMemo(
    () =>
      sceneItems.map(() => ({
        uTexture: { value: placeholderTex },
        uImageAspect: { value: cardAspectRatio },
        uPlaneAspect: { value: cardAspectRatio },
        uBlur: { value: 0 },
        uDim: { value: 1.0 },
        uBend: { value: 0 },
        uVel: { value: 0 },
      })),
    [cardAspectRatio, placeholderTex, sceneItems],
  );

  // Progressive / Sequential Texture Streaming
  useEffect(() => {
    let isMounted = true;
    const loader = new TextureLoader();

    // The tile set changed (e.g. a filter): per-index state belongs to the old set.
    if (slideTimer.current) clearInterval(slideTimer.current);
    slideTimer.current = null;
    hovered.current = null;
    baseTextures.current = [];

    const applyBase = (index: number, tex: Texture) => {
      baseTextures.current[index] = tex;
      const mat = materials.current[index];
      if (hovered.current === index) return; // a slideshow restores the base on leave
      if (mat) {
        mat.uniforms.uTexture.value = tex;
        mat.uniforms.uImageAspect.value = imageAspect(tex);
      } else if (uniforms[index]) {
        uniforms[index].uTexture.value = tex;
        uniforms[index].uImageAspect.value = imageAspect(tex);
      }
    };

    // Prioritize visible items first (expanding outwards from center 0), then the rest
    const total = sceneItems.length;
    const priorityIndices: number[] = [];
    for (let offset = 0; offset <= 8; offset++) {
      if (offset === 0) {
        priorityIndices.push(0);
      } else {
        if (offset < total) priorityIndices.push(offset);
        const wrappedNeg = (total - offset) % total;
        if (!priorityIndices.includes(wrappedNeg)) priorityIndices.push(wrappedNeg);
      }
    }
    const otherIndices = Array.from({ length: total }, (_, i) => i).filter(
      (i) => !priorityIndices.includes(i),
    );
    const queue = [...priorityIndices, ...otherIndices];

    let activeLoads = 0;
    const maxConcurrent = 3; // Stream up to 3 images concurrently without dropping frames

    const loadNext = () => {
      if (!isMounted || queue.length === 0 || activeLoads >= maxConcurrent) return;

      const index = queue.shift();
      if (index === undefined) return;

      const item = sceneItems[index];
      baseUrls.current.add(item.src);
      const cached = textureCache.current.get(item.src);
      if (cached) {
        applyBase(index, cached);
        loadNext();
        return;
      }

      activeLoads++;
      loader.load(
        item.src,
        (loadedTex) => {
          if (!isMounted) {
            loadedTex.dispose();
            return;
          }
          loadedTex.colorSpace = SRGBColorSpace;
          loadedTex.minFilter = LinearFilter;
          loadedTex.magFilter = LinearFilter;
          loadedTex.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
          loadedTex.needsUpdate = true;

          // Another tile may have loaded the same URL meanwhile: keep one texture.
          const existing = textureCache.current.get(item.src);
          if (existing) {
            loadedTex.dispose();
            applyBase(index, existing);
          } else {
            textureCache.current.set(item.src, loadedTex);
            applyBase(index, loadedTex);
          }

          activeLoads--;
          // Continue sequential loading
          loadNext();
        },
        undefined,
        () => {
          activeLoads--;
          loadNext();
        },
      );

      // Trigger next slot if concurrent capacity allows
      if (activeLoads < maxConcurrent && queue.length > 0) {
        loadNext();
      }
    };

    // Kick off initial loading queue
    loadNext();
    loadNext();

    return () => {
      isMounted = false;
    };
  }, [gl, sceneItems, uniforms]);

  useFrame((_state, delta) => {
    const safeDelta = Math.min(delta, 0.1);

    if (
      autoRotate &&
      performance.now() - lastInteractionRef.current > 300
    ) {
      targetProgressRef.current -= autoSpeed * safeDelta;
    }

    const frameScale = Math.min(safeDelta * 60, 3);
    const ease = reducedMotionRef.current
      ? 1
      : 1 - Math.pow(1 - smoothing, frameScale);
    const before = progress.current;
    progress.current += (targetProgressRef.current - progress.current) * ease;
    // Smoothed spin speed in slides per second (0 under reduced motion).
    const instVel = reducedMotionRef.current ? 0 : (progress.current - before) / Math.max(safeDelta, 1e-3);
    velocity.current += (instVel - velocity.current) * 0.18;

    const factor = Math.max(viewport.factor, 1);
    const planeWidth = Math.min(cardWidth / factor, viewport.width * 0.225);
    const planeHeight = planeWidth / cardAspectRatio;
    const spiralRadius = Math.min(radius / factor, viewport.width * 0.245);
    const gap = Math.min(verticalGap / factor, viewport.height * 0.082);
    const count = sceneItems.length;

    meshes.current.forEach((mesh, index) => {
      const material = materials.current[index];
      if (!mesh || !material) return;

      const position = wrappedPosition(index - progress.current, count);

      // Frustum & viewport culling: Skip rendering and heavy uniform math for cards outside view
      const isVisible = Math.abs(position) <= 7.5;
      mesh.visible = isVisible;
      if (!isVisible) return;

      const angle = position * 0.78;
      const depth = (Math.cos(angle) + 1) / 2;
      const scale = 0.74 + depth * 0.26;

      mesh.position.set(
        Math.sin(angle) * spiralRadius,
        -position * gap,
        Math.cos(angle) * 2.55,
      );
      mesh.rotation.set(0, Math.sin(angle) * -1.12, 0);
      mesh.scale.set(planeWidth * scale, planeHeight * scale, 1);

      // Middle 3 cards (|position| <= 1.25) are unblurred & 100% bright.
      const distFromMiddle3 = Math.max(0, Math.abs(position) - 1.25);
      const effectiveBlur = Math.pow(distFromMiddle3, 1.5) * (blurStrength > 0 ? blurStrength * 1.5 : 2.5);
      const effectiveDim = Math.max(0.18, 1.0 - Math.pow(distFromMiddle3, 1.2) * 0.32);

      material.uniforms.uBlur!.value = effectiveBlur;
      material.uniforms.uDim!.value = effectiveDim;
      material.uniforms.uBend!.value = planeWidth * bend;
      material.uniforms.uPlaneAspect!.value = cardAspectRatio;
      material.uniforms.uVel!.value = velocity.current;
    });
  });

  // Hover slideshow: flip through a project's own slides, like swiping a carousel.
  const setTileTexture = (index: number, tex: Texture) => {
    const mat = materials.current[index];
    if (!mat) return;
    mat.uniforms.uTexture.value = tex;
    mat.uniforms.uImageAspect.value = imageAspect(tex);
  };
  const loadCached = (url: string, done: (tex: Texture) => void) => {
    const hit = textureCache.current.get(url);
    if (hit) return done(hit);
    new TextureLoader().load(url, (tex) => {
      const raced = textureCache.current.get(url);
      if (raced) { tex.dispose(); return done(raced); }
      tex.colorSpace = SRGBColorSpace;
      tex.minFilter = LinearFilter;
      tex.magFilter = LinearFilter;
      tex.needsUpdate = true;
      textureCache.current.set(url, tex);
      if (!baseUrls.current.has(url)) {
        slideLru.current.push(url);
        // Evict the oldest slideshow textures beyond the cap (never a tile's own cover).
        while (slideLru.current.length > 24) {
          const old = slideLru.current.shift()!;
          const oldTex = textureCache.current.get(old);
          const inUse = materials.current.some((m) => m?.uniforms.uTexture.value === oldTex);
          if (oldTex && !inUse && !baseUrls.current.has(old)) {
            oldTex.dispose();
            textureCache.current.delete(old);
          } else if (inUse) {
            slideLru.current.push(old);
            break;
          }
        }
      }
      done(tex);
    });
  };
  function startSlideshow(index: number) {
    hovered.current = index;
    const slides = sceneItems[index]?.slides ?? [];
    if (slides.length < 2 || reducedMotionRef.current) return;
    let frame = 0;
    slides.slice(1, 4).forEach((u) => loadCached(u, () => {})); // warm the next few frames
    slideTimer.current = setInterval(() => {
      if (hovered.current !== index) return;
      frame = (frame + 1) % slides.length;
      loadCached(slides[frame]!, (tex) => {
        if (hovered.current === index) setTileTexture(index, tex);
      });
    }, 650);
  }
  function stopSlideshow() {
    if (slideTimer.current) clearInterval(slideTimer.current);
    slideTimer.current = null;
    const index = hovered.current;
    hovered.current = null;
    if (index == null) return;
    const base = baseTextures.current[index] ?? textureCache.current.get(sceneItems[index]?.src ?? "");
    if (base) setTileTexture(index, base);
  }
  useEffect(() => () => { if (slideTimer.current) clearInterval(slideTimer.current); }, []);

  return (
    <>
      {sceneItems.map((item, index) => (
        <mesh
          key={`${item.src}-${index}`}
          ref={(node) => {
            meshes.current[index] = node;
          }}
          frustumCulled={false}
          onClick={(e) => {
            e.stopPropagation();
            // Suppress accidental click if user was dragging/spinning
            if (isDragSuppressedRef.current) return;
            if (item.id) {
              sfx.open();
              onSelect?.(item.id);
            }
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
            if (hovered.current !== index) {
              stopSlideshow();
              startSlideshow(index);
              sfx.tick();
            }
            if (item.project) onHover?.(item.project);
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
            stopSlideshow();
            onHover?.(null);
          }}
        >
          <planeGeometry args={[1, 1, 48, 2]} />
          <shaderMaterial
            ref={(node) => {
              materials.current[index] = node;
            }}
            uniforms={uniforms[index]}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            side={DoubleSide}
            depthTest
            depthWrite
          />
        </mesh>
      ))}
    </>
  );
}

export function Spiral3DSlider({
  items,
  onSelect,
  onHover,
  className,
  radius = 235,
  verticalGap = 64,
  cardWidth = 255,
  cardAspectRatio = 3 / 2,
  autoRotate = true,
  autoSpeed = 0.35,
  scrollSensitivity = 0.0024,
  smoothing = 0.065,
  blurStrength = 0,
  bend = 0.17,
  fov = 44,
  ariaLabel = "Spiral image gallery",
  spinKey,
}: Spiral3DSliderProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const targetProgress = useRef(0);
  const previousScroll = useRef(0);
  const lastWheelTime = useRef(0);
  const lastInteraction = useRef(0);
  const visible = useRef(true);
  const reducedMotion = useRef(false);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartX = useRef(0);
  const totalDragDist = useRef(0);
  const isDragSuppressed = useRef(false);

  // A filter change spins the helix a few turns so the new set "deals in".
  const firstSpin = useRef(true);
  useEffect(() => {
    if (firstSpin.current) { firstSpin.current = false; return; }
    targetProgress.current += 9;
    lastInteraction.current = performance.now();
  }, [spinKey]);

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        targetProgress.current += 1;
        lastInteraction.current = performance.now();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        targetProgress.current -= 1;
        lastInteraction.current = performance.now();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    previousScroll.current = window.scrollY;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => {
      reducedMotion.current = motionQuery.matches;
    };
    syncMotionPreference();
    motionQuery.addEventListener("change", syncMotionPreference);

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = Boolean(entry?.isIntersecting);
      },
      { threshold: 0.08 },
    );
    observer.observe(stage);

    const handlePageScroll = () => {
      const scrollY = window.scrollY;
      const delta = scrollY - previousScroll.current;
      previousScroll.current = scrollY;
      if (Math.abs(delta) > 0.5 && visible.current && performance.now() - lastWheelTime.current > 80) {
        lastInteraction.current = performance.now();
        const boundedDelta = Math.sign(delta) * Math.min(Math.abs(delta), 160);
        targetProgress.current -= boundedDelta * scrollSensitivity;
      }
    };
    window.addEventListener("scroll", handlePageScroll, { passive: true });

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", syncMotionPreference);
      window.removeEventListener("scroll", handlePageScroll);
    };
  }, [scrollSensitivity]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    lastWheelTime.current = performance.now();
    lastInteraction.current = lastWheelTime.current;
    const delta =
      Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY), 160);
    targetProgress.current -= delta * scrollSensitivity;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    dragStartY.current = event.clientY;
    dragStartX.current = event.clientX;
    totalDragDist.current = 0;
    isDragSuppressed.current = false;
    lastInteraction.current = performance.now();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    lastInteraction.current = performance.now();
    const deltaY = event.clientY - dragStartY.current;
    const deltaX = event.clientX - dragStartX.current;
    totalDragDist.current += Math.hypot(deltaX, deltaY);
    if (totalDragDist.current > 7) {
      isDragSuppressed.current = true;
    }
    dragStartY.current = event.clientY;
    dragStartX.current = event.clientX;
    const dragDelta = deltaY * 1.2 - deltaX * 0.4;
    targetProgress.current -= dragDelta * scrollSensitivity * 1.4;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    // Release drag suppression on a short timeout so synchronous onClick gets suppressed
    setTimeout(() => {
      isDragSuppressed.current = false;
    }, 120);
  };

  if (!items.length) return null;

  return (
    <div
      ref={stageRef}
      role="region"
      aria-label={ariaLabel}
      className={cn(
        "relative min-h-168 w-full overflow-hidden bg-transparent select-none transition-colors duration-300 touch-none",
        className,
      )}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <WebGLErrorBoundary
        fallback={<WebGLFallback className="absolute inset-0 h-full w-full" />}
      >
        <div className="absolute inset-0">
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 10], fov, near: 0.1, far: 100 }}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: "high-performance",
            }}
          >
            <Suspense fallback={null}>
              <SpiralScene
                items={items}
                targetProgressRef={targetProgress}
                radius={radius}
                verticalGap={verticalGap}
                cardWidth={cardWidth}
                cardAspectRatio={cardAspectRatio}
                autoRotate={autoRotate}
                autoSpeed={autoSpeed}
                smoothing={smoothing}
                blurStrength={blurStrength}
                bend={bend}
                reducedMotionRef={reducedMotion}
                lastInteractionRef={lastInteraction}
                isDragSuppressedRef={isDragSuppressed}
                onSelect={onSelect}
                onHover={onHover}
              />
            </Suspense>
          </Canvas>
        </div>
      </WebGLErrorBoundary>

      <div className="sr-only">
        <p>{ariaLabel}</p>
        <ul>
          {items.map((item, index) => (
            <li key={`${item.src}-description-${index}`}>{item.alt}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
