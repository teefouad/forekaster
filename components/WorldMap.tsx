/**
 * Dependency imports
 */
import React from 'react';
import styled from '@emotion/styled';
import * as Three from 'three';

/**
 * Local imports
 */
import CloudTooltip from './CloudTooltip';
import { toRem } from '../utils/text';
import * as easing from '../utils/easing';

/**
 * Threejs Setup
 */
const degToRad = (deg: number) => deg * Math.PI / 180;

const getProjectedPosition = (obj3d: Three.Object3D, camera: Three.Camera, canvas: HTMLCanvasElement) => {
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
};

let existing3DWorld: any;

const setup3DWorld = (canvas: HTMLCanvasElement) => {
  if (existing3DWorld) return existing3DWorld;

  const fieldOfView = 20;
  const aspectRatio = 2; // default aspect ratio for canvas

  const scene = new Three.Scene();
  const camera = new Three.PerspectiveCamera(fieldOfView, aspectRatio, 0.1, 1000);
  const renderer = new Three.WebGLRenderer({ canvas, alpha: true, antialias: true });

  // Create globe
  const globeGeometry = new Three.SphereGeometry(10, 100, 100);
  const globeTexture = new Three.TextureLoader().load('/world-map.png');
  const globeMaterial = new Three.MeshBasicMaterial({ map: globeTexture, transparent: true });
  const globe = new Three.Mesh(globeGeometry, globeMaterial);

  globeTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  
  globe.rotation.x = degToRad(30);
  globe.rotation.y = degToRad(-100);

  camera.position.x = 0;
  camera.position.z = 60;

  scene.add(globe);

  existing3DWorld = {
    scene,
    camera,
    renderer,
    globe,
  };

  return existing3DWorld;
};

/**
 * Root
 */
