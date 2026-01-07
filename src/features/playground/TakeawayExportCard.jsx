import { forwardRef } from 'react';

const TakeawayExportCard = forwardRef(function TakeawayExportCard({ takeaway }, ref) {
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      ref={ref}
      style={{
        width: '540px',
        height: '540px',
        padding: '48px',
        background: 'linear-gradient(135deg, #2D5A4A 0%, #234A3C 50%, #1A3A2E 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Decorative elements */}
      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '60px',
          right: '60px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(232, 132, 107, 0.1)',
        }}
      />

      {/* Quote marks */}
      <div
        style={{
          fontSize: '120px',
          fontFamily: "'Crimson Pro', Georgia, serif",
          color: 'rgba(255, 255, 255, 0.1)',
          lineHeight: 1,
          marginBottom: '-20px',
        }}
      >
        "
      </div>

      {/* Takeaway text */}
      <div
        style={{
          fontSize: '28px',
          fontWeight: 500,
          color: 'white',
          textAlign: 'center',
          lineHeight: 1.5,
          maxWidth: '420px',
          marginBottom: '32px',
        }}
      >
        {takeaway || 'Your takeaway here'}
      </div>

      {/* Date */}
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.5)',
          marginBottom: '24px',
        }}
      >
        {today}
      </div>

      {/* Brand */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'white',
          }}
        >
          En-Buddy
        </span>
      </div>
    </div>
  );
});

export default TakeawayExportCard;
