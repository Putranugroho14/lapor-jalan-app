// Apple-Inspired Design System
// Centralized styling constants for consistent, premium UI

export const colors = {
    // Primary Colors
    primary: '#007AFF',
    primaryDark: '#0051D5',
    primaryLight: '#5AC8FA',

    // Background Colors
    background: '#F5F5F7',
    backgroundSecondary: '#E0E5EC',
    backgroundTertiary: '#FAFAFA',

    // Glass Effects
    glass: 'rgba(255, 255, 255, 0.6)',
    glassDark: 'rgba(255, 255, 255, 0.4)',
    glassBorder: 'rgba(255, 255, 255, 0.4)',
    glassHover: 'rgba(255, 255, 255, 0.75)',

    // Text Colors
    text: '#1D1D1F',
    textSecondary: '#86868B',
    textTertiary: '#C7C7CC',
    white: '#FFFFFF',

    // Status Colors
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
    info: '#5AC8FA',

    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
    gradientDanger: 'linear-gradient(135deg, #FF3B30 0%, #D32F2F 100%)',
    gradientSuccess: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
    gradientBackground: 'linear-gradient(135deg, #F5F5F7 0%, #E0E5EC 50%, #F0F4FF 100%)',
    gradientBackgroundAnimated: 'linear-gradient(135deg, #F5F5F7 0%, #E0E5EC 25%, #F0F4FF 50%, #E0E5EC 75%, #F5F5F7 100%)',
    gradientDarkAnimated: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #1f1f1f 50%, #2d2d2d 75%, #1a1a1a 100%)',
    gradientAuth: 'linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #1e3a8a 100%)', // Deep Space Blue
    gradientLiquid: 'linear-gradient(45deg, #3b82f630 0%, #1e3a8a30 100%)',

    // Overlays
    overlayDark: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(255, 255, 255, 0.3)',
};

export const typography = {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",

    // Heading Styles
    h1: {
        fontSize: '48px',
        fontWeight: '700',
        lineHeight: '1.1',
        letterSpacing: '-0.5px',
    },
    h2: {
        fontSize: '36px',
        fontWeight: '700',
        lineHeight: '1.2',
        letterSpacing: '-0.3px',
    },
    h3: {
        fontSize: '28px',
        fontWeight: '600',
        lineHeight: '1.3',
        letterSpacing: '-0.2px',
    },
    h4: {
        fontSize: '22px',
        fontWeight: '600',
        lineHeight: '1.4',
    },

    // Body Styles
    body: {
        fontSize: '16px',
        fontWeight: '400',
        lineHeight: '1.5',
    },
    bodyLarge: {
        fontSize: '18px',
        fontWeight: '400',
        lineHeight: '1.6',
    },
    bodySmall: {
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '1.5',
    },

    // Caption Styles
    caption: {
        fontSize: '13px',
        fontWeight: '400',
        lineHeight: '1.4',
        color: colors.textSecondary,
    },
    captionBold: {
        fontSize: '13px',
        fontWeight: '600',
        lineHeight: '1.4',
    },
};

export const spacing = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
    xxxl: '64px',
};

export const borderRadius = {
    sm: '8px',
    md: '12px',
    lg: '20px',
    xl: '30px',
    pill: '50px',
    round: '50%',
};

export const shadows = {
    sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
    md: '0 4px 16px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.12)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.15)',

    // Colored Shadows
    primary: '0 8px 24px rgba(0, 122, 255, 0.3)',
    danger: '0 8px 24px rgba(255, 59, 48, 0.3)',
    success: '0 8px 24px rgba(52, 199, 89, 0.3)',

    // Inner Shadows
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
    innerLg: 'inset 0 4px 8px rgba(0, 0, 0, 0.1)',
};

