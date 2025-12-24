import type { SVGProps } from "react";

export function GemIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
            <path
                d="M7 3h10l4 6-9 12L3 9l4-6Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="M3 9h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M7 3l5 18 5-18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                opacity="0.7"
            />
        </svg>
    );
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
            <path
                d="M12 2l8 4v7c0 5-3.5 9-8 9s-8-4-8-9V6l8-4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="M9 12l2 2 4-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function TruckIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
            <path
                d="M3 7h11v10H3V7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="M14 10h4l3 3v4h-7V10Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="M7 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM18 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
                fill="currentColor"
                opacity="0.25"
            />
        </svg>
    );
}

export function LeafIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
            <path
                d="M20 4c-7.5 1-12.5 5-14 12 3-2.5 7-3.5 12-3-1 4.5-4.5 7.5-10 8 8 1 14-6 12-17Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
        </svg>
    );
}
