'use client';

import { useEffect, useState } from 'react';

// Replace with your real WhatsApp number (E.164 without "+")
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348038011663';

const DEFAULT_MESSAGE =
  "Hi Skunect team, I run a school in Lagos and I'd like to learn more about joining the beta pilot.";

interface WhatsAppFloatProps {
  message?: string;
}

export function WhatsAppFloat({ message = DEFAULT_MESSAGE }: WhatsAppFloatProps) {
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto-expand the tooltip once after 4s on first visit to draw attention,
    // then collapse after another 5s so it isn't obtrusive.
    const t1 = setTimeout(() => setExpanded(true), 4000);
    const t2 = setTimeout(() => setExpanded(false), 9000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!mounted) return null;

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3 sm:bottom-7 sm:right-7">
      <div
        className={`hidden items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-navy shadow-lg ring-1 ring-black/5 transition-all duration-500 sm:flex ${
          expanded
            ? 'translate-x-0 opacity-100'
            : 'pointer-events-none translate-x-3 opacity-0'
        }`}
        aria-hidden
      >
        <span>Chat with the founder</span>
        <span className="text-lg leading-none">→</span>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-xl ring-4 ring-[#25D366]/20 transition-transform duration-300 hover:scale-110 hover:ring-[#25D366]/30 sm:h-16 sm:w-16"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20" />
        <svg
          viewBox="0 0 32 32"
          className="relative h-7 w-7 fill-white sm:h-8 sm:w-8"
          aria-hidden
        >
          <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39-.065 0-.138-.023-.197-.051-.44-.215-1.282-.574-2.335-1.492-.85-.766-1.4-1.685-1.56-1.996-.052-.097-.063-.193-.063-.25 0-.154.244-.387.316-.458.265-.267.54-.537.673-.835.07-.158.13-.31.13-.474 0-.122-.04-.198-.088-.306-.05-.116-.232-.573-.32-.801-.08-.202-.16-.414-.224-.585-.09-.24-.156-.424-.27-.572-.076-.097-.16-.15-.29-.15-.09 0-.182.017-.272.017-.15 0-.31.05-.464.05-.136 0-.298-.017-.444-.017-.137 0-.333.042-.466.042-.175 0-.34-.057-.488-.057-.19 0-.402.089-.54.227-.2.2-.7.7-.7 1.708 0 1.006.723 1.982.82 2.12.078.11 1.394 2.244 3.486 3.132 2.09.885 2.09.59 2.47.558.376-.03 1.218-.497 1.39-.975.176-.48.176-.888.123-.975-.05-.09-.185-.14-.37-.23zm-3.19 8.72h-.004c-1.74 0-3.447-.468-4.937-1.354l-.354-.21-3.672.964.98-3.578-.23-.364a9.25 9.25 0 01-1.416-4.907c0-5.116 4.164-9.28 9.285-9.28a9.222 9.222 0 016.568 2.723 9.215 9.215 0 012.72 6.563c-.002 5.117-4.166 9.443-9.274 9.443zm7.896-17.342A11.03 11.03 0 0015.916 5.4c-6.123 0-11.104 4.981-11.107 11.103a11.08 11.08 0 001.485 5.548L4.7 27.6l5.677-1.489a11.091 11.091 0 005.312 1.353h.005c6.122 0 11.103-4.982 11.105-11.105a11.03 11.03 0 00-3.283-7.776z" />
        </svg>
      </a>
    </div>
  );
}
