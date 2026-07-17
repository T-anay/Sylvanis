import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';

export const BurningEarth = ({ isZooming = false }) => {
  const earthRef = useRef<THREE.Group>(null);
  const { theme } = useTheme();

  // Yavaşça dönüş efekti ve (opsiyonel) y ekseninde salınım
  useFrame((state, delta) => {
    if (earthRef.current) {
      // Eğer zoom yapılıyorsa (haritaya geçiş) daha hızlı dönerek içeri girme efekti verebiliriz
      const rotationSpeed = isZooming ? 2.0 : 0.1;
      earthRef.current.rotation.y += delta * rotationSpeed;
      earthRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Zoom animasyonu sırasında modeli kameraya doğru büyüt (veya kamerayı yaklaştıracağız)
      if (isZooming) {
        earthRef.current.scale.lerp(new THREE.Vector3(15, 15, 15), 0.05);
      }
    }
  });

  const isDark = theme === 'dark';

  // Okyanus / Kara tonları (Ibicash & Paper Planes karışımı)
  // Low-poly fütüristik görünüm için IcosahedronGeometry kullanıyoruz
  return (
    <group ref={earthRef} position={[0, 0, 0]}>
      
      {/* Ana Küre (Okyanus / Şeffaf Sıvımsı Cam Efekti - Ibicash Style) */}
      <mesh>
        <sphereGeometry args={[2.5, 64, 64]} />
        <MeshDistortMaterial 
          color={isDark ? "#0a192f" : "#3b82f6"} 
          envMapIntensity={isDark ? 0.5 : 1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.9}
          roughness={0.1}
          distort={0.3} // Sıvımsı dalgalanma efekti
          speed={1.5} // Dalgalanma hızı
          transmission={0.8} // Cam gibi geçirgen
          thickness={1.5}
        />
      </mesh>

      {/* İç Katman (Çekirdek veya Kara Parçaları hissi) */}
      <mesh scale={0.95}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <MeshDistortMaterial 
          color={isDark ? "#022c22" : "#10b981"} 
          distort={0.4} 
          speed={2} 
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* --- YANAN BÖLGELER VE KIVILCIMLAR --- */}
      {/* 1. Bölge (Örn: Türkiye / Akdeniz civarı) */}
      <group position={[1.5, 1.2, 1.8]}>
        <PointLightAndSparks isDark={isDark} />
      </group>

      {/* 2. Bölge (Örn: Amazonlar) */}
      <group position={[-1.8, -0.5, 1.5]}>
        <PointLightAndSparks isDark={isDark} scale= {0.7} />
      </group>

      {/* 3. Bölge (Örn: Avustralya) */}
      <group position={[1.8, -1.5, -1.0]}>
        <PointLightAndSparks isDark={isDark} scale={1.2} />
      </group>
      
    </group>
  );
};

// Yanan bölgeleri kolayca çoğaltmak için yardımcı bileşen
const PointLightAndSparks = ({ isDark, scale = 1 }: { isDark: boolean, scale?: number }) => {
  return (
    <>
      {/* Yanan alanın kızarıklığı (Sıcak Çekirdek) */}
      <Sphere args={[0.3 * scale, 16, 16]}>
        <meshBasicMaterial color="#ff4b2b" toneMapped={false} />
      </Sphere>
      
      <pointLight 
        intensity={isDark ? 8 * scale : 15 * scale} 
        distance={4 * scale} 
        color="#ff416c" 
      />
      
      {/* Atmosfere doğru savrulan kıvılcımlar */}
      <Sparkles 
        count={isDark ? 80 * scale : 40 * scale} 
        scale={[1.5 * scale, 1.5 * scale, 1.5 * scale]} 
        size={isDark ? 6 : 4} 
        speed={0.8} 
        opacity={0.9} 
        color="#ffb142" 
      />
    </>
  );
};
