import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

const SatelliteTracking = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // CSS2DRenderer for labels
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none'; // Allow interaction with the canvas below
    containerRef.current.appendChild(labelRenderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 50;

    // Earth
    const earthGeometry = new THREE.SphereGeometry(5, 64, 64); // Increased segments for better sphere
    // Check if earth-texture.jpg is a map, otherwise you might need a different texture
    const earthTexture = new THREE.TextureLoader().load('/earth-texture.jpg', undefined, undefined, function (err) {
        console.error('An error happened loading the earth texture.', err);
        // Fallback or error handling if texture fails to load
    });

    // Optional: Load a bump map for more detailed terrain (example, replace with a proper bump map)
    // const earthBumpMap = new THREE.TextureLoader().load('/earth-bump.jpg'); 

    // Optional: Load a specular map for oceans/shine (example)
    // const earthSpecularMap = new THREE.TextureLoader().load('/earth-specular.jpg');

    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      // bumpMap: earthBumpMap, // Uncomment and provide bump map for terrain detail
      bumpScale: 0.1,
      // specularMap: earthSpecularMap, // Uncomment and provide specular map for shine
      specular: 0x222222,
      shininess: 30,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Add atmospheric glow
    const atmosphereGeometry = new THREE.SphereGeometry(5.15, 64, 64); // Match segments with Earth
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending, // Use AdditiveBlending for a glow effect
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Satellites (example data structure with names)
    const satelliteData = [
        { id: 1, name: 'GPS Satellite 1', type: 'GPS', orbitRadius: 7, orbitSpeed: 0.0005, orbitInclination: 0 },
        { id: 2, name: 'Comm Satellite 1', type: 'Communication', orbitRadius: 8, orbitSpeed: 0.0004, orbitInclination: Math.PI / 4 },
        { id: 3, name: 'Weather Satellite 1', type: 'Weather', orbitRadius: 6.5, orbitSpeed: 0.0006, orbitInclination: -Math.PI / 6 },
        { id: 4, name: 'GPS Satellite 2', type: 'GPS', orbitRadius: 7.2, orbitSpeed: 0.00045, orbitInclination: Math.PI / 8 },
        { id: 5, name: 'Comm Satellite 2', type: 'Communication', orbitRadius: 7.8, orbitSpeed: 0.00038, orbitInclination: -Math.PI / 5 },
    ];

    const satellites = [];
    const satelliteGeometry = new THREE.SphereGeometry(0.1, 16, 16);

    satelliteData.forEach(data => {
        const satelliteMaterial = new THREE.MeshPhongMaterial({
            color: data.type === 'GPS' ? 0x00ff00 : data.type === 'Communication' ? 0x0000ff : 0xffff00 // Color based on type
        });
        const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
        satellite.userData = { id: data.id, name: data.name, type: data.type }; // Store data in userData
        scene.add(satellite);
        satellites.push({ mesh: satellite, data: data });

        // Add satellite label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'satellite-label';
        labelDiv.textContent = data.name;
        labelDiv.style.cssText = 'color: white; font-size: 10px; text-shadow: 1px 1px 2px black; background: rgba(0,0,0,0.5); padding: 2px 5px; rounded; opacity: 0.8;';
        
        const satelliteLabel = new CSS2DObject(labelDiv);
        // Position the label slightly above the satellite
        satelliteLabel.position.set(0, 0.2, 0);
        satellite.add(satelliteLabel);

        // Add orbit path (simplified ellipse)
        const curve = new THREE.EllipseCurve(
            0, 0, // Center x, y
            data.orbitRadius, data.orbitRadius, // xRadius, yRadius
            0, 2 * Math.PI, // StartAngle, EndAngle
            false, // Clockwise
            data.orbitInclination // Rotation
        );

        const points = curve.getPoints(100);
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2; // Rotate to align with satellite movement
        // Position the orbit relative to the Earth
        orbit.position.set(earth.position.x, earth.position.y, earth.position.z);
        scene.add(orbit);
    });

    // Starfield background
    const starGeometry = new THREE.SphereGeometry(500, 32, 32);
    const starTexture = new THREE.TextureLoader().load('/starfield.jpg', (texture) => {
        // Adjust texture filtering for better clarity
        texture.minFilter = THREE.LinearFilter; // or THREE.NearestFilter for sharper pixels
        texture.magFilter = THREE.LinearFilter; // or THREE.NearestFilter
        // Explicitly disable mipmaps if the image dimensions are not powers of 2
        texture.generateMipmaps = false;
        // Set wrapping mode to clamp to avoid issues at seams
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        // Request a render update after the texture is loaded and settings applied
        renderer.render(scene, camera); // assuming 'renderer', 'scene', 'camera' are accessible here
    }, undefined, function (err) {
        console.error('An error happened loading the starfield texture.', err);
    });

    const starMaterial = new THREE.MeshBasicMaterial({
        map: starTexture,
        side: THREE.BackSide,
        // It's often helpful to set the color to white when using a texture
        color: 0xffffff
    });
    const starfield = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(starfield);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.2);
    directionalLight.position.set(8, 6, 8);
    scene.add(directionalLight);

    // Add a subtle blue point light for extra glow
    const blueLight = new THREE.PointLight(0x3b82f6, 0.7, 50);
    blueLight.position.set(0, 10, 10);
    scene.add(blueLight);

    camera.position.z = 15;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      controls.update(); // required if damping enabled

      earth.rotation.y += 0.0005; // Slower rotation for realism
      if (starfield) starfield.rotation.y += 0.0001; // Rotate starfield slowly

      satellites.forEach(({ mesh: satellite, data }) => {
        const time = Date.now() * data.orbitSpeed;
        const angle = time;
        const radius = data.orbitRadius;
        
        // Calculate position on a slightly more complex path (simulated inclination)
        satellite.position.x = Math.cos(angle) * radius;
        satellite.position.z = Math.sin(angle) * radius;
        satellite.position.y = Math.sin(angle + data.orbitInclination) * radius * Math.sin(data.orbitInclination !== 0 ? 0.3 : 0); // Simulate some vertical movement
        
        // Keep the label facing the camera (CSS2DObject does this automatically)
      });

      renderer.render(scene, camera);
      labelRenderer.render(scene, camera); // Render labels
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      labelRenderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      containerRef.current?.removeChild(labelRenderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full h-[600px] glass-section overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      
      <div className="absolute top-4 left-4 bg-black/50 p-4 rounded-lg backdrop-blur-sm">
        <h3 className="text-white text-lg font-semibold mb-2">Active Satellites</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-gray-300">GPS Satellite</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-gray-300">Communication Satellite</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-gray-300">Weather Satellite</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-black/50 p-4 rounded-lg backdrop-blur-sm">
        <h3 className="text-white text-lg font-semibold mb-2">Orbital Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Total Satellites</p>
            <p className="text-white text-xl">1,234</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Active Missions</p>
            <p className="text-white text-xl">42</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteTracking; 