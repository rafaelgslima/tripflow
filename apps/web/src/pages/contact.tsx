import { useEffect, useState } from 'react';
import Head from 'next/head';
import { HeaderPreLogin } from '@/components/Header/HeaderPreLogin';
import { HeaderPostLogin } from '@/components/Header/HeaderPostLogin';
import { ContactForm } from '@/components/Form/ContactForm';
import { supabase } from '@/lib/supabase';

export default function ContactPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setIsLoggedIn(!!session?.access_token);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const Header = isLoggedIn ? HeaderPostLogin : HeaderPreLogin;

  return (
    <>
      <Head>
        <title>Get in Touch | TripFlow</title>
        <meta
          name="description"
          content="Share feedback, report issues, or suggest features for TripFlow"
        />
      </Head>

      <Header />

      <main className="min-h-[calc(100vh-62px)] bg-tf-bg flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[500px]">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <h1 className="font-lora text-[30px] font-light tracking-tight text-tf-text mb-3">
              Get in Touch
            </h1>
            <p className="font-outfit text-sm md:text-base text-tf-muted leading-relaxed">
              Have an issue? A brilliant feature idea? A complaint? We&apos;d love to hear from you.
              Send us a message and we&apos;ll get back to you as soon as possible.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-tf-card border border-tf-border rounded-lg p-6 md:p-8 shadow-lg">
            <ContactForm />
          </div>

          {/* Footer Hint */}
          <p className="text-center text-xs text-tf-muted mt-6">
            All messages are reviewed by our team. Expect a response within 24-48 hours.
          </p>
        </div>
      </main>
    </>
  );
}
