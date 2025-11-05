"use client";
// Page.tsx
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
    } else {
        router.push('/login');
    }
}, [router]);

  const DynamicPage = dynamic(() => import('./record'), { ssr: false });
  return (
    <>
    <DynamicPage />
    </>
  );
}