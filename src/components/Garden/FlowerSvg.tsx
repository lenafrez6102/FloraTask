import React from 'react';
import { CategoryId, GrowthStage } from '../../types/garden';
import { FLOWER_SPECIES } from '../../constants/categories';

interface FlowerSvgProps {
  categoryId: CategoryId;
  stage: GrowthStage;
  size?: number;
  className?: string;
  animate?: boolean;
}

export const FlowerSvg: React.FC<FlowerSvgProps> = ({
  categoryId,
  stage,
  size = 64,
  className = '',
  animate = true
}) => {
  const species = FLOWER_SPECIES[categoryId] || FLOWER_SPECIES.feature;
  const { primaryColor, secondaryColor, accentColor, stemColor } = species;

  // Unique SVG IDs to avoid clip-path / gradient conflicts
  const idPrefix = `flower-${categoryId}-${stage}`;

  // If stage is 'seed'
  if (stage === 'seed') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} transition-all duration-300`}
      >
        <defs>
          <radialGradient id={`${idPrefix}-soil`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8D6E63" />
            <stop offset="70%" stopColor="#6D4C41" />
            <stop offset="100%" stopColor="#5D4037" />
          </radialGradient>
        </defs>

        {/* Soil mound */}
        <ellipse cx="50" cy="78" rx="34" ry="14" fill={`url(#${idPrefix}-soil)`} />
        <ellipse cx="40" cy="74" rx="4" ry="2" fill="#A1887F" opacity="0.6" />
        <ellipse cx="62" cy="79" rx="5" ry="2.5" fill="#A1887F" opacity="0.5" />
        <ellipse cx="52" cy="82" rx="3" ry="1.5" fill="#4E342E" />

        {/* The planted seed */}
        <g className={animate ? 'animate-soft-pulse' : ''}>
          <ellipse
            cx="50"
            cy="70"
            rx="7"
            ry="9"
            transform="rotate(15 50 70)"
            fill="#BCAAA4"
            stroke="#795548"
            strokeWidth="1.5"
          />
          {/* Microscopic tiny sprout tip */}
          <path
            d="M 52 64 C 54 58, 56 55, 60 54"
            stroke={stemColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="60" cy="54" r="2.5" fill={primaryColor} />
        </g>
      </svg>
    );
  }

  // If stage is 'sprout'
  if (stage === 'sprout') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} ${animate ? 'animate-sway' : ''} transition-all duration-300`}
      >
        {/* Soil bed */}
        <ellipse cx="50" cy="85" rx="26" ry="9" fill="#6D4C41" />
        <ellipse cx="50" cy="83" rx="20" ry="6" fill="#8D6E63" opacity="0.8" />

        {/* Stem */}
        <path
          d="M 50 84 Q 48 65 52 50"
          stroke={stemColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Left tender leaf */}
        <path
          d="M 51 58 C 42 56 34 62 38 69 C 45 69 49 63 51 58 Z"
          fill="#86EFAC"
          stroke="#4ADE80"
          strokeWidth="1.2"
        />

        {/* Right tender leaf with pastel hint */}
        <path
          d="M 51 54 C 58 50 67 54 65 62 C 59 64 53 58 51 54 Z"
          fill={secondaryColor}
          stroke={primaryColor}
          strokeWidth="1.2"
        />

        {/* Dew drop */}
        <circle cx="39" cy="65" r="1.8" fill="#E0F2FE" opacity="0.9" />
      </svg>
    );
  }

  // If stage is 'bud'
  if (stage === 'bud') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} ${animate ? 'animate-sway' : ''} transition-all duration-300`}
      >
        {/* Soil base */}
        <ellipse cx="50" cy="88" rx="22" ry="7" fill="#6D4C41" />

        {/* Stem */}
        <path
          d="M 50 86 Q 47 62 50 42"
          stroke={stemColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Side leaves */}
        <path
          d="M 49 68 C 36 65 30 73 35 79 C 43 78 47 72 49 68 Z"
          fill="#86EFAC"
          stroke="#4ADE80"
          strokeWidth="1.2"
        />
        <path
          d="M 50 56 C 62 52 68 59 64 67 C 56 67 52 61 50 56 Z"
          fill="#86EFAC"
          stroke="#4ADE80"
          strokeWidth="1.2"
        />

        {/* Calyx & Bud */}
        <g transform="translate(50, 40)">
          {/* Calyx sepal leaves */}
          <path d="M -8 8 C -5 2 0 -2 0 4 Z" fill="#6EE7B7" />
          <path d="M 8 8 C 5 2 0 -2 0 4 Z" fill="#6EE7B7" />

          {/* Swelling bud bulb */}
          <path
            d="M 0 -16 C -10 -8 -11 6 0 9 C 11 6 10 -8 0 -16 Z"
            fill={primaryColor}
            stroke={accentColor}
            strokeWidth="1.5"
          />
          <path
            d="M -3 -12 C -6 -5 -5 3 0 7 C 2 3 0 -6 -3 -12 Z"
            fill={secondaryColor}
            opacity="0.8"
          />
        </g>
      </svg>
    );
  }

  // Common stem and soil for blooming, lush, sparkle
  const renderCommonStemAndBase = (height = 86) => (
    <>
      <ellipse cx="50" cy="89" rx="22" ry="6" fill="#6D4C41" opacity="0.9" />
      <path
        d={`M 50 87 Q 48 64 50 ${height - 52}`}
        stroke={stemColor}
        strokeWidth="3.8"
        strokeLinecap="round"
      />
      {/* Lower leaves */}
      <path
        d="M 49 72 C 34 68 28 78 35 84 C 44 83 48 76 49 72 Z"
        fill="#86EFAC"
        stroke="#4ADE80"
        strokeWidth="1"
      />
      <path
        d="M 50 63 C 64 59 71 67 65 74 C 57 74 52 67 50 63 Z"
        fill="#86EFAC"
        stroke="#4ADE80"
        strokeWidth="1"
      />
    </>
  );

  // Category Specific Flower Heads (blooming / lush / sparkle)
  const isLush = stage === 'lush' || stage === 'sparkle';
  const isSparkle = stage === 'sparkle';

  const renderFlowerHead = () => {
    switch (categoryId) {
      case 'feature': {
        // Cherry Blossom / Sakura: 5 notched petals, layered
        return (
          <g transform="translate(50, 34)">
            {/* Soft background aura for lush/sparkle */}
            {isLush && (
              <circle cx="0" cy="0" r="28" fill="#FCE7F3" opacity="0.5" />
            )}
            {/* Back petals */}
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <g key={`back-${i}`} transform={`rotate(${angle + 36})`}>
                <path
                  d="M 0 0 C -12 -14 -10 -28 0 -25 C 10 -28 12 -14 0 0 Z"
                  fill={secondaryColor}
                  opacity={isLush ? 0.9 : 0.7}
                />
              </g>
            ))}
            {/* Front petals with delicate heart/notched tip */}
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <g key={`front-${i}`} transform={`rotate(${angle})`}>
                <path
                  d="M 0 0 C -10 -12 -9 -25 -2 -24 C -0.5 -22 0.5 -22 2 -24 C 9 -25 10 -12 0 0 Z"
                  fill={primaryColor}
                  stroke="#F472B6"
                  strokeWidth="0.8"
                />
              </g>
            ))}
            {/* Flower Center with stamens */}
            <circle cx="0" cy="0" r="6" fill="#FDF2F8" />
            <circle cx="0" cy="0" r="4" fill={accentColor} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, j) => (
              <line
                key={`stamen-${j}`}
                x1="0"
                y1="0"
                x2={Math.cos((ang * Math.PI) / 180) * 8}
                y2={Math.sin((ang * Math.PI) / 180) * 8}
                stroke="#DB2777"
                strokeWidth="1"
                strokeLinecap="round"
              />
            ))}
            <circle cx="0" cy="0" r="2.5" fill="#FEF08A" />
          </g>
        );
      }

      case 'bugfix': {
        // Royal Lavender: tall, graceful multi-floret spire
        return (
          <g transform="translate(50, 38)">
            {isLush && (
              <ellipse cx="0" cy="-12" rx="18" ry="28" fill="#EDE9FE" opacity="0.6" />
            )}
            {/* Lavender tiers */}
            {[
              { y: -26, count: 3, rx: 5, ry: 4 },
              { y: -19, count: 4, rx: 7, ry: 4.5 },
              { y: -11, count: 5, rx: 8.5, ry: 5 },
              { y: -3, count: 5, rx: 9, ry: 5 },
              { y: 5, count: 4, rx: 7.5, ry: 4.5 }
            ].map((tier, tIdx) => (
              <g key={`tier-${tIdx}`} transform={`translate(0, ${tier.y})`}>
                {Array.from({ length: tier.count }).map((_, fIdx) => {
                  const offset = (fIdx - (tier.count - 1) / 2) * (tier.rx * 0.85);
                  return (
                    <ellipse
                      key={`floret-${fIdx}`}
                      cx={offset}
                      cy={Math.abs(offset) * 0.2}
                      rx={tier.rx / 2.2}
                      ry={tier.ry}
                      fill={fIdx % 2 === 0 ? primaryColor : secondaryColor}
                      stroke={accentColor}
                      strokeWidth="0.8"
                    />
                  );
                })}
              </g>
            ))}
            {/* Top crown florets */}
            <path
              d="M 0 -34 C -3 -30 -2 -25 0 -24 C 2 -25 3 -30 0 -34 Z"
              fill={accentColor}
            />
            <path
              d="M -4 -31 C -7 -28 -4 -25 -2 -24"
              stroke={primaryColor}
              strokeWidth="1.2"
              fill="none"
            />
            <path
              d="M 4 -31 C 7 -28 4 -25 2 -24"
              stroke={primaryColor}
              strokeWidth="1.2"
              fill="none"
            />
          </g>
        );
      }

      case 'refactor': {
        // Chamomile Daisy: radiating clean petals + sunny textured dome
        const petalCount = isLush ? 16 : 12;
        return (
          <g transform="translate(50, 34)">
            {isLush && (
              <circle cx="0" cy="0" r="28" fill="#FEFCE8" opacity="0.6" />
            )}
            {Array.from({ length: petalCount }).map((_, i) => {
              const ang = (i * 360) / petalCount;
              return (
                <g key={`daisy-petal-${i}`} transform={`rotate(${ang})`}>
                  <ellipse
                    cx="0"
                    cy="-17"
                    rx="4.2"
                    ry="10.5"
                    fill="#FFFFFF"
                    stroke="#FEF08A"
                    strokeWidth="1"
                  />
                  <line x1="0" y1="-9" x2="0" y2="-22" stroke="#FEEF85" strokeWidth="0.7" opacity="0.7" />
                </g>
              );
            })}
            {/* Golden Honey Center */}
            <circle cx="0" cy="0" r="9.5" fill={primaryColor} stroke="#CA8A04" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="6" fill="#FACC15" />
            {/* Center seed texture dots */}
            {[-4, 0, 4].map((x) =>
              [-4, 0, 4].map((y) => (
                <circle
                  key={`dot-${x}-${y}`}
                  cx={x + (y % 2) * 1.5}
                  cy={y}
                  r="0.9"
                  fill="#A16207"
                  opacity="0.8"
                />
              ))
            )}
          </g>
        );
      }

      case 'research': {
        // Sunlit Marigold / Sunflower: layered pointed fiery petals
        return (
          <g transform="translate(50, 33)">
            {isLush && (
              <circle cx="0" cy="0" r="30" fill="#FFF7ED" opacity="0.7" />
            )}
            {/* Outer petals */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
              <g key={`out-petal-${i}`} transform={`rotate(${deg})`}>
                <path
                  d="M 0 0 Q -5 -12 0 -26 Q 5 -12 0 0 Z"
                  fill={secondaryColor}
                  stroke="#FDBA74"
                  strokeWidth="0.8"
                />
              </g>
            ))}
            {/* Inner warm petals */}
            {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((deg, j) => (
              <g key={`in-petal-${j}`} transform={`rotate(${deg})`}>
                <path
                  d="M 0 0 Q -4 -10 0 -21 Q 4 -10 0 0 Z"
                  fill={primaryColor}
                  stroke={accentColor}
                  strokeWidth="0.7"
                />
              </g>
            ))}
            {/* Center disc */}
            <circle cx="0" cy="0" r="8.5" fill="#78350F" />
            <circle cx="0" cy="0" r="6" fill="#9A3412" />
            <circle cx="0" cy="0" r="3" fill="#D97706" />
          </g>
        );
      }

      case 'design': {
        // Pastel Tulip: elegant 3-petal chalice silhouette
        return (
          <g transform="translate(50, 34)">
            {isLush && (
              <ellipse cx="0" cy="-6" rx="22" ry="24" fill="#FFE4E6" opacity="0.6" />
            )}
            {/* Left back petal */}
            <path
              d="M 0 10 C -18 8 -24 -12 -12 -26 C -4 -20 -1 -8 0 10 Z"
              fill={secondaryColor}
              stroke="#FB7185"
              strokeWidth="1"
            />
            {/* Right back petal */}
            <path
              d="M 0 10 C 18 8 24 -12 12 -26 C 4 -20 1 -8 0 10 Z"
              fill={secondaryColor}
              stroke="#FB7185"
              strokeWidth="1"
            />
            {/* Center front petal */}
            <path
              d="M 0 12 C -14 5 -12 -20 0 -28 C 12 -20 14 5 0 12 Z"
              fill={primaryColor}
              stroke={accentColor}
              strokeWidth="1.2"
            />
            {/* Petal shine highlight */}
            <path
              d="M -2 4 C -7 0 -6 -14 0 -22 C -2 -14 -4 0 -2 4 Z"
              fill="#FFFFFF"
              opacity="0.5"
            />
          </g>
        );
      }

      case 'maintenance': {
        // Mint Succulent: fleshy rosette concentric layers
        return (
          <g transform="translate(50, 35)">
            {isLush && (
              <circle cx="0" cy="0" r="26" fill="#D1FAE5" opacity="0.5" />
            )}
            {/* Layer 1 - outer fleshy leaves */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <g key={`succ-out-${i}`} transform={`rotate(${deg})`}>
                <path
                  d="M 0 0 C -9 -8 -11 -20 0 -23 C 11 -20 9 -8 0 0 Z"
                  fill={secondaryColor}
                  stroke="#34D399"
                  strokeWidth="1"
                />
                <circle cx="0" cy="-22" r="1.5" fill="#F472B6" />
              </g>
            ))}
            {/* Layer 2 - middle offset leaves */}
            {[30, 90, 150, 210, 270, 330].map((deg, j) => (
              <g key={`succ-mid-${j}`} transform={`rotate(${deg})`}>
                <path
                  d="M 0 0 C -7 -6 -8 -16 0 -18 C 8 -16 7 -6 0 0 Z"
                  fill={primaryColor}
                  stroke="#059669"
                  strokeWidth="1"
                />
                <circle cx="0" cy="-17" r="1.2" fill="#FB7185" />
              </g>
            ))}
            {/* Inner heart rosette */}
            <circle cx="0" cy="0" r="6" fill="#6EE7B7" stroke="#047857" strokeWidth="1" />
            <circle cx="0" cy="0" r="3" fill="#A7F3D0" />
          </g>
        );
      }
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animate ? 'animate-sway' : ''} transition-all duration-300 relative`}
    >
      {renderCommonStemAndBase()}
      {renderFlowerHead()}

      {/* Sparkle effects if celestial stage */}
      {isSparkle && (
        <g className="animate-soft-pulse">
          {/* Top-right sparkle */}
          <path
            d="M 78 16 Q 81 21 86 21 Q 81 21 78 26 Q 78 21 73 21 Q 78 21 78 16 Z"
            fill="#FACC15"
          />
          {/* Top-left sparkle */}
          <path
            d="M 22 18 Q 24 22 28 22 Q 24 22 22 26 Q 22 22 18 22 Q 22 22 22 18 Z"
            fill="#FACC15"
          />
          {/* Bottom-right micro star */}
          <circle cx="82" cy="38" r="2" fill="#FDE047" />
          <circle cx="18" cy="40" r="1.8" fill="#FDE047" />
          {/* Golden floating dust */}
          <circle cx="50" cy="10" r="1.5" fill="#FACC15" />
        </g>
      )}
    </svg>
  );
};
