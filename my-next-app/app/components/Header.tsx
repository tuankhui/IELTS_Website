'use client'

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

type NavLinkProps = {
    href: string;
    text: string;
};


const NavLink: React.FC<NavLinkProps> = ({ href, text }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    const activeClasses = "bg-blue-500 text-white"; // Example active classes
    const inactiveClasses = "hover:bg-blue-200 hover:text-white-900"; // Example inactive classes

    return (
        <Link href={href} passHref>
            <button className={`block w-full text-left px-4 py-2 rounded transition-colors ${isActive ? activeClasses : inactiveClasses}`}>
                {text}
            </button>
        </Link>
    );
};


const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [role, setRole] = useState<string | null>(null);


    useEffect(() => {
        // Check for logged-in user
        const storedUser = localStorage.getItem('username');
        if (storedUser) {
            setUsername(storedUser);
        }
        const token = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');
        if (token) {
            setIsLoggedIn(true);
            setRole(storedRole);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUsername(null);
        if (typeof window !== 'undefined'){
            window.location.href = '/login';
        }
        // Optionally, redirect to home page or login page
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <header className="sticky top-0 bg-white dark:bg-gray-400 bg-opacity-1000 backdrop-blur-sm text-black shadow-sm z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-5">
                    {/* Logo and left-side links */}
                    <div className="flex items-center space-x-8">
                        <Link href="/">
                            <button className="text-2xl font-bold text-blue-900 hover:text-white-500 transition-colors">
                                IELTS
                            </button>
                        </Link>
                        <button className="text-3xl md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            &#9776;
                        </button>
                        <nav className={`md:flex md:space-x-4 ${isMenuOpen ? 'block' : 'hidden md:block'}`}>
                            {/* <NavLink href="/history" text="History" /> */}
                            {/* {role != 'Teacher' && <NavLink href="/task1" text="Task 1" />}
                            {role != 'Teacher' && <NavLink href="/task2" text="Task 2" />} */}
                            {role != 'Teacher' && 
                            <div className="relative">
                                <button 
                                    onClick={toggleDropdown} 
                                    className="px-4 py-2 rounded transition-colors hover:bg-blue-200 hover:text-white-900">
                                    Practice &#9662;
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute left-0 mt-2 w-36 bg-white border rounded shadow-lg">
                                        <NavLink href="/reading" text="Reading" />
                                        <NavLink href="/listening" text="Listening" />
                                        <NavLink href="/speaking" text="Speaking" />
                                        <NavLink href="/writing" text="Writing" />
                                        {/* <NavLink href="/task2" text="Writing Task 2" /> */}
                                        <NavLink href="/grammar" text="Grammar" />
                                        <NavLink href="/vocab" text="Vocab" />
                                        <NavLink href="/stress" text="Stress" />
                                    </div>
                                )}
                            </div>}

                            {role != 'Teacher' && <NavLink href="/contest" text="Contest" />}
                            {role != 'Teacher' && <NavLink href="/ranking" text="Ranking" />}
                            {role != 'Teacher' && <NavLink href="/reading/translate" text="Translate" />}
                            {isLoggedIn && (role === 'Teacher' || role === 'Admin') && <NavLink href="/management" text="Management" />}
                            {isLoggedIn && role === 'Admin'&& <NavLink href="/testing" text="Testing" /> }
                        </nav>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        {username ? (
                            <>
                                <Link href="/user">
                                    <button className="px-6 py-2 bg-gray-200 text-black rounded shadow hover:bg-gray-300 transition-colors">
                                        {username}
                                    </button>
                                </Link>
                                <button 
                                    onClick={handleLogout} 
                                    className="px-6 py-2 bg-black text-white rounded shadow hover:bg-gray-700 transition-colors">
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <button className="px-6 py-2 bg-white text-black rounded shadow hover:bg-gray-200 transition-colors">
                                        Log In
                                    </button>
                                </Link>
                                <Link href="/sign-up">
                                    <button className="px-6 py-2 bg-black text-white rounded shadow hover:bg-gray-700 transition-colors">
                                        Sign Up
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;