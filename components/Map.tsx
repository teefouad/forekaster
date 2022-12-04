/**
 * Dependency imports
 */
import React from 'react';
import styled from '@emotion/styled';
import * as Three from 'three';

/**
 * Root
 */
const Root = styled.div`
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

/**
 * Map Component
 */
export interface MapProps {
  [prop: string]: any,
}

export type MapCombinedProps = MapProps & JSX.IntrinsicElements['div'];

const Map: React.FC<MapCombinedProps> = () => {
  const canvasRef = React.useRef(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current! as HTMLCanvasElement;
    const raf = window.requestAnimationFrame;
    const caf = window.cancelAnimationFrame;

    const fieldOfView = 20;
    const aspectRatio = 2; // default aspect ratio for canvas

    const scene = new Three.Scene();
    const camera = new Three.PerspectiveCamera(fieldOfView, aspectRatio, 0.1, 1000);
    const renderer = new Three.WebGLRenderer({ canvas, alpha: true, antialias: true });

    // Create globe
    const globeGeometry = new Three.SphereGeometry(20, 100, 100);
    const globeTexture = new Three.TextureLoader().load('/world.jpg');
    const globeMaterial = new Three.MeshBasicMaterial({ map: globeTexture });
    const globe = new Three.Mesh(globeGeometry, globeMaterial);

    // Mouse interactivity
    let isDragging = false;

    const draggingFactor = 0.0005;

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
    };

    window.addEventListener('mousedown', startDrag);
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

    // Setup
    camera.position.x = -11;
    camera.position.z = 70;

    scene.add(globe);
    
    // Update animation
    let frame = raf(function render() {
      if (!isDragging) {
        globe.rotation.x += draggingFactor * data.dy;
        globe.rotation.y += draggingFactor * data.dx;

        data.dx *= 0.9;
        data.dy *= 0.9;
      }

      globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globe.rotation.x));

      renderer.render(scene, camera);
      
      frame = raf(render);
    });
    
    return () => {
      caf(frame);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousedown', startDrag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('mousemove', dragging);
    };
  }, []);
  
  return (
    <Root>
      <canvas ref={canvasRef} width={300} height={150} />
    </Root>
  );
};

Map.defaultProps = {};

export default Map;
