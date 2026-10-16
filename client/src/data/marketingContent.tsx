import { UploadIcon, VideoIcon, ZapIcon } from 'lucide-react';

export const featuresData = [
    {
        icon: <UploadIcon className="w-6 h-6" />,
        title: 'Smart Upload',
        desc: 'Choose product and model reference images for a generation project.'
    },
    {
        icon: <ZapIcon className="w-6 h-6" />,
        title: 'Image Generation',
        desc: 'Submit references and a brief to the configured image provider. Availability depends on provider access and quota.'
    },
    {
        icon: <VideoIcon className="w-6 h-6" />,
        title: 'Video Synthesis',
        desc: 'Bring product shots to life with short-form, social-ready videos.'
    }
];

export const plansData = [
    {
        id: 'starter',
        name: 'Starter',
        price: '$10',
        desc: 'Try the platform at no cost.',
        credits: 25,
        features: [
            '25 Credits',
            'Standard quality',
            'No watermark',
            'Slower generation speed',
            'Email support'
        ]
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$29',
        desc: 'Creators & small teams.',
        credits: 80,
        features: [
            '80 Credits', 
            'HD quality', 
            'No watermark', 
            'Video generation', 
            'Priority support'
        ],
        popular: true
    },
    {
        id: 'ultra',
        name: 'Ultra',
        price: '$99',
        desc: 'Scale across teams and agencies.',
        credits: 300,
        features: [
            '300 Credits', 
            'FHD quality', 
            'No watermark', 
            'Fast generation speed', 
            'Chat + Email support'
        ]
    }
];

export const faqData = [
    {
        question: 'How does the AI generation work?',
        answer: 'The authenticated generator sends product and model references, an aspect ratio and a brief to the configured Google AI service. Generation depends on provider access, billing and quota. The public sample workspace makes no provider requests.'
    },
    {
        question: 'Do I own the generated images?',
        answer: 'Check the current terms of the configured provider and your rights to each reference image before using an output. Gallery samples illustrate the workflow and do not grant a separate commercial license.'
    },
    {
        question: 'Can I explore without an account?',
        answer: 'Yes. Open the public sample workspace to explore reference setup, a saved example and a simulated provider error. Live creation and account features require sign-in and configured services.'
    },
    {
        question: 'What input formats do you support?',
        answer: 'We accept JPG, PNG and WEBP. Outputs are high-resolution PNGs and MP4s optimized for social platforms.'
    }
];

export const footerLinks = [
    {
        title: "Quick Links",
        links: [
            { name: "Home", url: "/" },
            { name: "Sample workspace", url: "/demo" },
            { name: "Features", url: "/#features" },
            { name: "FAQ", url: "/#faq" }
        ]
    },
    {
        title: "Project context",
        links: [
            { name: "Sample data & limitations", url: "/demo#project-context" },
            { name: "Setup & service requirements", url: "https://github.com/harshgavandit/ugc-project#setup" }
        ]
    },
    {
        title: "Source",
        links: [
            { name: "GitHub repository", url: "https://github.com/harshgavandit/ugc-project" },
            { name: "Developer profile", url: "https://github.com/harshgavandit" }
        ]
    }
];
