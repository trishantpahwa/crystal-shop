import type { SVGProps } from "react";

export function SparkleIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
            <path
                d="M12 2l1.2 5.1L18 9l-4.8 1.9L12 16l-1.2-5.1L6 9l4.8-1.9L12 2Z"
                className="fill-current"
                opacity="0.9"
            />
            <path
                d="M19.5 13.5l.6 2.6 2.4.9-2.4.9-.6 2.6-.6-2.6-2.4-.9 2.4-.9.6-2.6Z"
                className="fill-current"
                opacity="0.7"
            />
            <path
                d="M4.5 13.5l.6 2.6 2.4.9-2.4.9-.6 2.6-.6-2.6-2.4-.9 2.4-.9.6-2.6Z"
                className="fill-current"
                opacity="0.7"
            />
        </svg>
    );
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
            <path
                d="M13.5 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M4.5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
            <path
                d="M12 3l2.7 5.7 6.3.9-4.5 4.4 1.1 6.2L12 17.9 6.4 20.2 7.5 14 3 9.6l6.3-.9L12 3Z"
                className="fill-current"
            />
        </svg>
    );
}
