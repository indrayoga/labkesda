export default function MedicalLabBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <svg
        className="absolute h-full w-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: '#E0F2FE', stopOpacity: 1 }}
            />
            <stop
              offset="50%"
              style={{ stopColor: '#F0F9FF', stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: '#E0F2FE', stopOpacity: 1 }}
            />
          </linearGradient>

          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>

          <filter id="centerBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          </filter>
        </defs>

        {/* Background */}
        <rect width="1920" height="1080" fill="url(#bgGradient)" />

        {/* Decorative circles and shapes */}
        <circle cx="200" cy="200" r="150" fill="#CCFBF1" opacity="0.3" />
        <circle cx="1720" cy="180" r="120" fill="#DBEAFE" opacity="0.3" />
        <circle cx="1650" cy="850" r="180" fill="#E0E7FF" opacity="0.3" />
        <circle cx="150" cy="900" r="100" fill="#CCFBF1" opacity="0.3" />

        {/* Left side - Microscope */}
        <g transform="translate(180, 400)" opacity="0.7">
          {/* Microscope base */}
          <rect x="40" y="180" width="120" height="15" rx="7" fill="#0891B2" />
          <rect x="65" y="160" width="70" height="25" rx="5" fill="#0E7490" />
          {/* Microscope arm */}
          <rect x="90" y="50" width="12" height="115" rx="6" fill="#0891B2" />
          {/* Eyepiece */}
          <ellipse cx="96" cy="40" rx="18" ry="25" fill="#06B6D4" />
          <ellipse cx="96" cy="35" rx="12" ry="8" fill="#67E8F9" />
          {/* Objective lens */}
          <rect x="75" y="150" width="42" height="15" rx="7" fill="#0E7490" />
          <rect x="85" y="165" width="22" height="8" fill="#0891B2" />
          {/* Stage */}
          <rect x="60" y="140" width="72" height="6" rx="3" fill="#06B6D4" />
        </g>

        {/* Left side - Test tubes */}
        <g transform="translate(120, 650)" opacity="0.6">
          <rect
            x="0"
            y="20"
            width="20"
            height="80"
            rx="10"
            fill="#DBEAFE"
            stroke="#3B82F6"
            strokeWidth="2"
          />
          <rect x="0" y="20" width="20" height="35" rx="10" fill="#93C5FD" />

          <rect
            x="30"
            y="10"
            width="20"
            height="90"
            rx="10"
            fill="#E0F2FE"
            stroke="#0891B2"
            strokeWidth="2"
          />
          <rect x="30" y="10" width="20" height="50" rx="10" fill="#67E8F9" />

          <rect
            x="60"
            y="15"
            width="20"
            height="85"
            rx="10"
            fill="#F0F9FF"
            stroke="#06B6D4"
            strokeWidth="2"
          />
          <rect x="60" y="15" width="20" height="40" rx="10" fill="#A5F3FC" />
        </g>

        {/* Right side - Beakers and flasks */}
        <g transform="translate(1580, 450)" opacity="0.6">
          {/* Beaker */}
          <path
            d="M 0 40 L 10 80 L 70 80 L 80 40 Z"
            fill="#E0F2FE"
            stroke="#0891B2"
            strokeWidth="2"
          />
          <rect
            x="10"
            y="55"
            width="60"
            height="25"
            fill="#67E8F9"
            opacity="0.7"
          />
          <line
            x1="15"
            y1="50"
            x2="65"
            y2="50"
            stroke="#0E7490"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="15"
            y1="60"
            x2="65"
            y2="60"
            stroke="#0E7490"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="15"
            y1="70"
            x2="65"
            y2="70"
            stroke="#0E7490"
            strokeWidth="1"
            opacity="0.5"
          />
        </g>

        <g transform="translate(1640, 620)" opacity="0.6">
          {/* Erlenmeyer flask */}
          <path
            d="M 30 10 L 30 30 L 10 80 L 70 80 L 50 30 L 50 10 Z"
            fill="#DBEAFE"
            stroke="#3B82F6"
            strokeWidth="2"
          />
          <path
            d="M 20 65 L 60 65 L 50 30 L 30 30 Z"
            fill="#93C5FD"
            opacity="0.7"
          />
          <rect
            x="28"
            y="5"
            width="24"
            height="8"
            rx="4"
            fill="#E0F2FE"
            stroke="#3B82F6"
            strokeWidth="2"
          />
        </g>

        {/* Top right - Medical icons */}
        <g transform="translate(1550, 150)" opacity="0.5">
          {/* DNA Helix simplified */}
          <circle cx="20" cy="20" r="6" fill="#06B6D4" />
          <circle cx="20" cy="50" r="6" fill="#0891B2" />
          <circle cx="20" cy="80" r="6" fill="#06B6D4" />
          <line
            x1="20"
            y1="26"
            x2="20"
            y2="44"
            stroke="#0E7490"
            strokeWidth="3"
          />
          <line
            x1="20"
            y1="56"
            x2="20"
            y2="74"
            stroke="#0E7490"
            strokeWidth="3"
          />
        </g>

        {/* Bottom right - Petri dish */}
        <g transform="translate(1500, 780)" opacity="0.6">
          <ellipse
            cx="60"
            cy="60"
            rx="55"
            ry="50"
            fill="#E0F2FE"
            stroke="#0891B2"
            strokeWidth="2"
          />
          <ellipse
            cx="60"
            cy="60"
            rx="45"
            ry="40"
            fill="none"
            stroke="#0891B2"
            strokeWidth="1"
            opacity="0.3"
          />
          <circle cx="45" cy="50" r="8" fill="#67E8F9" opacity="0.7" />
          <circle cx="75" cy="55" r="6" fill="#67E8F9" opacity="0.7" />
          <circle cx="60" cy="70" r="7" fill="#67E8F9" opacity="0.7" />
          <circle cx="50" cy="65" r="5" fill="#67E8F9" opacity="0.7" />
        </g>

        {/* Top left - Pills/Capsules */}
        <g transform="translate(280, 180)" opacity="0.5">
          <ellipse cx="20" cy="15" rx="18" ry="12" fill="#93C5FD" />
          <rect x="2" y="15" width="18" height="12" fill="#3B82F6" />
          <rect x="20" y="15" width="18" height="12" fill="#DBEAFE" />
        </g>

        {/* Medical cross icons scattered */}
        <g opacity="0.3">
          <g transform="translate(400, 250)">
            <rect x="8" y="0" width="4" height="20" rx="2" fill="#06B6D4" />
            <rect x="0" y="8" width="20" height="4" rx="2" fill="#06B6D4" />
          </g>
          <g transform="translate(1350, 350)">
            <rect x="8" y="0" width="4" height="20" rx="2" fill="#3B82F6" />
            <rect x="0" y="8" width="20" height="4" rx="2" fill="#3B82F6" />
          </g>
          <g transform="translate(350, 850)">
            <rect x="6" y="0" width="3" height="15" rx="1.5" fill="#0891B2" />
            <rect x="0" y="6" width="15" height="3" rx="1.5" fill="#0891B2" />
          </g>
        </g>

        {/* Molecules/Atoms decoration */}
        <g transform="translate(1200, 200)" opacity="0.4">
          <circle cx="30" cy="30" r="8" fill="#93C5FD" />
          <circle cx="60" cy="25" r="6" fill="#67E8F9" />
          <circle cx="50" cy="55" r="7" fill="#A5F3FC" />
          <line
            x1="38"
            y1="30"
            x2="52"
            y2="28"
            stroke="#0891B2"
            strokeWidth="2"
          />
          <line
            x1="35"
            y1="37"
            x2="45"
            y2="50"
            stroke="#0891B2"
            strokeWidth="2"
          />
        </g>

        <g transform="translate(450, 780)" opacity="0.4">
          <circle cx="20" cy="20" r="6" fill="#DBEAFE" />
          <circle cx="45" cy="18" r="5" fill="#93C5FD" />
          <circle cx="32" cy="40" r="5.5" fill="#67E8F9" />
          <line
            x1="26"
            y1="20"
            x2="40"
            y2="19"
            stroke="#3B82F6"
            strokeWidth="1.5"
          />
          <line
            x1="24"
            y1="26"
            x2="30"
            y2="35"
            stroke="#3B82F6"
            strokeWidth="1.5"
          />
        </g>

        {/* Center blur overlay to make space for login form */}
        <rect
          x="660"
          y="200"
          width="600"
          height="680"
          fill="white"
          opacity="0.4"
          filter="url(#centerBlur)"
          rx="20"
        />
      </svg>
    </div>
  );
}