export const transitions = {
    fast: '0.15s ease-in-out',
    normal: '0.3s ease-in-out',
    slow: '0.5s ease-in-out',
    bounce: '0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// Glassmorphism Component Styles
export const glass = {
    card: {
        background: colors.glass,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)', // Safari support
        border: `1px solid ${colors.glassBorder}`,
        boxShadow: shadows.lg,
        borderRadius: borderRadius.lg,
    },
    cardHover: {
        background: colors.glassHover,
        transform: 'translateY(-4px)',
        boxShadow: shadows.xl,
    },
    navbar: {
        background: colors.glass,
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: `1px solid ${colors.glassBorder}`,
        boxShadow: shadows.md,
        borderRadius: borderRadius.pill,
    },
    input: {
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: `1px solid ${colors.glassBorder}`,
        borderRadius: borderRadius.lg,
    },
};

// Button Styles
export const buttons = {
    primary: {
        background: colors.gradientPrimary,
        color: colors.white,
        border: 'none',
        borderRadius: borderRadius.lg,
        padding: '14px 28px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: shadows.primary,
        transition: transitions.normal,
        fontFamily: typography.fontFamily,
    },
    primaryHover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 32px rgba(0, 122, 255, 0.4)',
    },

    danger: {
        background: colors.gradientDanger,
        color: colors.white,
        border: 'none',
        borderRadius: borderRadius.lg,
        padding: '14px 28px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: shadows.danger,
        transition: transitions.normal,
        fontFamily: typography.fontFamily,
    },

    secondary: {
        background: colors.glass,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: colors.text,
        border: `1px solid ${colors.glassBorder}`,
        borderRadius: borderRadius.lg,
        padding: '14px 28px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: transitions.normal,
        fontFamily: typography.fontFamily,
    },

    pill: {
        borderRadius: borderRadius.pill,
        padding: '12px 24px',
    },

    icon: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: borderRadius.md,
        transition: transitions.fast,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconHover: {
        background: 'rgba(0, 0, 0, 0.05)',
        transform: 'scale(1.1)',
    },
};

// Input Styles
export const inputs = {
    base: {
        width: '100%',
        padding: '16px 24px',
        fontSize: '16px',
        fontFamily: typography.fontFamily,
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: `1px solid ${colors.glassBorder}`,
        borderRadius: borderRadius.lg,
        outline: 'none',
        transition: transitions.normal,
        color: colors.text,
    },
    focus: {
        background: 'rgba(255, 255, 255, 0.7)',
        border: `1px solid ${colors.primary}`,
        boxShadow: `0 0 0 4px rgba(0, 122, 255, 0.1)`,
        transform: 'scale(1.01)',
    },
    pill: {
        borderRadius: borderRadius.pill,
        padding: '16px 28px',
    },
};

// Card Styles
export const cards = {
    base: {
        background: colors.glass,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${colors.glassBorder}`,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        boxShadow: shadows.lg,
        transition: transitions.normal,
    },
    hover: {
        transform: 'translateY(-8px)',
        boxShadow: shadows.xl,
    },
    compact: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
    },
};

// Layout Styles
export const layout = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: `0 ${spacing.lg}`,
    },
    section: {
        padding: `${spacing.xxl} 0`,
    },
    grid: {
        display: 'grid',
        gap: spacing.lg,
    },
    flex: {
        display: 'flex',
        gap: spacing.md,
    },
    flexCenter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    breakpoints: {
        xs: '@media (max-width: 480px)',
        sm: '@media (max-width: 640px)',
        md: '@media (max-width: 768px)',
        lg: '@media (max-width: 1024px)',
        xl: '@media (max-width: 1280px)',
    },
};

// Animation Keyframes (to be used in CSS)
export const animations = {
    fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
    slideUp: `
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `,
    scaleIn: `
    @keyframes scaleIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `,
    pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
    gradientShift: `
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `,
    scanLine: `
    @keyframes scanLine {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }
  `,
    blob: `
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
  `,
};

export default {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    transitions,
    glass,
    buttons,
    inputs,
    cards,
    layout,
    animations,
};
