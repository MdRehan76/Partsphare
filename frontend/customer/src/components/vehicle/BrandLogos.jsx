import React from 'react';

/**
 * Crisp, stylized SVG brand emblems for automotive and two-wheeler manufacturers.
 * Designed to look pristine in both Light and Dark themes without external image dependencies.
 */
export const BrandLogo = ({ brandId, brandName, size = 44, className = '' }) => {
  const norm = (brandName || brandId || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Maruti Suzuki
  if (norm.includes('maruti') || norm.includes('suzuki')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Maruti Suzuki">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <path d="M12 16L36 16L18 32L36 32" stroke="#dc2626" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 24L34 24" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // 2. Hyundai
  if (norm.includes('hyundai')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Hyundai">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <ellipse cx="24" cy="24" rx="18" ry="12" stroke="#0284c7" strokeWidth="2.5" />
        <path d="M17 18V30M31 18V30M17 24L31 22" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 3. Tata
  if (norm.includes('tata')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Tata">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="16" stroke="#2563eb" strokeWidth="2" />
        <path d="M16 19C20 22 24 23 24 33C24 23 28 22 32 19" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 18H33" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // 4. Honda
  if (norm.includes('honda')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Honda">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <rect x="11" y="12" width="26" height="24" rx="4" stroke="#dc2626" strokeWidth="2" />
        <path d="M16 16L19 32H22L23 24H25L26 32H29L32 16H28L26 21H22L20 16H16Z" fill="#dc2626" />
      </svg>
    );
  }

  // 5. Toyota
  if (norm.includes('toyota')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Toyota">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <ellipse cx="24" cy="24" rx="17" ry="12" stroke="#dc2626" strokeWidth="2.5" />
        <ellipse cx="24" cy="20" rx="9" ry="5.5" stroke="#dc2626" strokeWidth="2" />
        <ellipse cx="24" cy="24" rx="5" ry="11" stroke="#dc2626" strokeWidth="2" />
      </svg>
    );
  }

  // 6. Kia
  if (norm.includes('kia')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Kia">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <text x="24" y="29" textAnchor="middle" fill="#0f172a" style={{ fill: 'var(--text-primary, #0f172a)', fontStyle: 'italic', fontWeight: 900, fontSize: 16, letterSpacing: '0.05em', fontFamily: 'sans-serif' }}>
          KIA
        </text>
      </svg>
    );
  }

  // 7. Mahindra
  if (norm.includes('mahindra')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Mahindra">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <path d="M14 30L22 16L24 22L26 16L34 30" stroke="#ea580c" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="24" cy="28" r="2.5" fill="#ea580c" />
      </svg>
    );
  }

  // 8. Volkswagen
  if (norm.includes('volkswagen')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Volkswagen">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="15" stroke="#0284c7" strokeWidth="2.5" />
        <path d="M15 17L22 31L24 26L26 31L33 17" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 16L24 25L30 16" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 9. Skoda
  if (norm.includes('skoda')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Skoda">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="15" stroke="#16a34a" strokeWidth="2" />
        <path d="M17 26C19 21 27 18 31 16C29 21 26 26 21 29L17 26Z" fill="#16a34a" />
        <circle cx="23" cy="21" r="2" fill="white" />
      </svg>
    );
  }

  // 10. Renault
  if (norm.includes('renault')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Renault">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <path d="M24 11L33 24L24 37L15 24L24 11Z" stroke="#eab308" strokeWidth="3" strokeLinejoin="round" />
        <path d="M24 18L28 24L24 30L20 24L24 18Z" fill="#eab308" />
      </svg>
    );
  }

  // 11. Nissan
  if (norm.includes('nissan')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Nissan">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="14" stroke="#64748b" strokeWidth="2.5" />
        <rect x="12" y="21" width="24" height="6" fill="#dc2626" rx="1" />
        <text x="24" y="26" textAnchor="middle" fill="#ffffff" style={{ fontWeight: 800, fontSize: 5, letterSpacing: '0.1em' }}>
          NISSAN
        </text>
      </svg>
    );
  }

  // 12. MG Motor
  if (norm.includes('mg')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="MG Motor">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <polygon points="17,12 31,12 37,24 31,36 17,36 11,24" stroke="#dc2626" strokeWidth="2.5" fill="none" />
        <text x="24" y="29" textAnchor="middle" fill="#dc2626" style={{ fontWeight: 900, fontSize: 13, letterSpacing: '0.05em' }}>
          MG
        </text>
      </svg>
    );
  }

  // 13. Jeep
  if (norm.includes('jeep')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Jeep">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <text x="24" y="29" textAnchor="middle" fill="#15803d" style={{ fontWeight: 900, fontSize: 15, letterSpacing: '0.08em', fontFamily: 'sans-serif' }}>
          Jeep
        </text>
      </svg>
    );
  }

  // 14. Ford
  if (norm.includes('ford')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Ford">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <ellipse cx="24" cy="24" rx="17" ry="11" fill="#1d4ed8" />
        <ellipse cx="24" cy="24" rx="15" ry="9.5" stroke="#ffffff" strokeWidth="1" />
        <text x="24" y="28" textAnchor="middle" fill="#ffffff" style={{ fontStyle: 'italic', fontWeight: 800, fontSize: 13, fontFamily: 'serif' }}>
          Ford
        </text>
      </svg>
    );
  }

  // 15. BMW
  if (norm.includes('bmw')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="BMW">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="15" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" />
        <path d="M24 13 A 11 11 0 0 1 35 24 L 24 24 Z" fill="#0284c7" />
        <path d="M24 24 L 24 35 A 11 11 0 0 1 13 24 Z" fill="#0284c7" />
        <path d="M24 13 L 24 24 L 13 24 A 11 11 0 0 1 24 13 Z" fill="#ffffff" />
        <path d="M24 24 L 35 24 A 11 11 0 0 1 24 35 Z" fill="#ffffff" />
        <circle cx="24" cy="24" r="11" stroke="#0f172a" strokeWidth="1" fill="none" />
      </svg>
    );
  }

  // 16. Mercedes-Benz
  if (norm.includes('mercedes') || norm.includes('benz')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Mercedes-Benz">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="15" stroke="#64748b" strokeWidth="2.5" />
        <path d="M24 9L24 24L11 31.5L24 24L37 31.5L24 24Z" stroke="#64748b" strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points="24,9 24,24 11,31.5" fill="#94a3b8" opacity="0.6" />
        <polygon points="24,24 37,31.5 24,9" fill="#cbd5e1" opacity="0.8" />
      </svg>
    );
  }

  // 17. Audi
  if (norm.includes('audi')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Audi">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <circle cx="15" cy="24" r="6" stroke="#64748b" strokeWidth="2" fill="none" />
        <circle cx="21" cy="24" r="6" stroke="#64748b" strokeWidth="2" fill="none" />
        <circle cx="27" cy="24" r="6" stroke="#64748b" strokeWidth="2" fill="none" />
        <circle cx="33" cy="24" r="6" stroke="#64748b" strokeWidth="2" fill="none" />
      </svg>
    );
  }

  // 18. Isuzu
  if (norm.includes('isuzu')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Isuzu">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <text x="24" y="29" textAnchor="middle" fill="#dc2626" style={{ fontWeight: 900, fontSize: 12, letterSpacing: '0.08em', fontFamily: 'sans-serif' }}>
          ISUZU
        </text>
      </svg>
    );
  }

  // 19. Citroen
  if (norm.includes('citroen')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Citroen">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <path d="M17 19L24 13L31 19" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 28L24 22L31 28" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 20. Volvo
  if (norm.includes('volvo')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Volvo">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <circle cx="23" cy="25" r="12" stroke="#2563eb" strokeWidth="2.5" />
        <path d="M31 17L37 11M37 11H31M37 11V17" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="12" y="23" width="22" height="4" fill="#1e3a8a" rx="1" />
        <text x="23" y="26.5" textAnchor="middle" fill="#ffffff" style={{ fontWeight: 800, fontSize: 3.8, letterSpacing: '0.12em' }}>
          VOLVO
        </text>
      </svg>
    );
  }

  // 21. Hero
  if (norm.includes('hero')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Hero">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <path d="M15 14V34M24 14V34M15 24H24" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M28 20L34 27L28 34" stroke="#0f172a" style={{ stroke: 'var(--text-primary, #0f172a)' }} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 22. Bajaj
  if (norm.includes('bajaj')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Bajaj">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <path d="M16 16C22 16 26 19 26 24C26 29 22 32 16 32H13V16H16Z" stroke="#2563eb" strokeWidth="3" />
        <path d="M24 16C30 16 34 19 34 24C34 29 30 32 24 32" stroke="#2563eb" strokeWidth="3" />
      </svg>
    );
  }

  // 23. Royal Enfield
  if (norm.includes('royal') || norm.includes('enfield') || norm.includes('re')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Royal Enfield">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="14" stroke="#d97706" strokeWidth="2" strokeDasharray="3 2" />
        <text x="24" y="27" textAnchor="middle" fill="#d97706" style={{ fontWeight: 900, fontSize: 10, letterSpacing: '0.05em', fontFamily: 'serif' }}>
          RE
        </text>
        <circle cx="24" cy="24" r="8" stroke="#d97706" strokeWidth="1" fill="none" />
      </svg>
    );
  }

  // 24. Yamaha
  if (norm.includes('yamaha')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Yamaha">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="15" stroke="#dc2626" strokeWidth="2" />
        <path d="M24 13V35M15 19L33 29M15 29L33 19" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="24" r="4" fill="#dc2626" />
      </svg>
    );
  }

  // 25. KTM
  if (norm.includes('ktm')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="KTM">
        <rect width="48" height="48" rx="12" fill="#ea580c" />
        <text x="24" y="30" textAnchor="middle" fill="#ffffff" style={{ fontWeight: 900, fontStyle: 'italic', fontSize: 15, letterSpacing: '0.06em', fontFamily: 'sans-serif' }}>
          KTM
        </text>
      </svg>
    );
  }

  // 26. TVS
  if (norm.includes('tvs')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="TVS">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <path d="M12 20C17 16 26 16 35 20C28 23 20 23 12 20Z" fill="#dc2626" />
        <text x="24" y="33" textAnchor="middle" fill="#2563eb" style={{ fontWeight: 900, fontSize: 13, letterSpacing: '0.1em' }}>
          TVS
        </text>
      </svg>
    );
  }

  // 27. Ola Electric
  if (norm.includes('ola')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="Ola Electric">
        <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="14" stroke="#10b981" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="6" fill="#10b981" />
      </svg>
    );
  }

  // Generic Fallback Badge
  const initials = (brandName || 'VN').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label={brandName || 'Vehicle Brand'}>
      <rect width="48" height="48" rx="12" fill="var(--bg-secondary, #f1f5f9)" stroke="var(--border-color, #cbd5e1)" strokeWidth="1.5" />
      <text x="24" y="29" textAnchor="middle" fill="var(--color-primary-600, #0284c7)" style={{ fontWeight: 800, fontSize: 14 }}>
        {initials}
      </text>
    </svg>
  );
};

export default BrandLogo;
