import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		gridTemplateColumns: {
  			'15': 'repeat(15, minmax(0, 1fr))'
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: '#DDE6F2',
  			ring: '#D33632',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		keyframes: {
  			neonShine: {
  				'0%': {
  					opacity: '0.3'
  				},
  				'50%': {
  					opacity: '0.5'
  				},
  				'100%': {
  					opacity: '0.3'
  				}
  			},
  			'fade-in-top': {
  				'0%': {
  					transform: 'translateY(-50px)',
  					opacity: '0'
  				},
  				'60%': {
  					transform: 'translateY(-50px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			'fade-out-top': {
  				'0%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'translateY(-50px)',
  					opacity: '0'
  				}
  			},
			'fade-in-bottom': {
				'0%': {
					transform: 'translateY(50px)',
					opacity: '0'
				},
				'60%': {
					transform: 'translateY(50px)',
					opacity: '0'
				},
				'100%': {
					transform: 'translateY(0)',
					opacity: '1'
				}
			},
			'fade-out-bottom': {
				'0%': {
					transform: 'translateY(0)',
					opacity: '1'
				},
				'100%': {
					transform: 'translateY(50px)',
					opacity: '0'
				}
			},
  			'fade-in-right': {
  				'0%': {
  					transform: 'translateX(100%)',
  					opacity: '0'
  				},
  				'60%': {
  					transform: 'translateX(100%)',
  					opacity: '0.3'
  				},
  				'100%': {
  					transform: 'translateX(0)',
  					opacity: '1'
  				}
  			},
  			'fade-out-right': {
  				'0%': {
  					transform: 'translateX(0)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'translateX(50px)',
  					opacity: '0'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
			'fade-in': {
				'0%': {
					opacity: '0'
				},
				'100%': {
					opacity: '1'
				}
			},
  		},
  		animation: {
			'fade-in': 'fade-in 0.3s cubic-bezier(0.390, 0.575, 0.565, 1.000) both',
  			'fade-in-top': 'fade-in-top 0.3s cubic-bezier(0.390, 0.575, 0.565, 1.000) both',
  			'fade-out-top': 'fade-out-top 0.3s cubic-bezier(0.390, 0.575, 0.565, 1.000) both',
			'fade-in-bottom': 'fade-in-bottom 0.5s cubic-bezier(0.390, 0.575, 0.565, 1.000) both',
			'fade-out-bottom': 'fade-out-bottom 0.3s cubic-bezier(0.390, 0.575, 0.565, 1.000) both',
  			'fade-in-right': 'fade-in-right 0.5s cubic-bezier(0.390, 0.575, 0.565, 1.000) both',
  			'fade-out-right': 'fade-out-right 0.3s cubic-bezier(0.390, 0.575, 0.565, 1.000) both',
  			neonShine: 'neonShine 1.5s ease-in-out infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [
	require("tailwindcss-animate"),
	require('tailwind-scrollbar'),
    require('tailwind-scrollbar-hide'),
	require('tailwindcss-motion'),
],
};
export default config;
