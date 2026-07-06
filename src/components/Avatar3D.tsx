import { useRef, useMemo, type FC } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type {
  AppearanceAttributes,
  VisualIdentity,
  Ethnicity,
  HairStyle,
  Gender,
} from '../data/customization';

// ──────────────────────────────────────────────
// Color Utilities
// ──────────────────────────────────────────────

function adjustColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const adj = (c: number) =>
    amount >= 0
      ? Math.min(255, Math.round(c + (255 - c) * amount))
      : Math.max(0, Math.round(c * (1 + amount)));
  return `#${adj(r).toString(16).padStart(2, '0')}${adj(g).toString(16).padStart(2, '0')}${adj(b).toString(16).padStart(2, '0')}`;
}
const lighten = (hex: string, amt: number) => adjustColor(hex, amt);
const darken = (hex: string, amt: number) => adjustColor(hex, -amt);

// ──────────────────────────────────────────────
// Face Parameters per Ethnicity (3D)
// ──────────────────────────────────────────────

interface FaceParams3D {
  headSX: number; headSY: number; headSZ: number;
  eyeSpacing: number; eyeSize: number;
  lipWidth: number; noseLength: number;
  browAngle: number;
}

const FACE_PARAMS_3D: Record<Ethnicity, FaceParams3D> = {
  asian:  { headSX: 0.92, headSY: 1.02, headSZ: 0.96, eyeSpacing: 0.34, eyeSize: 0.075, lipWidth: 0.16, noseLength: 0.12, browAngle: 0.05 },
  black:  { headSX: 0.95, headSY: 1.0,  headSZ: 0.92, eyeSpacing: 0.36, eyeSize: 0.085, lipWidth: 0.22, noseLength: 0.14, browAngle: 0.08 },
  white:  { headSX: 0.88, headSY: 1.08, headSZ: 0.92, eyeSpacing: 0.32, eyeSize: 0.08,  lipWidth: 0.16, noseLength: 0.16, browAngle: 0.06 },
  latina: { headSX: 0.90, headSY: 1.05, headSZ: 0.94, eyeSpacing: 0.33, eyeSize: 0.08,  lipWidth: 0.19, noseLength: 0.14, browAngle: 0.07 },
  arab:   { headSX: 0.90, headSY: 1.06, headSZ: 0.93, eyeSpacing: 0.33, eyeSize: 0.078, lipWidth: 0.18, noseLength: 0.17, browAngle: 0.07 },
  indian: { headSX: 0.91, headSY: 1.05, headSZ: 0.94, eyeSpacing: 0.33, eyeSize: 0.078, lipWidth: 0.18, noseLength: 0.15, browAngle: 0.07 },
  elf:    { headSX: 0.82, headSY: 1.12, headSZ: 0.90, eyeSpacing: 0.35, eyeSize: 0.09,  lipWidth: 0.14, noseLength: 0.15, browAngle: 0.1 },
  alien:  { headSX: 1.0,  headSY: 1.15, headSZ: 0.88, eyeSpacing: 0.42, eyeSize: 0.12,  lipWidth: 0.12, noseLength: 0.08, browAngle: 0.02 },
  demon:  { headSX: 0.88, headSY: 1.0,  headSZ: 0.93, eyeSpacing: 0.34, eyeSize: 0.08,  lipWidth: 0.20, noseLength: 0.13, browAngle: 0.12 },
};

// ──────────────────────────────────────────────
// Expression Types
// ──────────────────────────────────────────────

export type Expression3D = 'smile' | 'speak' | 'think' | 'listen';

// ──────────────────────────────────────────────
// Lighting
// ──────────────────────────────────────────────

const Lighting: FC<{ accent: string }> = ({ accent }) => (
  <>
    <ambientLight intensity={0.35} />
    {/* Key light — warm, upper right */}
    <directionalLight position={[3, 4, 3]} intensity={1.3} color="#FFF5E6" />
    {/* Fill light — cool, upper left, softer */}
    <directionalLight position={[-3, 2, 2]} intensity={0.5} color="#E6F0FF" />
    {/* Rim light — accent color, from behind */}
    <directionalLight position={[0, 3, -4]} intensity={0.7} color={accent} />
    {/* Subtle bottom bounce */}
    <directionalLight position={[0, -2, 1]} intensity={0.15} color="#FFEEE0" />
  </>
);

