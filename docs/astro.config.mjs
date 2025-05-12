// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

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
                    label: 'Guides',
                    items: [
                        // Each item here is one entry in the navigation menu.
                        { label: 'Example Guide', slug: 'guides/example' }
                    ]
                },
                {
                    label: 'Reference',
                    autogenerate: { directory: 'reference' }
                }
            ],
            components: {
                Hero: "./src/components/Hero.astro",
            }
        })
    ]
})
