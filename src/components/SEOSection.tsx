import React, { useEffect } from 'react';

export default function SEOSection() {
  useEffect(() => {
    // 1. Set document Title
    const originalTitle = document.title;
    document.title = 'Advanced Mortgage Calculator | Professional Amortization Schedule & Prepayment Planner';

    // 2. Identify or create head meta element helper
    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 3. Define core metadata content
    const description = 'Calculate accurate mortgage amortization schedules with support for extra payments, biweekly schedules, PMI drop calculations, HOA fees, property taxes, and escalation rates. Export full results in PDF and CSV format.';
    const canonicalUrl = window.location.origin + window.location.pathname;
    const imageUrl = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=600&auto=format&fit=crop';

    // 4. Set standard meta tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', 'mortgage calculator, amortization schedule, extra payments, biweekly mortgage, PMI calculator, escrow escalation, home loan budget');

    // 5. Open Graph / Facebook Cards
    setMetaTag('property', 'og:title', 'Advanced Mortgage Calculator | Amortization Schedule');
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', imageUrl);

    // 6. Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', 'Advanced Mortgage Calculator | Amortization Schedule');
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', imageUrl);

    // 7. Canonical URL link tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 8. Inject structured JSON-LD schemas
    const softwareSchema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'Advanced Mortgage Calculator',
      'operatingSystem': 'All',
      'applicationCategory': 'FinanceApplication',
      'browserRequirements': 'Requires JavaScript. Requires HTML5.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      }
    };

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'What is an amortization schedule?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'An amortization schedule is a complete table of periodic loan payments, showing the split of interest charges and principal paydown. Early payments contain more interest, while later ones are dominated by principal.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How do extra payments affect my mortgage?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Extra principal payments immediately reduce the outstanding balance of your home loan. Since future interest is calculated on this lower balance, you shorten your overall payoff term and save significantly on cumulative interest.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What is the 80% LTV rule for Private Mortgage Insurance (PMI)?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'PMI is usually required if your down payment is under 20% (LTV above 80%). Federal regulations mandate that lenders must cancel PMI once your outstanding loan balance declines to 80% of the home\'s original purchase price.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How do biweekly payments accelerate payoff?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Paying half of your standard monthly payment every two weeks results in 26 half-payments a year. This is equivalent to 13 full payments—essentially executing one extra standard payment every year, accelerating principal reduction.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What are escalated escrow costs?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Escrow costs include property taxes and home insurance, which frequently rise over time due to inflation or assessed home values. Simulating escalation rates forecasts realistic long-term cash requirements.'
          }
        }
      ]
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': canonicalUrl
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Calculators',
          'item': canonicalUrl
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': 'Mortgage Calculator',
          'item': canonicalUrl
        }
      ]
    };

    // Combine schemas in an array and stringify
    const schemas = [softwareSchema, faqSchema, breadcrumbSchema];
    let scriptTag = document.getElementById('mortgage-calculator-jsonld') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'mortgage-calculator-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemas);

    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
      const script = document.getElementById('mortgage-calculator-jsonld');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return null; // This component operates invisibly in document.head
}
