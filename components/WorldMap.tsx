/**
 * Dependency imports
 */
import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import * as Three from 'three';

/**
 * Local imports
*/
import { toRem } from '../utils/text';
import { animate, raf } from '../utils/animation';

/**
 * World3D Class
 */
class World3D {
  scene: Three.Scene;

  camera: Three.PerspectiveCamera;

  renderer: Three.WebGLRenderer;

  globe: Three.Mesh<Three.SphereGeometry, Three.MeshBasicMaterial>;

  constructor(canvas: HTMLCanvasElement, fieldOfView = 20, aspectRatio = 2) {
    this.scene = new Three.Scene();
    this.camera = new Three.PerspectiveCamera(fieldOfView, aspectRatio, 0.1, 1000);
    this.renderer = new Three.WebGLRenderer({ canvas, alpha: true, antialias: true });

    const globeGeometry = new Three.SphereGeometry(10, 100, 100);
    const globeTexture = new Three.TextureLoader().load('/world-map.png');
    const globeMaterial = new Three.MeshBasicMaterial({ map: globeTexture, transparent: true });
    
    globeTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    this.globe = new Three.Mesh(globeGeometry, globeMaterial);
    this.globe.rotation.x = World3D.helpers.degToRad(30);
    this.globe.rotation.y = World3D.helpers.degToRad(-100);

    this.camera.position.x = 0;
    this.camera.position.z = 60;

    this.scene.add(this.globe);
  }

  update() {
    this.renderer.render(this.scene, this.camera);
  }

  static helpers = {
    degToRad: (deg: number) => deg * Math.PI / 180,

    radToDeg: (deg: number) => deg * 180 / Math.PI,

    getProjectedPosition: (obj3d: Three.Object3D, camera: Three.Camera, canvas: HTMLCanvasElement) => {
      const position = new Three.Vector3();
        
      obj3d.updateWorldMatrix(true, true);
      obj3d.getWorldPosition(position);

      const projectedPosition = new Three.Vector3();

      projectedPosition.copy(position);
      projectedPosition.project(camera);

      const x = (projectedPosition.x * 0.5 + 0.5) * canvas.clientWidth;
      const y = (projectedPosition.y * -0.5 + 0.5) * canvas.clientHeight;
      const z = position.z ?? 0;

      return { x, y, z, worldPosition: position };
    },
  };
}

/**
 * Root
 */
