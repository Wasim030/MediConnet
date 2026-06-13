import React, { useState, useRef, useEffect } from 'react';
import { navbarStyles } from '../assets/dummyStyles';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { SignedIn, SignedOut, useClerk, UserButton } from '@clerk/clerk-react';
import { User, LogIn, X, Menu } from 'lucide-react';
import logo from '../assets/logo.png';

const STORAGE_KEY = "doctorToken_v1";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(() => {
        try {
            return Boolean(localStorage.getItem(STORAGE_KEY));
        } catch {
            return false;
        }
    });

    const location = useLocation();
    const navRef = useRef(null);
    const clerk = useClerk();
    const navigate = useNavigate();

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 80) {
                setShowNavbar(false);
            } else {
                setShowNavbar(true);
            }
            setLastScrollY(currentScrollY);
            setScrolled(currentScrollY > 50);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && navRef.current && !navRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    
  // ── Scroll: hide/show navbar + glassmorphism toggle ──
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 10);

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowNavbar(false);
        setIsOpen(false);
      } else {
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // ── Sync doctor login state across tabs ──
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setIsDoctorLoggedIn(Boolean(e.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ── Close mobile menu on outside click ──
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // ── Close mobile menu on route change ──
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // ── Lock body scroll when mobile menu is open ──
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);


    const navItems = [
        { label: "Home", href: "/" },
        { label: "Doctors", href: "/doctors" },
        { label: "Services", href: "/services" },
        { label: "Appointments", href: "/appointments" },
        { label: "Contact", href: "/contact" },
    ];

    return (
        <>
            <div className={navbarStyles.navbarBorder}></div>
            <nav ref={navRef} className={`${navbarStyles.navbarContainer} ${
                showNavbar ? navbarStyles.navbarVisible : navbarStyles.navbarHidden
            }`}>
                <div className={navbarStyles.contentWrapper}>
                    <div className={navbarStyles.flexContainer}>
                        {/* Logo */}
                        <Link to='/' className={navbarStyles.logoLink}>
                            <div className={navbarStyles.logoContainer}>
                                <div className={navbarStyles.logoImageWrapper}>
                                    <img src={logo} alt="logo" className={navbarStyles.logoImage} />
                                </div>
                            </div>
                            <div className={navbarStyles.logoTextContainer}>
                                <h1 className={navbarStyles.logoTitle}>
                                    Mediconnect
                                </h1>
                                <p className={navbarStyles.logoSubtitle}>
                                    Healthcare Solutions
                                </p>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className={navbarStyles.desktopNav}>
                            <div className={navbarStyles.navItemsContainer}>
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.href;
                                    return (
                                        <Link key={item.href} to={item.href}
                                            className={`${navbarStyles.navItem} ${
                                                isActive ? navbarStyles.navItemActive : navbarStyles.navItemInactive
                                            }`}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right side */}
                        <div className={navbarStyles.rightContainer}>
                            <SignedOut>
                                <Link to='/doctor-admin/login' className={navbarStyles.doctorAdminButton}>
                                    <User className={navbarStyles.doctorAdminIcon} />
                                    <span className={navbarStyles.doctorAdminText}>
                                        Doctor Admin
                                    </span>
                                </Link>
                                
                                {/* Patient login */}
                                <button
                                    onClick={() => clerk.openSignIn()}
                                    className={navbarStyles.loginButton}
                                >
                                    <LogIn className={navbarStyles.loginIcon} />
                                    <span>Login</span>
                                </button>
                            </SignedOut>
                            
                            <SignedIn>
                                <UserButton afterSignOutUrl='/' />
                            </SignedIn>

                            {/* Mobile Toggle Button */}
                            <button 
                                onClick={() => setIsOpen(!isOpen)} 
                                className={navbarStyles.mobileToggle}
                            >
                                {isOpen ? (
                                    <X className={navbarStyles.toggleIcon} />
                                ) : (
                                    <Menu className={navbarStyles.toggleIcon} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu - Single version */}
                    {isOpen && (
                        <div className={navbarStyles.mobileMenu}>
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link 
                                        key={item.href} 
                                        to={item.href} 
                                        onClick={() => setIsOpen(false)}
                                        className={`${navbarStyles.mobileMenuItem} ${
                                            isActive ? navbarStyles.mobileMenuItemActive : navbarStyles.mobileMenuItemInactive
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                            <SignedOut>
                                <Link to='/doctor-admin/login' onClick={() => setIsOpen(false)} className={navbarStyles.mobileDoctorAdminButton}>
                                    Doctor Admin
                                </Link>
                                <div className={navbarStyles.mobileLoginContainer}>
                                    <button onClick={() => { clerk.openSignIn(); setIsOpen(false); }} className={navbarStyles.mobileLoginButton}>
                                    Login
                                </button>
                                </div>
                                
                            </SignedOut>
                            <SignedIn>
                                <div className={navbarStyles.mobileUserBtn}>
                                    <UserButton afterSignOutUrl='/' />
                                </div>
                            </SignedIn>
                        </div>
                    )}
                </div>
                <style>{navbarStyles.animationStyles}</style>
            </nav>
        </>
    );
};

export default Navbar;