// ──────────────────────────────────────────────
// Head
// ──────────────────────────────────────────────

const Head: FC<{ skin: string; skinLight: string; skinDark: string; fp: FaceParams3D }> = ({ skin, skinLight, skinDark, fp }) => {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: skin, roughness: 0.62, metalness: 0 }),
    [skin],
  );
  return (
    <group>
      {/* Main head */}
      <mesh scale={[fp.headSX, fp.headSY, fp.headSZ]} material={mat}>
        <sphereGeometry args={[1, 96, 96]} />
      </mesh>
      {/* Forehead highlight */}
      <mesh position={[0, 0.35, fp.headSZ * 0.82]} scale={[0.45, 0.15, 0.1]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={skinLight} roughness={0.4} transparent opacity={0.25} />
      </mesh>
      {/* Cheekbone shadows */}
      <mesh position={[-fp.headSX * 0.7, -0.1, fp.headSZ * 0.55]} scale={[0.12, 0.2, 0.08]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={skinDark} roughness={0.8} transparent opacity={0.18} />
      </mesh>
      <mesh position={[fp.headSX * 0.7, -0.1, fp.headSZ * 0.55]} scale={[0.12, 0.2, 0.08]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={skinDark} roughness={0.8} transparent opacity={0.18} />
      </mesh>
      {/* Chin shadow */}
      <mesh position={[0, -fp.headSY * 0.72, fp.headSZ * 0.5]} scale={[0.25, 0.08, 0.06]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={skinDark} roughness={0.8} transparent opacity={0.15} />
      </mesh>
    </group>
  );
};

// ──────────────────────────────────────────────
// Eyes
// ──────────────────────────────────────────────

const Eyes: FC<{
  eyeColor: string; fp: FaceParams3D; expression: Expression3D;
}> = ({ eyeColor, fp, expression }) => {
  const eyeY = 0.1;
  const eyeZ = fp.headSZ * 0.84;
  const eyeDark = darken(eyeColor, 0.35);
  const eyeLight = lighten(eyeColor, 0.3);
  const ex = fp.eyeSpacing;
  const es = fp.eyeSize;

  // Pupil dilation based on expression
  const pupilSize = expression === 'listen' ? es * 0.38 : es * 0.3;

  const Eye = ({ x }: { x: number }) => (
    <group position={[x, eyeY, eyeZ]}>
      {/* Sclera */}
      <mesh scale={[1, 1, 0.55]}>
        <sphereGeometry args={[es, 32, 32]} />
        <meshStandardMaterial color="#FAFAFA" roughness={0.08} metalness={0} />
      </mesh>
      {/* Upper eyelid — skin-colored crescent above iris */}
      <mesh position={[0, es * 0.35, es * 0.3]} scale={[1.05, 0.5, 0.4]}>
        <sphereGeometry args={[es, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#E8C4A0" roughness={0.7} transparent opacity={0.85} />
      </mesh>
      {/* Iris */}
      <mesh position={[0, 0, es * 0.5]}>
        <sphereGeometry args={[es * 0.62, 32, 32]} />
        <meshStandardMaterial color={eyeColor} roughness={0.25} emissive={eyeLight} emissiveIntensity={0.15} />
      </mesh>
      {/* Iris dark ring */}
      <mesh position={[0, 0, es * 0.52]} scale={[1, 1, 0.3]}>
        <torusGeometry args={[es * 0.58, es * 0.05, 8, 32]} />
        <meshStandardMaterial color={eyeDark} roughness={0.3} />
      </mesh>
      {/* Pupil */}
      <mesh position={[0, 0, es * 0.56]}>
        <sphereGeometry args={[pupilSize, 16, 16]} />
        <meshStandardMaterial color="#0A0A14" roughness={0.05} metalness={0.1} />
      </mesh>
      {/* Catchlight — upper right */}
      <mesh position={[es * 0.18, es * 0.2, es * 0.6]}>
        <sphereGeometry args={[es * 0.14, 8, 8]} />
        <meshBasicMaterial color="white" />
      </mesh>
      {/* Catchlight — lower left, smaller */}
      <mesh position={[-es * 0.12, -es * 0.15, es * 0.55]}>
        <sphereGeometry args={[es * 0.06, 8, 8]} />
        <meshBasicMaterial color="white" opacity={0.6} transparent />
      </mesh>
      {/* Lower lash line */}
      <mesh position={[0, -es * 0.7, es * 0.3]} rotation={[0.3, 0, 0]} scale={[1.05, 0.08, 0.3]}>
        <sphereGeometry args={[es, 16, 16, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5]} />
        <meshStandardMaterial color="rgba(40,20,20,0.3)" roughness={0.9} transparent opacity={0.3} />
      </mesh>
    </group>
  );

  return (
    <group>
      <Eye x={-ex} />
      <Eye x={ex} />
    </group>
  );
};

// ──────────────────────────────────────────────
// Eyebrows
// ──────────────────────────────────────────────

const Eyebrows: FC<{
  hairColor: string; fp: FaceParams3D; gender: Gender; expression: Expression3D;
}> = ({ hairColor, fp, gender, expression }) => {
  const browY = 0.26;
  const browZ = fp.headSZ * 0.86;
  const ex = fp.eyeSpacing;
  const thickness = gender === 'male' ? 0.035 : 0.022;
  const length = gender === 'male' ? 0.2 : 0.16;

  // Expression affects brow angle
  const tilt = expression === 'think' ? -fp.browAngle - 0.08 :
               expression === 'listen' ? fp.browAngle * 0.5 :
               fp.browAngle;

  const Brow = ({ x, mirror }: { x: number; mirror: number }) => (
    <mesh
      position={[x, browY, browZ]}
      rotation={[0, 0, tilt * mirror]}
      scale={[length, thickness, 0.03]}
    >
      <capsuleGeometry args={[0.5, 0.8, 8, 16]} />
      <meshStandardMaterial color={hairColor} roughness={0.5} transparent opacity={0.85} />
    </mesh>
  );

  return (
    <group>
      <Brow x={-ex} mirror={1} />
      <Brow x={ex} mirror={-1} />
    </group>
  );
};

// ──────────────────────────────────────────────
// Nose
// ──────────────────────────────────────────────

const Nose: FC<{ skin: string; skinDark: string; skinLight: string; fp: FaceParams3D }> = ({ skin, skinDark, skinLight, fp }) => {
  const noseY = -0.08;
  const noseZ = fp.headSZ * 0.92;
  const len = fp.noseLength;
  return (
    <group position={[0, noseY, noseZ]}>
      {/* Bridge */}
      <mesh position={[0, len * 0.3, 0]} rotation={[Math.PI / 2.2, 0, 0]} scale={[0.03, len * 0.8, 0.03]}>
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
        <meshStandardMaterial color={skin} roughness={0.6} transparent opacity={0.5} />
      </mesh>
      {/* Tip */}
      <mesh position={[0, -len * 0.35, 0.02]} scale={[0.05, 0.04, 0.05]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={skin} roughness={0.5} />
      </mesh>
      {/* Nostrils */}
      <mesh position={[-0.035, -len * 0.4, 0]} scale={[0.02, 0.012, 0.02]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color={skinDark} roughness={0.9} />
      </mesh>
      <mesh position={[0.035, -len * 0.4, 0]} scale={[0.02, 0.012, 0.02]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color={skinDark} roughness={0.9} />
      </mesh>
      {/* Tip highlight */}
      <mesh position={[0, -len * 0.3, 0.045]} scale={[0.025, 0.015, 0.01]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color={skinLight} roughness={0.3} transparent opacity={0.35} />
      </mesh>
    </group>
  );
};

// ──────────────────────────────────────────────
// Lips
// ──────────────────────────────────────────────

const Lips: FC<{
  expression: Expression3D; fp: FaceParams3D; ethnicity: Ethnicity;
}> = ({ expression, fp, ethnicity }) => {
  const lipY = -0.48;
  const lipZ = fp.headSZ * 0.84;
  const lw = fp.lipWidth;

  const lipColor = ethnicity === 'demon' ? '#8B2020' :
                   ethnicity === 'black' ? '#9B5060' :
                   '#C4707A';
  const lipLight = lighten(lipColor, 0.15);
  const lipDark = darken(lipColor, 0.15);

  // Expression-based lip parameters
  const smileAmount = expression === 'smile' ? 0.04 :
                      expression === 'listen' ? 0.02 :
                      expression === 'think' ? -0.01 : 0;
    const mouthOpen = expression === 'speak' ? 0.04 : 0;
  const lowerLipY = lipY - 0.04 - mouthOpen;
  const upperLipScaleY = expression === 'think' ? 0.018 : 0.025;
  const lowerLipScaleY = expression === 'speak' ? 0.03 : 0.035;

  return (
    <group position={[0, lipY, lipZ]}>
      {/* Upper lip */}
      <mesh position={[0, 0.025, 0]} scale={[lw, upperLipScaleY, 0.025]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color={lipColor} roughness={0.35} />
      </mesh>
      {/* Cupid's bow dip */}
      <mesh position={[0, 0.038, 0.005]} scale={[lw * 0.3, 0.012, 0.02]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color={lipDark} roughness={0.4} transparent opacity={0.5} />
      </mesh>
      {/* Lower lip */}
      <mesh position={[0, lowerLipY - lipY, 0]} scale={[lw * 0.9, lowerLipScaleY, 0.03]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color={lipColor} roughness={0.35} />
      </mesh>
      {/* Lip highlight (glossy) */}
      <mesh position={[0, lowerLipY - lipY + 0.012, 0.015]} scale={[lw * 0.5, 0.008, 0.01]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color={lipLight} roughness={0.1} transparent opacity={0.4} />
      </mesh>
      {/* Mouth interior (when speaking) */}
      {mouthOpen > 0 && (
        <mesh position={[0, -0.015, -0.01]} scale={[lw * 0.7, mouthOpen * 1.5, 0.02]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#3A1A2A" roughness={0.9} />
        </mesh>
      )}
      {/* Smile corners */}
      <mesh position={[-lw * 0.85, smileAmount, 0.005]} scale={[0.015, 0.015, 0.02]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color={lipDark} roughness={0.5} transparent opacity={0.6} />
      </mesh>
      <mesh position={[lw * 0.85, smileAmount, 0.005]} scale={[0.015, 0.015, 0.02]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color={lipDark} roughness={0.5} transparent opacity={0.6} />
      </mesh>
      {/* Cheek blush */}
      <mesh position={[-fp.headSX * 0.6, -0.1, fp.headSZ * 0.4]} scale={[0.12, 0.08, 0.04]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={lipColor} roughness={0.9} transparent opacity={0.12} />
      </mesh>
      <mesh position={[fp.headSX * 0.6, -0.1, fp.headSZ * 0.4]} scale={[0.12, 0.08, 0.04]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={lipColor} roughness={0.9} transparent opacity={0.12} />
      </mesh>
    </group>
  );
};

// ──────────────────────────────────────────────
// Ears
// ──────────────────────────────────────────────

const Ears: FC<{ skin: string; fp: FaceParams3D; ethnicity: Ethnicity }> = ({ skin, fp, ethnicity }) => {
  if (ethnicity === 'elf') {
    // Pointed elf ears
    const Ear = ({ x }: { x: number }) => (
      <group position={[x * fp.headSX * 0.98, 0.0, 0]} rotation={[0, 0, x > 0 ? -0.3 : 0.3]}>
        <mesh position={[0, 0, 0]} scale={[0.04, 0.18, 0.1]} rotation={[0, 0, x > 0 ? 0.2 : -0.2]}>
          <coneGeometry args={[1, 1, 8]} />
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>
      </group>
    );
    return (
      <group>
        <Ear x={-1} />
        <Ear x={1} />
      </group>
    );
  }

  const Ear = ({ x }: { x: number }) => (
    <group position={[x * fp.headSX * 0.98, 0.0, 0]}>
      <mesh scale={[0.06, 0.12, 0.08]} rotation={[0, 0, x > 0 ? -0.15 : 0.15]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
      {/* Inner ear shadow */}
      <mesh position={[x * 0.02, -0.01, 0.05]} scale={[0.03, 0.06, 0.04]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color={darken(skin, 0.15)} roughness={0.8} transparent opacity={0.4} />
      </mesh>
    </group>
  );

  return (
    <group>
      <Ear x={-1} />
      <Ear x={1} />
    </group>
  );
};

// ──────────────────────────────────────────────
// Hair
// ──────────────────────────────────────────────

const Hair: FC<{
  hairStyle: HairStyle; hairColor: string; fp: FaceParams3D;
}> = ({ hairStyle, hairColor, fp }) => {
  const hairLight = lighten(hairColor, 0.2);
  const hairDark = darken(hairColor, 0.2);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.45, metalness: 0.05 }),
    [hairColor],
  );
  const matLight = useMemo(
    () => new THREE.MeshStandardMaterial({ color: hairLight, roughness: 0.4, metalness: 0.05 }),
    [hairLight],
  );

  if (hairStyle === 'bald') return null;

  // Hijab — large covering
  if (hairStyle === 'hijab') {
    return (
      <group>
        <mesh position={[0, 0.05, -0.05]} scale={[fp.headSX * 1.18, fp.headSY * 1.12, fp.headSZ * 1.15]}>
          <sphereGeometry args={[1, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.72]} />
          <meshStandardMaterial color={hairColor} roughness={0.55} side={THREE.DoubleSide} />
        </mesh>
        {/* Drape folds */}
        <mesh position={[0, -0.3, -0.3]} scale={[0.15, 0.5, 0.1]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={hairDark} roughness={0.6} transparent opacity={0.3} />
        </mesh>
        {/* Hijab highlight */}
        <mesh position={[0.2, 0.3, 0.2]} scale={[0.1, 0.15, 0.05]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={hairLight} roughness={0.3} transparent opacity={0.25} />
        </mesh>
      </group>
    );
  }

  // Cap (common to most styles)
  const capRadius = hairStyle === 'buzz' ? 1.03 : 1.08;
  const capSegments = hairStyle === 'buzz' ? 0.42 : 0.52;

  return (
    <group>
      {/* Hair cap */}
      <mesh position={[0, 0.08, 0]} scale={[fp.headSX * capRadius, fp.headSY * capRadius, fp.headSZ * capRadius]}>
        <sphereGeometry args={[1, 64, 64, 0, Math.PI * 2, 0, Math.PI * capSegments]} />
        <primitive object={mat} attach="material" />
      </mesh>

      {/* Hair highlight strand */}
      <mesh position={[0.2, 0.35, fp.headSZ * 0.8]} rotation={[0, -0.3, 0.2]} scale={[0.15, 0.25, 0.04]}>
        <sphereGeometry args={[1, 16, 16]} />
        <primitive object={matLight} attach="material" />
      </mesh>

      {/* Hair edge shadow at hairline */}
      <mesh position={[0, 0.15, fp.headSZ * 0.85]} scale={[fp.headSX * 0.8, 0.04, 0.04]}>
        <sphereGeometry args={[1, 32, 32, 0, Math.PI, 0, Math.PI * 0.3]} />
        <meshStandardMaterial color={hairDark} roughness={0.7} transparent opacity={0.3} />
      </mesh>

      {/* Long hair — side panels */}
      {(hairStyle === 'long' || hairStyle === 'wavy') && (
        <>
          {[-1, 1].map(side => (
            <group key={side}>
              <mesh position={[side * fp.headSX * 0.95, -0.4, -0.05]} scale={[0.12, 0.7, 0.15]} rotation={[0, 0, side * 0.05]}>
                <sphereGeometry args={[1, 32, 32]} />
                <primitive object={mat} attach="material" />
              </mesh>
              {/* Hair tips */}
              <mesh position={[side * fp.headSX * 0.9, -0.85, -0.08]} scale={[0.08, 0.15, 0.1]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial color={hairDark} roughness={0.5} transparent opacity={0.7} />
              </mesh>
            </group>
          ))}
          {/* Back panel */}
          <mesh position={[0, -0.3, -fp.headSZ * 0.85]} scale={[fp.headSX * 0.85, 0.6, 0.12]}>
            <sphereGeometry args={[1, 32, 32]} />
            <primitive object={mat} attach="material" />
          </mesh>
        </>
      )}

      {/* Wavy hair — wavy edges */}
      {hairStyle === 'wavy' && (
        <>
          {[-0.3, 0, 0.3].map((x, i) => (
            <mesh key={i} position={[x, -0.5 - i * 0.08, -0.1 + (i % 2) * 0.15]} scale={[0.06, 0.1, 0.08]}>
              <sphereGeometry args={[1, 16, 16]} />
              <primitive object={mat} attach="material" />
            </mesh>
          ))}
        </>
      )}

      {/* Curly hair — clustered spheres */}
      {hairStyle === 'curly' && (
        <group>
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i / 20) * Math.PI * 2;
            const yAngle = (i / 20) * Math.PI * 0.5;
            const r = fp.headSX * 1.1;
            const x = Math.cos(angle) * r * Math.cos(yAngle);
            const y = 0.1 + Math.sin(yAngle) * fp.headSY * 1.05;
            const z = Math.sin(angle) * r * Math.cos(yAngle) * fp.headSZ;
            const sz = 0.08 + Math.random() * 0.04;
            return (
              <mesh key={i} position={[x, y, z]} scale={[sz, sz, sz]}>
                <sphereGeometry args={[1, 16, 16]} />
                <primitive object={mat} attach="material" />
              </mesh>
            );
          })}
          {/* Curly hair on sides */}
          {[-1, 1].map(side => (
            <mesh key={side} position={[side * fp.headSX * 0.9, -0.2, -0.1]} scale={[0.15, 0.3, 0.15]}>
              <sphereGeometry args={[1, 16, 16]} />
              <primitive object={mat} attach="material" />
            </mesh>
          ))}
        </group>
      )}

      {/* Ponytail — tail at the back */}
      {hairStyle === 'ponytail' && (
        <group position={[0, -0.1, -fp.headSZ * 0.85]}>
          <mesh position={[0, -0.3, -0.1]} rotation={[0.3, 0, 0]} scale={[0.08, 0.5, 0.08]}>
            <capsuleGeometry args={[0.5, 1, 8, 16]} />
            <primitive object={mat} attach="material" />
          </mesh>
          {/* Tail tip */}
          <mesh position={[0, -0.65, -0.18]} scale={[0.06, 0.1, 0.06]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color={hairDark} roughness={0.5} transparent opacity={0.8} />
          </mesh>
          {/* Hair tie */}
          <mesh position={[0, -0.05, -0.05]} scale={[0.1, 0.03, 0.1]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color={hairDark} roughness={0.7} />
          </mesh>
        </group>
      )}

      {/* Short hair — slightly textured top */}
      {hairStyle === 'short' && (
        <mesh position={[0, 0.35, fp.headSZ * 0.3]} scale={[fp.headSX * 0.7, 0.08, fp.headSZ * 0.5]}>
          <sphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
          <primitive object={mat} attach="material" />
        </mesh>
      )}
    </group>
  );
};

// ──────────────────────────────────────────────
// Fantasy Features
// ──────────────────────────────────────────────

const FantasyFeatures: FC<{ ethnicity: Ethnicity; accent: string }> = ({ ethnicity, accent }) => {
  if (ethnicity === 'demon') {
    return (
      <group>
        {/* Left horn */}
        <mesh position={[-0.4, 0.85, -0.1]} rotation={[0, 0, 0.3]} scale={[0.04, 0.18, 0.04]}>
          <coneGeometry args={[1, 1, 8]} />
          <meshStandardMaterial color="#2A1A2A" roughness={0.4} metalness={0.1} />
        </mesh>
        {/* Right horn */}
        <mesh position={[0.4, 0.85, -0.1]} rotation={[0, 0, -0.3]} scale={[0.04, 0.18, 0.04]}>
          <coneGeometry args={[1, 1, 8]} />
          <meshStandardMaterial color="#2A1A2A" roughness={0.4} metalness={0.1} />
        </mesh>
        {/* Horn highlights */}
        <mesh position={[-0.4, 0.9, -0.05]} rotation={[0, 0, 0.3]} scale={[0.02, 0.1, 0.02]}>
          <coneGeometry args={[1, 1, 8]} />
          <meshStandardMaterial color={accent} roughness={0.2} transparent opacity={0.3} />
        </mesh>
        <mesh position={[0.4, 0.9, -0.05]} rotation={[0, 0, -0.3]} scale={[0.02, 0.1, 0.02]}>
          <coneGeometry args={[1, 1, 8]} />
          <meshStandardMaterial color={accent} roughness={0.2} transparent opacity={0.3} />
        </mesh>
      </group>
    );
  }

  if (ethnicity === 'alien') {
    return (
      <group>
        {/* Left antenna */}
        <mesh position={[-0.25, 1.0, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.008, 0.012, 0.25, 8]} />
          <meshStandardMaterial color="#C8B8E8" roughness={0.5} />
        </mesh>
        <mesh position={[-0.27, 1.15, 0]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#E8D8FF" roughness={0.2} emissive="#C8B8E8" emissiveIntensity={0.3} />
        </mesh>
        {/* Right antenna */}
        <mesh position={[0.25, 1.0, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.008, 0.012, 0.25, 8]} />
          <meshStandardMaterial color="#C8B8E8" roughness={0.5} />
        </mesh>
        <mesh position={[0.27, 1.15, 0]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#E8D8FF" roughness={0.2} emissive="#C8B8E8" emissiveIntensity={0.3} />
        </mesh>
      </group>
    );
  }

  return null;
};

// ──────────────────────────────────────────────
// Body / Clothing
// ──────────────────────────────────────────────

const Body: FC<{ gender: Gender; accent: string; skin: string }> = ({ gender, accent, skin }) => {
  const clothLight = lighten(accent, 0.15);
  const clothDark = darken(accent, 0.25);
  const shoulderWidth = gender === 'male' ? 1.6 : gender === 'female' ? 1.3 : 1.45;
  const shoulderY = -1.15;

  return (
    <group>
      {/* Neck */}
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.28, 0.33, 0.4, 32]} />
        <meshStandardMaterial color={skin} roughness={0.62} />
      </mesh>
      {/* Neck shadow */}
      <mesh position={[0, -0.95, 0.15]} scale={[0.2, 0.12, 0.08]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={darken(skin, 0.2)} roughness={0.8} transparent opacity={0.3} />
      </mesh>

      {/* Shoulders/chest */}
      <mesh position={[0, shoulderY, 0]} scale={[shoulderWidth, 0.55, 0.7]}>
        <sphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={accent} roughness={0.7} />
      </mesh>

      {/* V-neck collar */}
      <mesh position={[0, shoulderY + 0.15, 0.32]} rotation={[0.5, 0, 0]} scale={[0.3, 0.2, 0.05]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={clothDark} roughness={0.7} />
      </mesh>

      {/* Inner shirt */}
      <mesh position={[0, shoulderY + 0.05, 0.35]} scale={[0.15, 0.15, 0.03]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#F8F8F8" roughness={0.6} />
      </mesh>

      {/* Shoulder highlights */}
      <mesh position={[-shoulderWidth * 0.35, shoulderY + 0.1, 0.4]} scale={[0.15, 0.1, 0.08]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={clothLight} roughness={0.5} transparent opacity={0.4} />
      </mesh>
      <mesh position={[shoulderWidth * 0.35, shoulderY + 0.1, 0.4]} scale={[0.15, 0.1, 0.08]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={clothLight} roughness={0.5} transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

// ──────────────────────────────────────────────
// Avatar Model — all parts combined
// ──────────────────────────────────────────────

interface AvatarModelProps {
  appearance: AppearanceAttributes;
  visual: VisualIdentity;
  expression: Expression3D;
  breathing?: boolean;
}

const AvatarModel: FC<AvatarModelProps> = ({ appearance, visual, expression, breathing = true }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { ethnicity, skinTone, hairStyle, hairColor, eyeColor, gender } = appearance;
  const fp = FACE_PARAMS_3D[ethnicity] ?? FACE_PARAMS_3D.white;

  const skinLight = lighten(skinTone, 0.12);
  const skinDark = darken(skinTone, 0.15);

  useFrame((state) => {
    if (!groupRef.current || !breathing) return;
    const t = state.clock.getElapsedTime();
    // Subtle breathing — scale and slight rotation
    const breathe = Math.sin(t * 0.8) * 0.008;
    groupRef.current.scale.setScalar(1 + breathe);
    // Slight head sway when idle
    if (expression === 'smile' || expression === 'listen') {
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.03;
      groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.015;
    }
  });

  // Expression-based head tilt
  const tiltZ = expression === 'think' ? 0.08 : 0;
  const tiltY = expression === 'listen' ? 0.05 : expression === 'think' ? -0.05 : 0;

  return (
    <group ref={groupRef} rotation={[0, tiltY, tiltZ]}>
      <Lighting accent={visual.accentColor} />

      <Body gender={gender} accent={visual.accentColor} skin={skinTone} />

      <group position={[0, 0.1, 0]}>
        <Head skin={skinTone} skinLight={skinLight} skinDark={skinDark} fp={fp} />
        <Ears skin={skinTone} fp={fp} ethnicity={ethnicity} />
        <Eyes eyeColor={eyeColor} fp={fp} expression={expression} />
        <Eyebrows hairColor={hairColor} fp={fp} gender={gender} expression={expression} />
        <Nose skin={skinTone} skinDark={skinDark} skinLight={skinLight} fp={fp} />
                <Lips expression={expression} fp={fp} ethnicity={ethnicity} />
        <Hair hairStyle={hairStyle} hairColor={hairColor} fp={fp} />
        <FantasyFeatures ethnicity={ethnicity} accent={visual.accentColor} />
      </group>
    </group>
  );
};

// ──────────────────────────────────────────────
// Avatar3D — Canvas wrapper
// ──────────────────────────────────────────────

export interface Avatar3DProps {
  appearance: AppearanceAttributes;
  visual: VisualIdentity;
  expression?: Expression3D;
  controls?: boolean;
  size?: number;
  background?: string;
}

export function Avatar3D({
  appearance,
  visual,
  expression = 'smile',
  controls = false,
  size = 180,
  background,
}: Avatar3DProps) {
  const bgColor = background ?? `${visual.gradientFrom}`;

  return (
        <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 0.15, 3.8], fov: 32 }}
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          alpha: true,
        }}
        dpr={[1, 2]}
        style={{ background: background ? `radial-gradient(circle at 50% 30%, ${lighten(bgColor, 0.3)}, ${visual.gradientTo})` : 'transparent' }}
      >
        <AvatarModel
          appearance={appearance}
          visual={visual}
          expression={expression}
          breathing={!controls}
        />
        {controls && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI * 0.3}
            maxPolarAngle={Math.PI * 0.6}
            minAzimuthAngle={-Math.PI * 0.3}
            maxAzimuthAngle={Math.PI * 0.3}
            autoRotate
            autoRotateSpeed={0.5}
          />
        )}
      </Canvas>
    </div>
  );
}

export default Avatar3D;