const Root = styled('div', {
  shouldForwardProp: (prop: PropertyKey) => !([]).includes(prop.toString()),
})<Partial<WorldMapCombinedProps>>((props) => css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  
  canvas {
    width: 100%;
    height: 100%;
  }
`);

/**
 * WorldMap Component
 */
export interface Marker {
  id: string,
  label: string,
  lat: number,
  lon: number,
}

export interface WorldMapProps {
  markers?: Marker[],
  showMarkers?: boolean,
  interactive?: boolean,
  autoOrbit?: 'fast' | 'slow' | 'off',
  target?: { lat: number, lon: number },
  zoom?: number,
  dragFriction?: number,
  onDragStart?: () => void,
  onDragStop?: () => void,
  onMarkerClick?: () => void,
}

export type WorldMapCombinedProps = WorldMapProps & JSX.IntrinsicElements['div'];

const WorldMap: React.FC<WorldMapCombinedProps> = ({
  markers = [],
  showMarkers = true,
  interactive = true,
  autoOrbit = false,
  target,
  zoom = 1,
  dragFriction = 500,
  onDragStart,
  onDragStop,
  onMarkerClick,
  ...props
}) => {
  const rootRef = React.useRef(null);
  const worldRef = React.useRef<World3D | null>(null);
  const dragDataRef = React.useRef({
    active: false,
    x0: 0,
    y0: 0,
    x1: 0,
    y1: 0,
    rx0: 0,
    ry0: 0,
    dx: 0,
    dy: 0,
    px: 0,
    py: 0,
  });
  const orbitDataRef = React.useRef({
    active: autoOrbit !== 'off',
    speed: autoOrbit === 'slow' ? World3D.helpers.degToRad(0.05) : 0,
    maxSpeed: World3D.helpers.degToRad(0.5),
    acceleration: World3D.helpers.degToRad(0.0005),
    timeout: null,
    fastOrbiting: false,
  });

  React.useEffect(() => {
    if (!worldRef.current || !target) return;

    animate(worldRef.current.globe.rotation, {
      y: { to: World3D.helpers.degToRad(-target.lon - 90 - 0.3) },
      x: { to: World3D.helpers.degToRad(target.lat + 1.35) },
    });
  }, [target]);

  React.useEffect(() => {
    if (!worldRef.current) return;

    const cameraZoom = Math.max(1, Math.min(10, zoom));

    animate(worldRef.current.camera.position, {
      z: { to: 60 - 5 * (cameraZoom - 1) },
    });
  }, [zoom]);

  React.useEffect(() => {
    const root = rootRef.current! as HTMLDivElement;
    const canvas = root.querySelector('canvas') as HTMLCanvasElement;

    worldRef.current = worldRef.current ?? new World3D(canvas);

    // Mouse/Touch interactivity
    const startDrag = (e: MouseEvent | TouchEvent) => {
      if (!worldRef.current) return;

      const event = (e as TouchEvent).touches?.[0] ?? e;

      dragDataRef.current.active = true;
      dragDataRef.current.x0 = event.pageX;
      dragDataRef.current.y0 = event.pageY;
      dragDataRef.current.x1 = event.pageX;
      dragDataRef.current.y1 = event.pageY;
      dragDataRef.current.dx = 0;
      dragDataRef.current.dy = 0;
      dragDataRef.current.rx0 = worldRef.current.globe.rotation.x;
      dragDataRef.current.ry0 = worldRef.current.globe.rotation.y;

      window.addEventListener('mousemove', dragging);
      window.addEventListener('touchmove', dragging);
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchend', stopDrag);

      onDragStart?.();
    };
    
    const dragging = (e: MouseEvent | TouchEvent) => {
      if (!worldRef.current) return;
      
      const event = (e as TouchEvent).touches?.[0] ?? e;

      dragDataRef.current.px = dragDataRef.current.x1;
      dragDataRef.current.py = dragDataRef.current.y1;

      dragDataRef.current.x1 = event.pageX;
      dragDataRef.current.y1 = event.pageY;

      dragDataRef.current.dx = dragDataRef.current.x1 - dragDataRef.current.px;
      dragDataRef.current.dy = dragDataRef.current.y1 - dragDataRef.current.py;

      worldRef.current.globe.rotation.x = dragDataRef.current.rx0 + (1 / dragFriction) * (dragDataRef.current.y1 - dragDataRef.current.y0);
      worldRef.current.globe.rotation.y = dragDataRef.current.ry0 + (1 / dragFriction) * (dragDataRef.current.x1 - dragDataRef.current.x0);

      worldRef.current.globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, worldRef.current.globe.rotation.x));
    };

    const stopDrag = () => {
      dragDataRef.current.active = false;

      window.removeEventListener('mousemove', dragging);
      window.removeEventListener('touchmove', dragging);

      onDragStop?.();
    };

    if (interactive) {
      root.addEventListener('mousedown', startDrag);
      root.addEventListener('touchstart', startDrag);
    }

    // Resize canvas
    const resizeCanvas = () => {
      if (!worldRef.current) return;

      const pixelRatio = 2 * window.devicePixelRatio;
      const width  = window.innerHeight * pixelRatio;
      const height = window.innerHeight * pixelRatio;

      worldRef.current.renderer.setSize(width, height, false);
      
      worldRef.current.camera.aspect = width / height;
      worldRef.current.camera.updateProjectionMatrix();
    };

    resizeCanvas();
    
    window.addEventListener('resize', resizeCanvas);

    // Update animation
    const stopAnimation = raf(() => {
      if (worldRef.current) {
        // handle inertia
        worldRef.current.globe.rotation.x += (1 / dragFriction) * dragDataRef.current.dy;
        worldRef.current.globe.rotation.y += (1 / dragFriction) * dragDataRef.current.dx;
        dragDataRef.current.dx *= 0.9;
        dragDataRef.current.dy *= 0.9;

        // handle autoOrbit
        if (autoOrbit === 'slow') {
          if (!dragDataRef.current.active) {
            orbitDataRef.current.speed = Math.min(orbitDataRef.current.maxSpeed, orbitDataRef.current.speed + orbitDataRef.current.acceleration);
            worldRef.current.globe.rotation.x += (World3D.helpers.degToRad(30) - worldRef.current.globe.rotation.x) / 3333;
          } else {
            orbitDataRef.current.speed = 0;
          }
        } else
        if (autoOrbit === 'fast') {
          if (!orbitDataRef.current.fastOrbiting) {
            orbitDataRef.current.fastOrbiting = true;
            worldRef.current.globe.rotation.x = 0;

            animate({ value: 0 }, {
              value: {
                from: World3D.helpers.radToDeg(worldRef.current.globe.rotation.y),
                to: World3D.helpers.radToDeg(worldRef.current.globe.rotation.y) + 360,
                easing: 'easeInOutCubic',
                onChange: ({ value }) => {
                  if (worldRef.current) {
                    worldRef.current.globe.rotation.y = World3D.helpers.degToRad(value);
                  }
                },
                onFinish: () => {
                  orbitDataRef.current.fastOrbiting = false;
                },
              },
            });
          }
        } else {
          orbitDataRef.current.speed = 0;
        }

        worldRef.current.globe.rotation.y += orbitDataRef.current.speed;
        
        // cap globe rotation
        worldRef.current.globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, worldRef.current.globe.rotation.x));
      }
      
      // render world
      worldRef.current?.update();
    });

    // Clean up
    return () => {
      stopAnimation();
      root.removeEventListener('mousedown', startDrag);
      root.removeEventListener('touchstart', startDrag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('toucend', stopDrag);
      window.removeEventListener('mousemove', dragging);
      window.removeEventListener('touchmove', dragging);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [
    // markers,
    // showMarkers,
    interactive,
    autoOrbit,
    // target,
    // zoom,
    dragFriction,
    onDragStart,
    onDragStop,
  ]);

  return (
    <Root ref={rootRef} {...props}>
      <canvas width={300} height={150} />
    </Root>
  );
};

export default WorldMap;
