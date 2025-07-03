// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import catppuccin from '@catppuccin/starlight'

import tailwindcss from '@tailwindcss/vite'

import react from '@astrojs/react'

// https://astro.build/config
export default defineConfig({
    integrations: [
        starlight({
            title: 'Fun Gauge',
            favicon: 'favicon.png',
            social: [
                { icon: 'github', label: 'GitHub', href: 'https://github.com/alejandroMA/fun-gauge' },
                { icon: 'heart', label: 'Alex', href: 'https://alex-ma.dev' }
            ],
            sidebar: [
                {
                    label: 'React',
                    items: [
                        // Each item here is one entry in the navigation menu.
                        { label: 'Getting Started', slug: 'react/getting-started' },
                        { label: 'Examples', slug: 'react/examples' },
                        { label: 'Props', slug: 'react/props' },
                    ]
                }
            ],
            components: {
                Hero: './src/components/Hero.astro'
            },
            customCss: [
                // Tailwind base styles:
                './src/styles/global.css'
            ],
            plugins: [
                catppuccin({
                    dark: { flavor: 'macchiato', accent: 'yellow' },
                    light: { flavor: 'latte', accent: 'mauve' }
                })
            ]
        }),
        react()
    ],

    vite: {
        plugins: [tailwindcss()]
    }
})
