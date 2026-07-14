
export const darkMode = 'class';
export const content = ['./src/**/*.{js,jsx,ts,tsx}'];
export const theme = {
    extend: {
  animation: {
    'spin-slow': 'spin 14s linear infinite',
  },
   screens: {
        'custom-lg': '991px', 
        'custom-md' : '891px',
      },
},
};
export const plugins = [];
