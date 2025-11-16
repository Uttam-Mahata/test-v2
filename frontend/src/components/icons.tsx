
import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M8.25 12.75a.75.75 0 010-1.5h7.5a.75.75 0 010 1.5h-7.5z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M5.25 6a.75.75 0 01.75-.75h12a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zM8.25 18a.75.75 0 010-1.5h7.5a.75.75 0 010 1.5h-7.5z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h15a3 3 0 013 3v15a3 3 0 01-3 3h-15a3 3 0 01-3-3v-15zM4.5 3a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5h15a1.5 1.5 0 001.5-1.5v-15a1.5 1.5 0 00-1.5-1.5h-15z" clipRule="evenodd" />
  </svg>
);

export const MicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.75 6.75 0 11-13.5 0v-1.5A.75.75 0 016 10.5z" />
  </svg>
);

export const PowerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h9a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5h-9zm-1.5 1.5a3 3 0 013-3h9a3 3 0 013 3v13.5a3 3 0 01-3 3h-9a3 3 0 01-3-3V5.25z" clipRule="evenodd" />
    <path d="M12 9a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 0112 9z" />
  </svg>
);

export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

export const BackspaceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
  </svg>
);

export const ArrowUpCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const ArrowDownCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const BanknotesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0v.75A.75.75 0 014.5 8.25h-.75m0 0h-.75A.75.75 0 012.25 7.5v-.75M3 3.75c.621 0 1.125.504 1.125 1.125V4.5A.75.75 0 013.75 5.25h-.75A.75.75 0 013 4.5v-.75C3 3.204 3.204 3 3.75 3h.75c.621 0 1.125.504 1.125 1.125V4.5A.75.75 0 014.5 5.25h.75A.75.75 0 016 4.5v-.75c0-.621.504-1.125 1.125-1.125h.75c.621 0 1.125.504 1.125 1.125V4.5A.75.75 0 018.25 5.25h.75A.75.75 0 019.75 4.5v-.75c0-1.036.84-1.875 1.875-1.875h.75c.621 0 1.125.504 1.125 1.125V4.5A.75.75 0 0113.5 5.25h.75A.75.75 0 0115 4.5v-.75c0-.621.504-1.125 1.125-1.125h.75c.621 0 1.125.504 1.125 1.125V4.5a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75c0-1.036.84-1.875 1.875-1.875h.75c.621 0 1.125.504 1.125 1.125V4.5a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v.75c0 .414-.336.75-.75.75h-3.375a.75.75 0 01-.75-.75V4.5c0-.621-.504-1.125-1.125-1.125h-.75c-1.036 0-1.875.84-1.875 1.875v.75c0 .414-.336.75-.75.75h-.75a.75.75 0 01-.75-.75V4.5c0-.621-.504-1.125-1.125-1.125h-.75c-1.036 0-1.875.84-1.875 1.875v.75c0 .414-.336.75-.75.75h-3.375a.75.75 0 01-.75-.75V4.5c0-.621-.504-1.125-1.125-1.125h-.75A1.875 1.875 0 003.75 4.5v.75c0 .414-.336.75-.75.75H3a.75.75 0 01-.75-.75V4.5c0-.621.504-1.125 1.125-1.125h.75" />
    </svg>
);

export const CreditCardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
);

export const ReceiptPercentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12h1.5a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-1.5 1.5H7.5m3-6h1.5a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-1.5 1.5h-1.5m-6 0a1.5 1.5 0 00-1.5 1.5v1.5a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 001.5-1.5v-1.5a1.5 1.5 0 00-1.5-1.5h-1.5m-3-3a1.5 1.5 0 00-1.5 1.5v1.5a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 001.5-1.5v-1.5a1.5 1.5 0 00-1.5-1.5h-1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 001.5-1.5v-1.5a1.5 1.5 0 00-1.5-1.5h-1.5a1.5 1.5 0 00-1.5 1.5v1.5zm1.5-1.5v.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13.5a1.5 1.5 0 001.5 1.5h1.5a1.5 1.5 0 001.5-1.5v-1.5a1.5 1.5 0 00-1.5-1.5h-1.5a1.5 1.5 0 00-1.5 1.5v1.5zm1.5-1.5v.75" />
    </svg>
);
