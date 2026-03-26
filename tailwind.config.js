/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './src/**/*.{js,ts}',
    './public/js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        // Primary
        'primary':                    '#3e6a7e',
        'primary-dim':                '#315e72',
        'primary-container':          '#b9e6fe',
        'primary-fixed':              '#b9e6fe',
        'primary-fixed-dim':          '#abd8ef',
        'on-primary':                 '#ffffff',
        'on-primary-container':       '#275569',
        'on-primary-fixed':           '#104356',
        'on-primary-fixed-variant':   '#325f73',
        'inverse-primary':            '#b9e6fe',
        // Secondary
        'secondary':                  '#4f6875',
        'secondary-dim':              '#435c69',
        'secondary-container':        '#cce6f6',
        'secondary-fixed':            '#cce6f6',
        'secondary-fixed-dim':        '#bed8e8',
        'on-secondary':               '#ffffff',
        'on-secondary-container':     '#3c5562',
        'on-secondary-fixed':         '#29434f',
        'on-secondary-fixed-variant': '#465f6c',
        // Tertiary (warm accent)
        'tertiary':                   '#6d6353',
        'tertiary-dim':               '#605748',
        'tertiary-container':         '#f4e6d2',
        'tertiary-fixed':             '#f4e6d2',
        'tertiary-fixed-dim':         '#e6d8c5',
        'on-tertiary':                '#ffffff',
        'on-tertiary-container':      '#5d5445',
        'on-tertiary-fixed':          '#4a4233',
        'on-tertiary-fixed-variant':  '#675e4e',
        // Surface hierarchy (light → warm/deep)
        'surface-container-lowest':   '#ffffff',
        'surface':                    '#fffbff',
        'surface-bright':             '#fffbff',
        'background':                 '#fffbff',
        'surface-container-low':      '#fdf9f1',
        'surface-container':          '#f7f3eb',
        'surface-container-high':     '#f1eee5',
        'surface-container-highest':  '#ece8de',
        'surface-variant':            '#ece8de',
        'surface-tint':               '#3e6a7e',
        // Text & content
        'on-surface':                 '#393831',
        'on-background':              '#393831',
        'on-surface-variant':         '#66645d',
        'inverse-surface':            '#0f0e0b',
        'inverse-on-surface':         '#9f9d97',
        // Outline
        'outline':                    '#838178',
        'outline-variant':            '#bcb9b0',
        // Error
        'error':                      '#af3d3b',
        'error-dim':                  '#67040d',
        'error-container':            '#fa746f',
        'on-error':                   '#ffffff',
        'on-error-container':         '#6e0a12',
      },
      fontFamily: {
        'headline': ['"Noto Serif"', 'Georgia', 'serif'],
        'label':    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
