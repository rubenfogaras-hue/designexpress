import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

/**
 * Meta Pixel — base code only.
 *
 * It fires PageView and nothing else. Every other event (Lead, Purchase…) is
 * defined by Ruben in Meta's Event Setup Tool, which needs this base code
 * present on the page in order to run at all. Do not add fbq('track', ...)
 * calls here: they would double-count against the events configured there.
 */
const META_PIXEL_ID = "1869559314737199";

// Display / headings — serif, light weights, italic emphasis on a key word.
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

// Body / UI — clean, neutral sans.
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Design Express · Horizont Visuals",
  description:
    "Trimite pozele celor patru camere și îți transform interiorul în stil clasic-contemporan — ți-l prezint live, într-o discuție 1-la-1. 297 lei.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className={`${cormorant.variable} ${inter.variable}`}>
      {/* Rendered before <body>, so the HTML parser places it in <head> —
          which is literally what Meta's install instructions ask for, and
          where their verification check looks. next/script would not do
          this: even at beforeInteractive it emits the tag into the body,
          which made Meta report the pixel as not installed. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`,
        }}
      />
      {/* Signals Gateway — serves the tracking SDK from a first-party domain
          so ad blockers do not strip it.

          NOTE: the host below does not currently resolve, so this script
          fails to load and sends nothing. It becomes live once the gateway is
          deployed on a subdomain that is actually owned and pointed at it
          (e.g. sgw.rubenhorizontvisual.com); at that point replace the two
          URLs here with the ones Meta issues. The standard pixel above is
          unaffected either way. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `!function(a,h,e,v,n,t,s)
  {if(a.cbq)return;n=a.cbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!a._cbq)a._cbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=h.createElement(e);t.async=!0;
  t.src=v;s=h.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://Rubenhorizontvisual.gmail.com/sdk/1999592750190783254/events.js');

cbq('setHost', 'https://Rubenhorizontvisual.gmail.com/');
cbq('init', '1999592750190783254');
cbq('track', 'PageView');`,
        }}
      />
      <body className="font-sans">
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
