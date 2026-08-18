"use client";import{useEffect}from"react";import{trackEvent}from"../lib/analytics";export function GalleryTracker(){useEffect(()=>{trackEvent("gallery_viewed")},[]);return null}
