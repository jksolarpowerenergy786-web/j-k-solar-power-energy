import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { navy: '#06275D', royal: '#0878C9', sun: '#FFB800', leaf: '#43A51E', mist: '#F5F9FC' },
    fontFamily: { sans: ['Poppins', 'Noto Sans Gujarati', 'system-ui', 'sans-serif'] },
  } },
  plugins: [],
};
export default config;
