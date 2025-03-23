"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabaseClient = createClientComponentClient();
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.user?.user_metadata?.client_id) {
          setClientId(session.user.user_metadata.client_id);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    getUser();
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/" },
  ];

  const handleLogout = async () => {
    try {
      await supabaseClient.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white border-b px-10 py-3 flex items-center justify-between">
      <h1 className="text-[25px] font-bold text-gray-900">MedGem</h1>

      <nav className="flex items-center gap-8 text-[18px] font-semibold">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
          key={item.href}
          href={item.href}
          className={`relative pb-1 transition-all duration-200 group ${
            isActive ? "text-sky-600 font-bold" : "text-gray-700"
          } hover:text-sky-600`}
        >
          {item.name}
          <span
            className={`absolute left-0 -bottom-[2px] h-[2px] w-full transition-all duration-300 ${
              isActive
                ? "bg-sky-600 scale-x-100"
                : "bg-sky-600 scale-x-0 group-hover:scale-x-100"
            } origin-left`}
          />
        </Link>

          );
        })}

        {clientId && (
          <div className="text-gray-700 font-mono">
            Client ID: {clientId}
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="relative pb-1 text-red-600 hover:text-red-700 transition-all duration-200 group"
        >
          Logout
          <span className="absolute left-0 -bottom-[2px] h-[2px] w-full bg-red-600 scale-x-0 group-hover:scale-x-100 transition-all duration-300 origin-left" />
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
