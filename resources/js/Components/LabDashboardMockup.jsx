export default function LabDashboardMockup() {
  return (
    <div className="relative w-full">
      <svg
        className="h-auto w-full"
        viewBox="0 0 800 600"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="screenGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              style={{ stopColor: '#F0F9FF', stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: '#E0F2FE', stopOpacity: 1 }}
            />
          </linearGradient>

          <linearGradient id="cardGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: '#FFFFFF', stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: '#F8FAFC', stopOpacity: 1 }}
            />
          </linearGradient>

          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.1" />
          </filter>

          <filter id="softShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Device frame - Laptop/Monitor */}
        <g transform="translate(50, 40)">
          {/* Monitor stand */}
          <rect x="320" y="480" width="60" height="40" rx="4" fill="#CBD5E1" />
          <rect x="280" y="520" width="140" height="8" rx="4" fill="#94A3B8" />

          {/* Monitor frame */}
          <rect x="0" y="0" width="700" height="480" rx="12" fill="#1E293B" />

          {/* Screen */}
          <rect
            x="15"
            y="15"
            width="670"
            height="450"
            rx="6"
            fill="url(#screenGradient)"
          />

          {/* Screen content - Dashboard */}
          <g transform="translate(15, 15)">
            {/* Top Navigation Bar */}
            <rect x="0" y="0" width="670" height="50" rx="6" fill="#0891B2" />

            {/* Logo/Title area */}
            <circle cx="25" cy="25" r="12" fill="#CCFBF1" opacity="0.9" />
            <rect
              x="45"
              y="18"
              width="120"
              height="14"
              rx="3"
              fill="#E0F2FE"
              opacity="0.9"
            />

            {/* Nav items */}
            <rect
              x="480"
              y="18"
              width="50"
              height="14"
              rx="3"
              fill="#F0F9FF"
              opacity="0.7"
            />
            <rect
              x="540"
              y="18"
              width="50"
              height="14"
              rx="3"
              fill="#F0F9FF"
              opacity="0.7"
            />
            <rect
              x="600"
              y="18"
              width="50"
              height="14"
              rx="3"
              fill="#F0F9FF"
              opacity="0.7"
            />

            {/* Main content area */}
            <rect
              x="20"
              y="70"
              width="630"
              height="360"
              rx="8"
              fill="#FFFFFF"
              opacity="0.95"
            />

            {/* Statistics Cards Row */}
            <g transform="translate(35, 85)">
              {/* Card 1 - Patients */}
              <rect
                x="0"
                y="0"
                width="140"
                height="90"
                rx="8"
                fill="url(#cardGradient)"
                filter="url(#softShadow)"
              />
              <circle cx="25" cy="25" r="14" fill="#DBEAFE" />
              <path
                d="M 20 20 L 20 28 M 25 15 L 25 28 M 30 22 L 30 28"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <rect x="15" y="50" width="80" height="8" rx="2" fill="#E0E7FF" />
              <rect
                x="15"
                y="65"
                width="110"
                height="12"
                rx="2"
                fill="#3B82F6"
                opacity="0.2"
              />

              {/* Card 2 - Tests */}
              <rect
                x="160"
                y="0"
                width="140"
                height="90"
                rx="8"
                fill="url(#cardGradient)"
                filter="url(#softShadow)"
              />
              <circle cx="185" cy="25" r="14" fill="#CCFBF1" />
              <rect
                x="177"
                y="18"
                width="6"
                height="14"
                rx="3"
                fill="#0891B2"
              />
              <rect
                x="185"
                y="18"
                width="6"
                height="14"
                rx="3"
                fill="#06B6D4"
              />
              <rect
                x="193"
                y="18"
                width="6"
                height="14"
                rx="3"
                fill="#0891B2"
              />
              <rect
                x="175"
                y="50"
                width="80"
                height="8"
                rx="2"
                fill="#CCFBF1"
              />
              <rect
                x="175"
                y="65"
                width="110"
                height="12"
                rx="2"
                fill="#0891B2"
                opacity="0.2"
              />

              {/* Card 3 - Reports */}
              <rect
                x="320"
                y="0"
                width="140"
                height="90"
                rx="8"
                fill="url(#cardGradient)"
                filter="url(#softShadow)"
              />
              <circle cx="345" cy="25" r="14" fill="#E0E7FF" />
              <path
                d="M 338 22 L 338 28 L 352 28 L 352 18 L 345 18 Z"
                fill="none"
                stroke="#6366F1"
                strokeWidth="2"
              />
              <line
                x1="342"
                y1="23"
                x2="348"
                y2="23"
                stroke="#6366F1"
                strokeWidth="1.5"
              />
              <rect
                x="335"
                y="50"
                width="80"
                height="8"
                rx="2"
                fill="#E0E7FF"
              />
              <rect
                x="335"
                y="65"
                width="110"
                height="12"
                rx="2"
                fill="#6366F1"
                opacity="0.2"
              />

              {/* Card 4 - Samples */}
              <rect
                x="480"
                y="0"
                width="140"
                height="90"
                rx="8"
                fill="url(#cardGradient)"
                filter="url(#softShadow)"
              />
              <circle cx="505" cy="25" r="14" fill="#FEF3C7" />
              <ellipse
                cx="505"
                cy="25"
                rx="8"
                ry="10"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
              />
              <circle cx="505" cy="25" r="3" fill="#F59E0B" />
              <rect
                x="495"
                y="50"
                width="80"
                height="8"
                rx="2"
                fill="#FEF3C7"
              />
              <rect
                x="495"
                y="65"
                width="110"
                height="12"
                rx="2"
                fill="#F59E0B"
                opacity="0.2"
              />
            </g>

            {/* Table/List Section */}
            <g transform="translate(35, 200)">
              <rect
                x="0"
                y="0"
                width="600"
                height="200"
                rx="8"
                fill="url(#cardGradient)"
                filter="url(#softShadow)"
              />

              {/* Table Header */}
              <rect
                x="10"
                y="10"
                width="580"
                height="30"
                rx="4"
                fill="#F1F5F9"
              />
              <rect x="20" y="18" width="80" height="8" rx="2" fill="#64748B" />
              <rect
                x="120"
                y="18"
                width="100"
                height="8"
                rx="2"
                fill="#64748B"
              />
              <rect
                x="240"
                y="18"
                width="80"
                height="8"
                rx="2"
                fill="#64748B"
              />
              <rect
                x="340"
                y="18"
                width="100"
                height="8"
                rx="2"
                fill="#64748B"
              />
              <rect
                x="460"
                y="18"
                width="60"
                height="8"
                rx="2"
                fill="#64748B"
              />

              {/* Table Rows */}
              <g transform="translate(0, 45)">
                {/* Row 1 */}
                <rect
                  x="20"
                  y="5"
                  width="60"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="120"
                  y="5"
                  width="90"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="240"
                  y="5"
                  width="70"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="340"
                  y="5"
                  width="80"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="460"
                  y="5"
                  width="50"
                  height="16"
                  rx="8"
                  fill="#DBEAFE"
                />

                {/* Row 2 */}
                <rect
                  x="20"
                  y="30"
                  width="60"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="120"
                  y="30"
                  width="90"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="240"
                  y="30"
                  width="70"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="340"
                  y="30"
                  width="80"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="460"
                  y="30"
                  width="50"
                  height="16"
                  rx="8"
                  fill="#FEF3C7"
                />

                {/* Row 3 */}
                <rect
                  x="20"
                  y="55"
                  width="60"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="120"
                  y="55"
                  width="90"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="240"
                  y="55"
                  width="70"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="340"
                  y="55"
                  width="80"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="460"
                  y="55"
                  width="50"
                  height="16"
                  rx="8"
                  fill="#CCFBF1"
                />

                {/* Row 4 */}
                <rect
                  x="20"
                  y="80"
                  width="60"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="120"
                  y="80"
                  width="90"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="240"
                  y="80"
                  width="70"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="340"
                  y="80"
                  width="80"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="460"
                  y="80"
                  width="50"
                  height="16"
                  rx="8"
                  fill="#DBEAFE"
                />

                {/* Row 5 */}
                <rect
                  x="20"
                  y="105"
                  width="60"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="120"
                  y="105"
                  width="90"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="240"
                  y="105"
                  width="70"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="340"
                  y="105"
                  width="80"
                  height="8"
                  rx="2"
                  fill="#94A3B8"
                  opacity="0.5"
                />
                <rect
                  x="460"
                  y="105"
                  width="50"
                  height="16"
                  rx="8"
                  fill="#E0E7FF"
                />
              </g>
            </g>
          </g>
        </g>

        {/* Floating medical icons around the mockup */}
        <g opacity="0.6">
          {/* Test tube icon - top left */}
          <g transform="translate(20, 80)">
            <rect
              x="0"
              y="5"
              width="12"
              height="40"
              rx="6"
              fill="#E0F2FE"
              stroke="#0891B2"
              strokeWidth="1.5"
            />
            <rect x="0" y="5" width="12" height="18" rx="6" fill="#67E8F9" />
          </g>

          {/* Medical cross - top right */}
          <g transform="translate(760, 100)">
            <rect x="6" y="0" width="3" height="18" rx="1.5" fill="#3B82F6" />
            <rect x="0" y="6" width="15" height="3" rx="1.5" fill="#3B82F6" />
          </g>

          {/* Microscope mini - bottom left */}
          <g transform="translate(25, 480)">
            <circle cx="10" cy="10" r="8" fill="#CCFBF1" />
            <rect x="8" y="4" width="4" height="12" rx="2" fill="#0891B2" />
          </g>

          {/* DNA/molecule - bottom right */}
          <g transform="translate(755, 450)">
            <circle cx="10" cy="8" r="5" fill="#DBEAFE" />
            <circle cx="10" cy="22" r="4" fill="#93C5FD" />
            <line
              x1="10"
              y1="13"
              x2="10"
              y2="18"
              stroke="#3B82F6"
              strokeWidth="2"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
