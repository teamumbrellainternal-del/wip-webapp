/** @type {import('@ladle/react').UserConfig} */
export default {
  stories: 'src/**/*.stories.{tsx,jsx}',
  outDir: 'dist-storybook',
  base: '/app.leger.run/',

  // Default to dark theme (Catppuccin Mocha)
  defaultStory: '',
  theme: 'dark',

  // Enable useful addons
  addons: {
    width: {
      enabled: true,
      options: {
        xsmall: 320,
        small: 640,
        medium: 768,
        large: 1024,
        xlarge: 1280,
      },
      defaultState: 0, // Full width by default
    },
    theme: {
      enabled: true,
      defaultState: 'dark', // Default to dark theme
    },
    control: {
      enabled: false, // Disable controls for simpler stories
    },
    action: {
      enabled: false,
    },
    source: {
      enabled: true, // Enable source code viewing
    },
    msw: {
      enabled: false,
    },
    a11y: {
      enabled: false,
    },
    rtl: {
      enabled: false,
    },
    ladle: {
      enabled: true,
    },
    mode: {
      enabled: false,
    },
  },

  // Vite config is loaded from .ladle/vite.config.ts
  viteConfig: './.ladle/vite.config.ts',

  // Custom story sorting
  storyOrder: (stories) => {
    const order = [
      'Components',
      'Form Fields',
      'Form Layouts',
      'Form Feedback',
      'Navigation',
      'Data Display',
      'Feedback',
      'Utility',
    ];

    return stories.sort((a, b) => {
      const aCategory = a.split('/')[0];
      const bCategory = b.split('/')[0];

      const aIndex = order.indexOf(aCategory);
      const bIndex = order.indexOf(bCategory);

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }

      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      return a.localeCompare(b);
    });
  },
}