const Root = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 85vw;
  height: 85vw;
  margin-left: ${toRem(300)};
  transform: translate(-50%, -50%);
  
  canvas {
    width: 100%;
    height: 100%;
  }

  .map-marker {
    position: absolute;
    top: 0;
    left: 0;
    padding: 0;
    cursor: pointer;
    outline: none;
    border: none;
    background: transparent;
  }
  
  .map-marker__pin {
    display: block;
    width: ${toRem(22)};
    height: ${toRem(22 * 1.33)};
    margin-left: ${toRem(-22 * 0.5)};
    position: absolute;
    bottom: 0;
    left: 50%;
    background: url(/marker.png) no-repeat 50%;
    background-size: contain;
    opacity: 0;
    transform: scale(0);
    transform-origin: center bottom;
    transition: opacity 150ms ease-in-out, transform 150ms ease-in-out;
  }

  .map-marker__label {
    position: absolute;
    bottom: ${toRem(44)};
    left: 50%;
    padding: ${toRem(2)} ${toRem(5)};
    font-family: Nunito, sans-serif;
    font-size: ${toRem(11)};
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    pointer-events: none;
    white-space: nowrap;
    opacity: 0;
    color: #333;
    background-color: #fff;
    border-radius: ${toRem(4)};
    transform: translate(-50%, 20%);
    transition:
      opacity 150ms ${easing.easyBack},
      transform 150ms ${easing.easyBack};
  }

  /* Active */
  
  .map-marker[data-active="1"] {
    .map-marker__pin {
      opacity: 0.8;
      transform: scale(1);
    }
  }

  /* Hover */

  .map-marker:hover {
    z-index: 9999999 !important;

    .map-marker__pin {
      opacity: 1;
      transform: scale(1.35);
      transition-timing-function: ${easing.easyBack};
    }

    .map-marker__label {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
`;

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
  markers: Marker[],
  autoOrbit?: boolean,
  target?: { lat: number, lon: number },
  zoom?: number,
}

export type WorldMapCombinedProps = WorldMapProps & JSX.IntrinsicElements['div'];

const WorldMap: React.FC<WorldMapCombinedProps> = ({
  autoOrbit = true,
  markers,
  ...props
}) => {
  const rootRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  
  React.useEffect(() => {
    const raf = window.requestAnimationFrame;
    const caf = window.cancelAnimationFrame;

    const root = rootRef.current! as HTMLDivElement;
    const canvas = canvasRef.current! as HTMLCanvasElement;

    const {
      scene,
      camera,
      renderer,
      globe,
    } = setup3DWorld(canvas);

    // Auto-orbit
    const maxOrbitSpeed = degToRad(0.025);
    const orbitAcceleration = degToRad(0.00005);

    let orbitSpeed = maxOrbitSpeed;
    let orbiting = true;
    let orbitingTimeout: any = null;

    // Mouse interactivity
    let isDragging = false;

    const draggingFactor = 0.001;

    const dragData = {
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
    };

    const startDrag = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      orbiting = false;
      orbitSpeed = 0;

      clearTimeout(orbitingTimeout);

      const event = (e as TouchEvent).touches?.[0] ?? e;

      dragData.x0 = event.pageX;
      dragData.y0 = event.pageY;
      dragData.x1 = event.pageX;
      dragData.y1 = event.pageY;
      dragData.dx = 0;
      dragData.dy = 0;
      dragData.rx0 = globe.rotation.x;
      dragData.ry0 = globe.rotation.y;

      window.addEventListener('mousemove', dragging);
      window.addEventListener('touchmove', dragging);
    };
    
    const dragging = (e: MouseEvent | TouchEvent) => {
      dragData.px = dragData.x1;
      dragData.py = dragData.y1;

      const event = (e as TouchEvent).touches?.[0] ?? e;

      dragData.x1 = event.pageX;
      dragData.y1 = event.pageY;

      dragData.dx = dragData.x1 - dragData.px;
      dragData.dy = dragData.y1 - dragData.py;

      globe.rotation.x = dragData.rx0 + draggingFactor * (dragData.y1 - dragData.y0);
      globe.rotation.y = dragData.ry0 + draggingFactor * (dragData.x1 - dragData.x0);

      globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globe.rotation.x));
    };

    const stopDrag = () => {
      isDragging = false;
      window.removeEventListener('mousemove', dragging);
      window.removeEventListener('touchmove', dragging);

      if (autoOrbit) {
        orbitingTimeout = setTimeout(() => {
          orbiting = true;
        }, 15000);
      }
    };

    root.addEventListener('mousedown', startDrag);
    root.addEventListener('touchstart', startDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);

    // Resize canvas
    const resizeCanvas = () => {
      const pixelRatio = 2 * window.devicePixelRatio;
      const width  = window.innerHeight * pixelRatio;
      const height = window.innerHeight * pixelRatio;

      renderer.setSize(width, height, false);
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resizeCanvas();
    
    window.addEventListener('resize', resizeCanvas);

    // Map markers
    const mapMarkers = new Map<HTMLElement, Three.Object3D>();

    markers.forEach((marker) => {
      const positionHelper = new Three.Object3D();
      const latHelper = new Three.Object3D();
      const lonHelper = new Three.Object3D();

      latHelper.add(positionHelper);
      lonHelper.add(latHelper);
      globe.add(lonHelper);

      positionHelper.position.z = 10;

      latHelper.rotation.x = degToRad(-marker.lat - 1.35);
      lonHelper.rotation.y = degToRad(marker.lon + 90 + 0.3);

      const markerElement: HTMLElement = root.querySelector(`.map-marker[dragData-id='${marker.id}']`)!;

      if (markerElement) {
        mapMarkers.set(markerElement, positionHelper);
      }
    });

    const updateMarkers = () => {
      mapMarkers.forEach((markerPositionHelper, markerElement) => {
        const markerProjectedPosition = getProjectedPosition(markerPositionHelper, camera, canvas);
    
        // move the marker to projected position
        markerElement!.style.transform = `translate(-50%, -50%) translate(${markerProjectedPosition.x}px,${markerProjectedPosition.y}px)`;
    
        // set the zIndex for sorting
        markerElement!.style.zIndex = (+markerProjectedPosition.z.toFixed(4) * 10000).toString();

        // set marker visibility
        const globeProjectedPosition = getProjectedPosition(globe, camera, canvas);
        const dx = markerProjectedPosition.x - globeProjectedPosition.x;
        const dy = markerProjectedPosition.y - globeProjectedPosition.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        const isActive = (
          markerProjectedPosition.worldPosition.z > 0
          && d < canvas.clientHeight * (dx > 0 ? 0.45 : 0.64)
          && Math.abs(dy) < canvas.clientHeight * 0.4
        );

        markerElement.setAttribute('data-active', isActive ? '1' : '0');
      });
    };
    
    // Update animation
    let frame = raf(function render() {
      if (!isDragging) {
        if (autoOrbit && orbiting) {
          if (Math.abs(dragData.dx) < 0.1) {
            orbitSpeed = Math.min(maxOrbitSpeed, orbitSpeed + orbitAcceleration);
            globe.rotation.y += orbitSpeed;
          }
  
          if (Math.abs(dragData.dy) < 0.1) {
            globe.rotation.x += (degToRad(30) - globe.rotation.x) / 3333;
          }
        }
        
        globe.rotation.x += draggingFactor * dragData.dy;
        globe.rotation.y += draggingFactor * dragData.dx;

        dragData.dx *= 0.9;
        dragData.dy *= 0.9;
      }

      globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globe.rotation.x));

      updateMarkers();

      renderer.render(scene, camera);
      
      frame = raf(render);
    });
    
    return () => {
      caf(frame);
      root.removeEventListener('mousedown', startDrag);
      root.removeEventListener('touchstart', startDrag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('toucend', stopDrag);
      window.removeEventListener('mousemove', dragging);
      window.removeEventListener('touchmove', dragging);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [markers]);
  
  return (
    <Root ref={rootRef} {...props}>
      <canvas ref={canvasRef} width={300} height={150} />

      {
        markers.map((marker) => (
          <button key={marker.id} className="map-marker" data-id={marker.id}>
            <CloudTooltip label={marker.label} offset={48}>
              <span className="map-marker__pin" />
            </CloudTooltip>
          </button>
        ))
      }
    </Root>
  );
};

WorldMap.defaultProps = {};

export default WorldMap;
