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
import { animate, raf } from '../utils/animation';
import { toRem } from '../utils/text';
import * as easing from '../utils/easing';

/**
 * World3D Class
 */
class World3D {
  scene: Three.Scene;

  camera: Three.PerspectiveCamera;

  renderer: Three.WebGLRenderer;

  globe: Three.Mesh<Three.SphereGeometry, Three.MeshBasicMaterial>;

  constructor(canvas: HTMLCanvasElement, zoom = 0, fieldOfView = 20, aspectRatio = 2) {
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
    this.camera.position.z = 70 - zoom;

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
const Root = styled.div`
  .markers-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .markers-visibility-area {
    position: absolute;
    top: 50%;
    left: 43%;
    width: 80%;
    height: 80%;
    pointer-events: none;
    opacity: 0;
    background: red;
    border-radius: 50%;
    transform: translate(-50%, -50%);
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
    padding: ${toRem(2)} ${toRem(5)};
    font-family: Nunito, sans-serif;
    font-size: ${toRem(11)};
    font-weight: 600;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
    opacity: 0;
    color: #333;
    background-color: #fff;
    border-radius: ${toRem(4)};
    transform: translate(-50%, 50%);
    transition: opacity 150ms ease-in-out, transform 150ms ${easing.backOut};
  }

  /* Visible */
  
  .map-marker[data-visible="1"] {
    .map-marker__pin {
      opacity: 0.8;
      transform: scale(1);
    }
  }

  /* Hover */

  .map-marker[data-visible="1"]:hover {
    z-index: 9999999 !important;

    .map-marker__pin {
      opacity: 1;
      transform: scale(1.35);
      transition-timing-function: ${easing.easyBack};
    }

    .map-marker__label {
      opacity: 1;
      transform: translate(-50%, 30%) scale(1);
    }
  }
`;

/**
 * WorldMap Component
 */
export interface WorldMapProps {
  markers?: Marker[],
  showMarkers?: boolean,
  markersVisibilityRadius?: number,
  interactive?: boolean,
  autoOrbit?: 'fast' | 'slow' | 'off',
  target?: { lat: number, lon: number },
  zoom?: number,
  dragFriction?: number,
  canvasWidth?: number,
  canvasHeight?: number,
  onDragStart?: () => void,
  onDragStop?: () => void,
  onMarkerClick?: (marker: Marker) => void,
  shouldShowMarker?: ({
    d,
    dx,
    dy,
    markerPosition,
    globePosition,
  }: {
    d: number,
    dx: number,
    dy: number,
    markerPosition: { x: number, y: number },
    globePosition: { x: number, y: number },
  }) => boolean,
}

export type WorldMapCombinedProps = WorldMapProps & JSX.IntrinsicElements['div'];

const WorldMap: React.FC<WorldMapCombinedProps> = ({
  markers = [],
  showMarkers = true,
  markersVisibilityRadius = 300,
  interactive = true,
  autoOrbit = false,
  target,
  zoom = 0,
  dragFriction = 500,
  canvasWidth = 1000,
  canvasHeight = 1000,
  onDragStart,
  onDragStop,
  onMarkerClick,
  shouldShowMarker,
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
    if (!worldRef.current || Number.isNaN(zoom)) return;

    animate(worldRef.current.camera.position, {
      z: { to: 70 - zoom },
    });
  }, [zoom]);

  React.useEffect(() => {
    const root = rootRef.current! as HTMLDivElement;
    const canvas = root.querySelector('canvas') as HTMLCanvasElement;
    const markersVisibilityArea = root.querySelector('.markers-visibility-area');

    worldRef.current = worldRef.current ?? new World3D(canvas, zoom);

    // Map markers
    const mapMarkers = new Map<HTMLElement, Three.Object3D>();

    markers.forEach((marker) => {
      const positionHelper = new Three.Object3D();
      const latHelper = new Three.Object3D();
      const lonHelper = new Three.Object3D();

      latHelper.add(positionHelper);
      lonHelper.add(latHelper);
      worldRef.current!.globe.add(lonHelper);

      positionHelper.position.z = 10;

      latHelper.rotation.x = World3D.helpers.degToRad(-marker.lat - 1.35);
      lonHelper.rotation.y = World3D.helpers.degToRad(marker.lon + 90 + 0.3);

      const markerElement: HTMLElement = root.querySelector(`.map-marker[data-id='${marker.id}']`)!;

      if (markerElement) {
        mapMarkers.set(markerElement, positionHelper);
      }
    });

    const updateMarkers = () => {
      mapMarkers.forEach((markerPositionHelper, markerElement) => {
        const markerProjectedPosition = World3D.helpers.getProjectedPosition(markerPositionHelper, worldRef.current!.camera, canvas);
        const zIndex = +markerProjectedPosition.z.toFixed(4) * 10000;
    
        // move the marker to projected position
        markerElement!.style.transform = `translate(-50%, -50%) translate(${markerProjectedPosition.x}px,${markerProjectedPosition.y}px)`;
    
        // set the zIndex for sorting
        markerElement!.style.zIndex = zIndex.toString();

        // set marker visibility
        // const globeProjectedPosition = World3D.helpers.getProjectedPosition(worldRef.current!.globe, worldRef.current!.camera, canvas);
        // const dx = markerProjectedPosition.x - globeProjectedPosition.x;
        // const dy = markerProjectedPosition.y - globeProjectedPosition.y;
        // const d = Math.sqrt(dx * dx + dy * dy);

        const rootBbox = root.getBoundingClientRect();
        const bbox = markersVisibilityArea!.getBoundingClientRect();
        const rx = 0.5 * bbox.width;
        const ry = 0.5 * bbox.height;
        const cx = bbox.x + rx - rootBbox.x;
        const cy = bbox.y + ry - rootBbox.y;
        const dx = markerProjectedPosition.x - cx;
        const dy = markerProjectedPosition.y - cy;
        const a = (dx * dx) / (rx * rx);
        const b = (dy * dy) / (ry * ry);
        const insideVisibilityArea = ((a + b) <= 1);

        const isVisible = (
          showMarkers
          && markerProjectedPosition.worldPosition.z > 0
          && insideVisibilityArea
        );

        markerElement.setAttribute('data-visible', isVisible ? '1' : '0');
      });
    };

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

    // Canvas size
    const pixelRatio = window.devicePixelRatio;
    const width  = canvasWidth * pixelRatio;
    const height = canvasHeight * pixelRatio;

    worldRef.current.renderer.setSize(width, height, false);
    worldRef.current.camera.aspect = width / height;
    worldRef.current.camera.updateProjectionMatrix();

    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // Update animation
    const stopAnimation = raf(() => {
      if (worldRef.current) {
        if (!dragDataRef.current.active) {
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

              animate(worldRef.current.globe.rotation, {
                x: { to: 0 },
                y: { to: worldRef.current.globe.rotation.y + 2 * Math.PI },
              }, {
                easing: 'easeInOutCubic',
                onFinish: () => {
                  orbitDataRef.current.fastOrbiting = false;
                },
              });
            }
          } else {
            orbitDataRef.current.speed = 0;
          }

          worldRef.current.globe.rotation.y += orbitDataRef.current.speed;
          
          // handle inertia
          worldRef.current.globe.rotation.x += (1 / dragFriction) * dragDataRef.current.dy;
          worldRef.current.globe.rotation.y += (1 / dragFriction) * dragDataRef.current.dx;
          dragDataRef.current.dx *= 0.9;
          dragDataRef.current.dy *= 0.9;
        }
        
        // cap globe rotation
        worldRef.current.globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, worldRef.current.globe.rotation.x));
        
        if (worldRef.current.globe.rotation.y > 2 * Math.PI) {
          worldRef.current.globe.rotation.y -= 2 * Math.PI;
        }

        if (worldRef.current.globe.rotation.y < -2 * Math.PI) {
          worldRef.current.globe.rotation.y += 2 * Math.PI;
        }

        updateMarkers();
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

      mapMarkers.forEach((markerPositionHelper, markerElement) => {
        markerPositionHelper.parent?.parent?.removeFromParent();
      });
    };
  }, [
    markers,
    showMarkers,
    markersVisibilityRadius,
    interactive,
    autoOrbit,
    zoom,
    dragFriction,
    canvasWidth,
    canvasHeight,
    onDragStart,
    onDragStop,
    shouldShowMarker,
  ]);

  return (
    <Root ref={rootRef} {...props}>
      <div className="canvas-container">
        <canvas width={300} height={150} />
      </div>

      <div className="markers-visibility-area" />

      <div className="markers-container">
        {
          markers.map((marker) => (
            <Marker key={marker.id} data={marker} onMarkerClick={onMarkerClick} />
          ))
        }
      </div>
    </Root>
  );
};

export interface Marker {
  id: string,
  label: string,
  cloudLabel?: string,
  cloudsCount?: number,
  lat: number,
  lon: number,
}

const Marker: React.FC<{
  data: Marker,
  onMarkerClick?: (marker: Marker) => void,
}> = ({
  data,
  onMarkerClick,
}) => {
  const {
    id,
    label,
    cloudLabel,
    cloudsCount,
  } = data;
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const [cloudTooltipActive, setCloudTooltipActive] = React.useState(false);

  const handleMouseOver = () => {
    clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setCloudTooltipActive(true);
    }, 50);
  };

  const handleMouseOut = () => {
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setCloudTooltipActive(false);
    }, 200);
  };

  return (
    <button
      className="map-marker"
      data-id={id}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onClick={onMarkerClick?.bind(null, data)}
    >
      {
        cloudLabel && cloudTooltipActive ? (
          <CloudTooltip label={cloudLabel} count={cloudsCount ?? label.length} offset={54}>
            <span className="map-marker__pin" />
          </CloudTooltip>
        ) : (
          <span className="map-marker__pin" />
        )
      }

      <span className="map-marker__label">
        {label}
      </span>
    </button>
  );
};

export default WorldMap;
