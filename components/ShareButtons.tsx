import { FacebookIcon, TwitterIcon, WhatsAppIcon, InstagramIcon, PinterestIcon } from "@/components/Icons";
import toast from "react-hot-toast";

interface ShareButtonsProps {
    url: string;
    title: string;
    description?: string;
    image?: string;
}

export function ShareButtons({ url, title, description, image }: ShareButtonsProps) {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description || title);

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        instagram: `https://www.instagram.com/`, // Instagram doesn't have direct sharing, just link to profile
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDescription}${image ? `&media=${encodeURIComponent(image)}` : ''}`,
    };

    const handleShare = (platform: keyof typeof shareLinks) => {
        if (platform === 'instagram') {
            // For Instagram, copy to clipboard and show a toast
            navigator.clipboard.writeText(`${title} ${url}`).then(() => {
                toast.success('Link copied to clipboard! Share it on Instagram.');
            });
            window.open(shareLinks.instagram, '_blank');
        } else {
            window.open(shareLinks[platform], '_blank', 'width=600,height=400');
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted mr-2">Share:</span>
            <button
                onClick={() => handleShare('facebook')}
                className="p-2 rounded-full bg-secondary-bg hover:bg-border transition-colors"
                title="Share on Facebook"
            >
                <FacebookIcon className="h-4 w-4 text-primary-text" />
            </button>
            <button
                onClick={() => handleShare('twitter')}
                className="p-2 rounded-full bg-secondary-bg hover:bg-border transition-colors"
                title="Share on Twitter"
            >
                <TwitterIcon className="h-4 w-4 text-primary-text" />
            </button>
            <button
                onClick={() => handleShare('whatsapp')}
                className="p-2 rounded-full bg-secondary-bg hover:bg-border transition-colors sm:hidden"
                title="Share on WhatsApp"
            >
                <WhatsAppIcon className="h-4 w-4 text-primary-text" />
            </button>
            <button
                onClick={() => handleShare('instagram')}
                className="p-2 rounded-full bg-secondary-bg hover:bg-border transition-colors hidden sm:inline-flex"
                title="Share on Instagram"
            >
                <InstagramIcon className="h-4 w-4 text-primary-text" />
            </button>
            <button
                onClick={() => handleShare('pinterest')}
                className="p-2 rounded-full bg-secondary-bg hover:bg-border transition-colors hidden sm:inline-flex"
                title="Pin on Pinterest"
            >
                <PinterestIcon className="h-4 w-4 text-primary-text" />
            </button>
        </div>
    );
}