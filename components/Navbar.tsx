"use client"

import { useState, useEffect } from "react"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleMobileNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false)
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 120
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  const handleWalletConnect = () => {
    window.location.href = "mailto:contact@example.com"
  }

  return (
    <>
      {/* Desktop Header */}
      <header
        className={`fixed top-4 z-[9999] mx-auto hidden w-full flex-row items-center justify-between self-start rounded-full backdrop-blur-md md:flex border transition-all duration-300 ${
          isScrolled ? "max-w-4xl px-2 border-white/20 shadow-lg" : "max-w-6xl px-4 border-transparent shadow-none"
        } py-2`}
        style={{
          willChange: "transform",
          backfaceVisibility: "hidden",
          perspective: "1000px",
          background: isScrolled ? "rgba(15, 15, 15, 0.8)" : "transparent",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <a
          className={`z-50 flex items-center justify-center gap-2 transition-all duration-300 ${
            isScrolled ? "ml-4" : ""
          }`}
          href="https://v0.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="size-12 rounded-full"
          />
        </a>

        <div className="absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-white/70 transition duration-200 hover:text-white md:flex md:space-x-2">
          <a className="relative px-4 py-2 text-white/70 hover:text-white transition-colors cursor-pointer" href="/">
            <span className="relative z-20">Beranda</span>
          </a>
          <a className="relative px-4 py-2 text-white/70 hover:text-white transition-colors cursor-pointer" href="/">
            <span className="relative z-20">Property</span>
          </a>
          <a className="relative px-4 py-2 text-white/70 hover:text-white transition-colors cursor-pointer" href="/">
            <span className="relative z-20">About Us</span>
          </a>
          <a className="relative px-4 py-2 text-white/70 hover:text-white transition-colors cursor-pointer" href="/">
            <span className="relative z-20">Promo</span>
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleWalletConnect}
            className="rounded-lg font-medium relative cursor-pointer hover:-translate-y-0.5 transition-all duration-200 inline-block text-center px-4 py-2 text-sm border bg-gradient-to-r from-red-900 to-red-600 border-red-400/30 text-white hover:from-red-800 hover:to-red-500"
          >
            Hubungi Kami
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header
        className={`fixed top-4 z-[9999] mx-4 flex w-auto flex-row items-center justify-between rounded-full backdrop-blur-md md:hidden px-4 py-3 border transition-all duration-300 ${
          isScrolled ? "border-white/20 shadow-lg" : "border-transparent shadow-none"
        }`}
        style={{
          background: isScrolled ? "rgba(15, 15, 15, 0.8)" : "transparent",
          left: "1rem",
          right: "1rem",
          width: "calc(100% - 2rem)",
        }}
      >
        <a className="flex items-center justify-center gap-2" href="/">
          <img
            src="/logo.png"
            alt="Logo"
            className="size-10 rounded-full"
          />
          <span className="text-white font-semibold">v0</span>
        </a>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 transition-colors hover:bg-white/10"
          aria-label="Toggle menu"
          style={{ background: "rgba(255, 255, 255, 0.05)" }}
        >
          <div className="flex flex-col items-center justify-center w-5 h-5 space-y-1">
            <span
              className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
            ></span>
            <span
              className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
            ></span>
          </div>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm md:hidden">
          <div
            className="absolute top-24 left-4 right-4 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6"
            style={{ background: "rgba(255, 255, 255, 0.1)" }}
          >
            <nav className="flex flex-col space-y-4">
              <a
                href="/"
                className="text-left px-4 py-3 text-lg font-medium text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                Create Token
              </a>
              <a
                href="/"
                className="text-left px-4 py-3 text-lg font-medium text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                Create Pool
              </a>
              <a
                href="/"
                className="text-left px-4 py-3 text-lg font-medium text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                Swap
              </a>
              <a
                href="/"
                className="text-left px-4 py-3 text-lg font-medium text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                Registry
              </a>
              <div className="border-t border-white/20 pt-4 mt-4 flex flex-col space-y-3">
                <button
                  onClick={handleWalletConnect}
                  className="px-4 py-3 text-lg font-bold text-center rounded-lg transition-all duration-200 border bg-gradient-to-r from-red-900 to-red-600 border-red-400/30 text-white"
                >
                  Hubungi Kami
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
