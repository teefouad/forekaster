/**
 * Dependency imports
 */
import React from 'react';
import styled from '@emotion/styled';
import * as Three from 'three';

/**
 * Local imports
 */
import { toRem } from '../utils/text';

/**
 * Root
 */
const Root = styled.div`
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  .map-marker {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    cursor: pointer;
    outline: none;
    border: none;
    background: transparent;

    &[data-active="1"] {
      opacity: 1;
    }
  }

  .map-marker__pin {
    display: block;
    width: ${toRem(20)};
    height: ${toRem(20)};
    background-color: #000;
    border-radius: 50%;
  }

  .map-marker__label {
    display: none;
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
}

export type WorldMapCombinedProps = WorldMapProps & JSX.IntrinsicElements['div'];

const WorldMap: React.FC<WorldMapCombinedProps> = ({
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

    const fieldOfView = 20;
    const aspectRatio = 2; // default aspect ratio for canvas

    const scene = new Three.Scene();
    const camera = new Three.PerspectiveCamera(fieldOfView, aspectRatio, 0.1, 1000);
    const renderer = new Three.WebGLRenderer({ canvas, alpha: true, antialias: true });

    // Create globe
    const globeGeometry = new Three.SphereGeometry(10, 100, 100);
    const globeTexture = new Three.TextureLoader().load('/world-map.jpg');
    const globeMaterial = new Three.MeshBasicMaterial({ map: globeTexture });
    const globe = new Three.Mesh(globeGeometry, globeMaterial);

    // Helpers
    const degToRad = (deg: number) => deg * Math.PI / 180;

    const getProjectedPosition = (obj3d: Three.Object3D) => {
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


    // Setup
    const maxOrbitSpeed = degToRad(0.025);
    const orbitAcceleration = degToRad(0.00005);

    let orbitSpeed = maxOrbitSpeed;
    let orbiting = true;
    let orbitingTimeout: any = null;

    globe.rotation.x = degToRad(30);
    globe.rotation.y = degToRad(-100);

    globeTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    camera.position.x = -5;
    camera.position.z = 40;

    scene.add(globe);

    // Mouse interactivity
    let isDragging = false;

    const draggingFactor = 0.001;

    const data = {
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

    const startDrag = (e: MouseEvent) => {
      isDragging = true;
      orbiting = false;
      orbitSpeed = 0;

      clearTimeout(orbitingTimeout);

      data.x0 = e.pageX;
      data.y0 = e.pageY;
      data.rx0 = globe.rotation.x;
      data.ry0 = globe.rotation.y;

      window.addEventListener('mousemove', dragging);
    };

    const dragging = (e: MouseEvent) => {
      data.px = data.x1;
      data.py = data.y1;

      data.x1 = e.pageX;
      data.y1 = e.pageY;

      data.dx = data.x1 - data.px;
      data.dy = data.y1 - data.py;

      globe.rotation.x = data.rx0 + draggingFactor * (data.y1 - data.y0);
      globe.rotation.y = data.ry0 + draggingFactor * (data.x1 - data.x0);

      globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globe.rotation.x));
    };

    const stopDrag = (e: MouseEvent) => {
      isDragging = false;
      window.removeEventListener('mousemove', dragging);

      orbitingTimeout = setTimeout(() => {
        orbiting = true;
      }, 15000);
    };

    root.addEventListener('mousedown', startDrag);
    window.addEventListener('mouseup', stopDrag);

    // Resize canvas
    const resizeCanvas = () => {
      const pixelRatio = window.devicePixelRatio;
      const width  = window.innerWidth * pixelRatio;
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

      const markerElement: HTMLElement = root.querySelector(`.map-marker[data-id='${marker.id}']`)!;

      if (markerElement) {
        mapMarkers.set(markerElement, positionHelper);
      }
    });

    const updateMarkers = () => {
      mapMarkers.forEach((markerPositionHelper, markerElement) => {
        const markerProjectedPosition = getProjectedPosition(markerPositionHelper);
    
        // move the marker to projected position
        markerElement!.style.transform = `translate(-50%, -50%) translate(${markerProjectedPosition.x}px,${markerProjectedPosition.y}px)`;
    
        // set the zIndex for sorting
        markerElement!.style.zIndex = (+markerProjectedPosition.z.toFixed(4) * 10000).toString();

        // set marker visibility
        const globeProjectedPosition = getProjectedPosition(globe);
        const dx = markerProjectedPosition.x - globeProjectedPosition.x;
        const dy = markerProjectedPosition.y - globeProjectedPosition.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        const isActive = (
          markerProjectedPosition.worldPosition.z > 0
          && d < window.innerHeight * (dx > 0 ? 0.45 : 0.64)
          && Math.abs(dy) < window.innerHeight * 0.4
        );

        markerElement.setAttribute('data-active', isActive ? '1' : '0');
      });
    };
    
    // Update animation
    let frame = raf(function render() {
      if (!isDragging) {
        if (orbiting) {
          if (Math.abs(data.dx) < 0.1) {
            orbitSpeed = Math.min(maxOrbitSpeed, orbitSpeed + orbitAcceleration);
            globe.rotation.y += orbitSpeed;
          }
  
          if (Math.abs(data.dy) < 0.1) {
            globe.rotation.x += (degToRad(30) - globe.rotation.x) / 3333;
          }
        }
        
        globe.rotation.x += draggingFactor * data.dy;
        globe.rotation.y += draggingFactor * data.dx;

        data.dx *= 0.9;
        data.dy *= 0.9;
      }

      globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globe.rotation.x));

      updateMarkers();

      renderer.render(scene, camera);
      
      frame = raf(render);
    });
    
    return () => {
      caf(frame);
      root.removeEventListener('mousedown', startDrag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('mousemove', dragging);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [markers]);
  
  return (
    <Root ref={rootRef} {...props}>
      <canvas ref={canvasRef} width={300} height={150} />

      {
        markers.map((marker) => (
          <button key={marker.id} className="map-marker" data-id={marker.id}>
            <span className="map-marker__pin" />
            <span className="map-marker__label">
              {marker.label}
            </span>
          </button>
        ))
      }
    </Root>
  );
};

WorldMap.defaultProps = {};

export default WorldMap;
